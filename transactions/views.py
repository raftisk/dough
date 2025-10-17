from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from decimal import Decimal
from datetime import date, datetime
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer
from .serializers import (
    WalletSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    UpcomingTransactionSerializer
)
from .forms import ExpenseForm, IncomeForm, CategoryForm, WalletForm, TransferForm, BudgetForm
from .suggested_categories import SUGGESTED_CATEGORIES


def dashboard(request):
    """Dashboard view displaying financial overview and metrics"""
    # Get current month date range
    today = timezone.now().date()
    current_month = today.replace(day=1)
    if today.month == 12:
        next_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month + 1, day=1)

    # Calculate month metrics
    month_transactions = Transaction.objects.filter(
        date__gte=current_month,
        date__lt=next_month
    )

    total_income = month_transactions.filter(type=Transaction.INCOME).aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0.00')

    total_expenses = month_transactions.filter(type=Transaction.EXPENSE).aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0.00')

    net_savings = total_income - total_expenses

    # Get all wallets with their current balances
    wallets = Wallet.objects.all()
    for wallet in wallets:
        wallet.current_balance = wallet.get_current_balance()

    total_balance = sum(wallet.current_balance for wallet in wallets) if wallets else Decimal('0.00')

    # Get recent transactions (last 10)
    recent_transactions = Transaction.objects.select_related(
        'wallet', 'category'
    ).order_by('-date', '-created_at')[:10]

    # Get category breakdown for current month (expenses only)
    category_breakdown = month_transactions.filter(
        type=Transaction.EXPENSE
    ).values('category__name', 'category__id', 'category__type').annotate(
        total=Sum('amount')
    ).order_by('-total')

    # Add budget information to category breakdown
    for item in category_breakdown:
        category = Category.objects.filter(name=item['category__name']).first()
        if category:
            # Get active budget for this category (budget period contains today)
            budgets = Budget.objects.filter(category=category)
            active_budget = None

            for budget in budgets:
                if budget.start_date <= today <= budget.end_date:
                    active_budget = budget
                    break

            if active_budget:
                item['budget'] = {
                    'amount': active_budget.amount,
                    'spent': active_budget.spent_amount(),
                    'remaining': active_budget.remaining_amount(),
                    'percentage': active_budget.percentage_used()
                }

    context = {
        'current_month': current_month,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_savings': net_savings,
        'total_balance': total_balance,
        'wallets': wallets,
        'recent_transactions': recent_transactions,
        'category_breakdown': category_breakdown,
    }

    return render(request, 'transactions/dashboard.html', context)


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()

        # Filter by wallet
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(wallet_id=wallet_id)

        # Filter by type (income/expense)
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Returns income, expense, and balance summary for the current month
        Optionally filtered by wallet
        """
        # Get query parameters
        wallet_id = request.query_params.get('wallet', None)
        year = request.query_params.get('year', None)
        month = request.query_params.get('month', None)

        # Default to current month
        today = date.today()
        if not year:
            year = today.year
        if not month:
            month = today.month

        # Calculate date range for the month
        try:
            year = int(year)
            month = int(month)

            # First day of the month
            start_date = date(year, month, 1)

            # Last day of the month
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)

            # Adjust end_date to be the last day of the month
            from datetime import timedelta
            end_date = end_date - timedelta(days=1)

        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid year or month'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build queryset
        queryset = Transaction.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )

        if wallet_id:
            queryset = queryset.filter(wallet_id=wallet_id)

        # Calculate income
        income = queryset.filter(type=Transaction.INCOME).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Calculate expenses
        expenses = queryset.filter(type=Transaction.EXPENSE).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Calculate balance (income - expenses, both are positive amounts)
        balance = income - expenses

        return Response({
            'period': {
                'year': year,
                'month': month,
                'start_date': start_date,
                'end_date': end_date
            },
            'wallet_id': wallet_id,
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'transaction_count': queryset.count()
        })


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    def get_queryset(self):
        queryset = Budget.objects.all()

        # Filter by wallet
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(Q(wallet_id=wallet_id) | Q(wallet__isnull=True))

        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter active budgets (current date falls within budget period)
        active_only = self.request.query_params.get('active', None)
        if active_only == 'true':
            today = date.today()
            queryset = queryset.filter(start_date__lte=today, end_date__gte=today)

        return queryset


class UpcomingTransactionViewSet(viewsets.ModelViewSet):
    queryset = UpcomingTransaction.objects.all()
    serializer_class = UpcomingTransactionSerializer

    def get_queryset(self):
        queryset = UpcomingTransaction.objects.all()

        # Filter by wallet
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(wallet_id=wallet_id)

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset


# Form-based views

def add_expense(request):
    """View for adding a new expense"""
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Expense added successfully!')
            return redirect('dashboard')
    else:
        form = ExpenseForm()

    return render(request, 'transactions/add_expense.html', {'form': form})


def add_income(request):
    """View for adding a new income"""
    if request.method == 'POST':
        form = IncomeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Income added successfully!')
            return redirect('dashboard')
    else:
        form = IncomeForm()

    return render(request, 'transactions/add_income.html', {'form': form})


def transactions_log(request):
    """View for displaying all transactions and transfers with filters"""
    transactions = Transaction.objects.select_related('wallet', 'category').all()
    transfers = Transfer.objects.select_related('from_wallet', 'to_wallet').all()

    # Apply filters
    transaction_type = request.GET.get('type')
    category_id = request.GET.get('category')
    wallet_id = request.GET.get('wallet')

    # Filter for "transfer" type
    if transaction_type == 'transfer':
        transactions = Transaction.objects.none()  # No transactions
        if wallet_id:
            transfers = transfers.filter(
                Q(from_wallet_id=wallet_id) | Q(to_wallet_id=wallet_id)
            )
    else:
        # Regular transaction filters
        if transaction_type:
            transactions = transactions.filter(type=transaction_type)

        if category_id:
            transactions = transactions.filter(category_id=category_id)

        if wallet_id:
            transactions = transactions.filter(wallet_id=wallet_id)

        # If no type filter specified, include all transactions but no transfers
        if not transaction_type:
            transfers = Transfer.objects.none()

    # Combine and sort transactions and transfers
    from itertools import chain
    from operator import attrgetter

    # Add a 'item_type' attribute to differentiate
    for t in transactions:
        t.item_type = 'transaction'
    for t in transfers:
        t.item_type = 'transfer'

    # Combine and sort by date
    all_items = sorted(
        chain(transactions, transfers),
        key=attrgetter('date', 'created_at'),
        reverse=True
    )

    # Get limit for "load more" functionality
    limit = int(request.GET.get('limit', 20))
    has_more = len(all_items) > limit
    all_items = all_items[:limit]

    # Get all categories and wallets for filter dropdowns
    categories = Category.objects.filter(is_active=True).order_by('name')
    wallets = Wallet.objects.all().order_by('name')

    context = {
        'items': all_items,
        'categories': categories,
        'wallets': wallets,
        'has_more': has_more,
        'limit': limit,
    }

    return render(request, 'transactions/transactions_log.html', context)


def categories_log(request):
    """View for managing categories"""
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category added successfully!')
            return redirect('categories_log')
    else:
        form = CategoryForm()

    # Get filter parameter
    category_type = request.GET.get('type', 'expense')  # Default to expense

    # Filter categories by type
    if category_type == 'all':
        categories = Category.objects.filter(is_active=True).order_by('type', 'name')
    else:
        categories = Category.objects.filter(is_active=True, type=category_type).order_by('name')

    # Filter out already existing suggested categories
    existing_names = set(Category.objects.values_list('name', flat=True))
    suggested_expense = [cat for cat in SUGGESTED_CATEGORIES if cat['type'] == 'expense' and cat['name'] not in existing_names]
    suggested_income = [cat for cat in SUGGESTED_CATEGORIES if cat['type'] == 'income' and cat['name'] not in existing_names]

    context = {
        'form': form,
        'categories': categories,
        'suggested_expense': suggested_expense,
        'suggested_income': suggested_income,
        'current_type': category_type,
    }

    return render(request, 'transactions/categories_log.html', context)


def add_suggested_categories(request):
    """View to show all suggested categories for selection"""
    # Filter out already existing suggested categories
    existing_names = set(Category.objects.values_list('name', flat=True))
    suggested_expense = [cat for cat in SUGGESTED_CATEGORIES if cat['type'] == 'expense' and cat['name'] not in existing_names]
    suggested_income = [cat for cat in SUGGESTED_CATEGORIES if cat['type'] == 'income' and cat['name'] not in existing_names]

    existing_count = len([cat for cat in SUGGESTED_CATEGORIES if cat['name'] in existing_names])

    context = {
        'suggested_expense': suggested_expense,
        'suggested_income': suggested_income,
        'existing_count': existing_count,
    }

    return render(request, 'transactions/add_suggested_categories.html', context)


def add_suggested_category(request):
    """Quick add a suggested category"""
    if request.method == 'POST':
        name = request.POST.get('name')
        cat_type = request.POST.get('type')
        icon = request.POST.get('icon')
        color = request.POST.get('color')

        if name and cat_type:
            Category.objects.create(
                name=name,
                type=cat_type,
                icon=icon,
                color=color,
                is_active=True
            )
            messages.success(request, f'Category "{name}" added successfully!')

    return redirect('add_suggested_categories')


def edit_category(request, pk):
    """Edit a category"""
    category = get_object_or_404(Category, pk=pk)

    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category updated successfully!')
            return redirect('categories_log')
    else:
        form = CategoryForm(instance=category)

    context = {
        'form': form,
        'category': category,
        'editing': True,
    }

    return render(request, 'transactions/categories_log.html', context)


def delete_category(request, pk):
    """Delete a category"""
    if request.method == 'POST':
        category = get_object_or_404(Category, pk=pk)
        category_name = category.name

        # Check if category has transactions
        transaction_count = category.transactions.count()
        if transaction_count > 0:
            messages.error(
                request,
                f'Cannot delete category "{category_name}" because it has {transaction_count} associated transaction(s). '
                f'Please change the category of those transactions first.'
            )
        else:
            category.is_active = False
            category.save()
            messages.success(request, f'Category "{category_name}" removed successfully!')

    return redirect('categories_log')


def edit_transaction(request, pk):
    """Edit a transaction"""
    transaction = get_object_or_404(Transaction, pk=pk)

    if request.method == 'POST':
        if transaction.type == Transaction.EXPENSE:
            form = ExpenseForm(request.POST, instance=transaction)
        else:
            form = IncomeForm(request.POST, instance=transaction)

        if form.is_valid():
            form.save()
            messages.success(request, 'Transaction updated successfully!')
            return redirect('transactions_log')
    else:
        if transaction.type == Transaction.EXPENSE:
            form = ExpenseForm(instance=transaction)
        else:
            form = IncomeForm(instance=transaction)

    context = {
        'form': form,
        'transaction': transaction,
        'editing': True,
    }

    template = 'transactions/add_expense.html' if transaction.type == Transaction.EXPENSE else 'transactions/add_income.html'
    return render(request, template, context)


def delete_transaction(request, pk):
    """Delete a transaction"""
    if request.method == 'POST':
        transaction = get_object_or_404(Transaction, pk=pk)
        transaction.delete()
        messages.success(request, 'Transaction deleted successfully!')

    return redirect('transactions_log')


# Wallet CRUD Views

def wallet_list(request):
    """View for displaying all wallets"""
    wallets = Wallet.objects.all()

    # Calculate current balance for each wallet
    for wallet in wallets:
        wallet.current_balance = wallet.get_current_balance()

    context = {
        'wallets': wallets,
    }

    return render(request, 'wallets/wallet_log.html', context)


def wallet_create(request):
    """View for creating a new wallet"""
    if request.method == 'POST':
        form = WalletForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Wallet created successfully!')
            return redirect('wallet_list')
    else:
        form = WalletForm()

    context = {
        'form': form,
        'editing': False,
    }

    return render(request, 'wallets/add_wallet.html', context)


def wallet_edit(request, pk):
    """View for editing a wallet"""
    wallet = get_object_or_404(Wallet, pk=pk)

    if request.method == 'POST':
        form = WalletForm(request.POST, instance=wallet)
        if form.is_valid():
            form.save()
            messages.success(request, 'Wallet updated successfully!')
            return redirect('wallet_list')
    else:
        form = WalletForm(instance=wallet)

    context = {
        'form': form,
        'wallet': wallet,
        'editing': True,
    }

    return render(request, 'wallets/add_wallet.html', context)


def wallet_delete(request, pk):
    """View for deleting a wallet"""
    if request.method == 'POST':
        wallet = get_object_or_404(Wallet, pk=pk)
        wallet_name = wallet.name
        wallet.delete()
        messages.success(request, f'Wallet "{wallet_name}" deleted successfully!')

    return redirect('wallet_list')


# Transfer Views

def add_transfer(request):
    """View for adding a new transfer"""
    if request.method == 'POST':
        form = TransferForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Transfer completed successfully!')
                return redirect('dashboard')
            except Exception as e:
                messages.error(request, f'Transfer failed: {str(e)}')
    else:
        form = TransferForm()

    return render(request, 'transactions/add_transfer.html', {'form': form})


def edit_transfer(request, pk):
    """View for editing a transfer"""
    transfer = get_object_or_404(Transfer, pk=pk)

    if request.method == 'POST':
        form = TransferForm(request.POST, instance=transfer)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Transfer updated successfully!')
                return redirect('transactions_log')
            except Exception as e:
                messages.error(request, f'Transfer update failed: {str(e)}')
    else:
        form = TransferForm(instance=transfer)

    context = {
        'form': form,
        'transfer': transfer,
        'editing': True,
    }

    return render(request, 'transactions/add_transfer.html', context)


def delete_transfer(request, pk):
    """View for deleting a transfer"""
    if request.method == 'POST':
        transfer = get_object_or_404(Transfer, pk=pk)
        transfer.delete()
        messages.success(request, 'Transfer deleted successfully!')

    return redirect('transactions_log')


# Budget CRUD Views

def budget_log(request):
    """View for displaying all budgets with progress bars and statistics"""
    budgets = Budget.objects.select_related('category').all()

    # Calculate additional data for each budget
    for budget in budgets:
        budget.spent = budget.spent_amount()
        budget.remaining = budget.remaining_amount()
        budget.percentage = budget.percentage_used()
        budget.over_budget = budget.is_over_budget()

        # Determine status
        if budget.over_budget:
            budget.status = 'over'
            budget.status_color = 'red'
        elif budget.percentage >= 80:
            budget.status = 'warning'
            budget.status_color = 'yellow'
        else:
            budget.status = 'on-track'
            budget.status_color = 'green'

    # Get filter parameters
    category_id = request.GET.get('category')
    status_filter = request.GET.get('status')

    # Apply filters
    if category_id:
        budgets = [b for b in budgets if b.category.id == int(category_id)]

    if status_filter:
        budgets = [b for b in budgets if b.status == status_filter]

    # Get categories for filter dropdown
    categories = Category.objects.filter(is_active=True).order_by('name')

    context = {
        'budgets': budgets,
        'categories': categories,
    }

    return render(request, 'budgets/budget_log.html', context)


def budget_create(request):
    """View for creating a new budget"""
    if request.method == 'POST':
        form = BudgetForm(request.POST)
        if form.is_valid():
            try:
                budget = form.save(commit=False)
                budget.full_clean()  # Run model validation
                budget.save()
                messages.success(request, 'Budget created successfully!')
                return redirect('budget_log')
            except Exception as e:
                messages.error(request, f'Budget creation failed: {str(e)}')
    else:
        form = BudgetForm()

    context = {
        'form': form,
        'editing': False,
    }

    return render(request, 'budgets/budget_form.html', context)


def budget_edit(request, pk):
    """View for editing a budget"""
    budget = get_object_or_404(Budget, pk=pk)

    if request.method == 'POST':
        form = BudgetForm(request.POST, instance=budget)
        if form.is_valid():
            try:
                budget = form.save(commit=False)
                budget.full_clean()  # Run model validation
                budget.save()
                messages.success(request, 'Budget updated successfully!')
                return redirect('budget_log')
            except Exception as e:
                messages.error(request, f'Budget update failed: {str(e)}')
    else:
        form = BudgetForm(instance=budget)

    context = {
        'form': form,
        'budget': budget,
        'editing': True,
    }

    return render(request, 'budgets/budget_form.html', context)


def budget_delete(request, pk):
    """View for deleting a budget"""
    budget = get_object_or_404(Budget, pk=pk)

    if request.method == 'POST':
        budget_name = f"{budget.category.name} - {budget.get_period_display()}"
        budget.delete()
        messages.success(request, f'Budget "{budget_name}" deleted successfully!')
        return redirect('budget_log')

    context = {
        'budget': budget,
    }

    return render(request, 'budgets/budget_confirm_delete.html', context)
