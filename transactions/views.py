from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from decimal import Decimal
from datetime import date, datetime
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction
from .serializers import (
    WalletSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    UpcomingTransactionSerializer
)
from .forms import ExpenseForm, IncomeForm, CategoryForm, SUGGESTED_CATEGORIES


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
    ).values('category__name').annotate(
        total=Sum('amount')
    ).order_by('-total')

    # Add budget information to category breakdown
    for item in category_breakdown:
        category = Category.objects.filter(name=item['category__name']).first()
        if category:
            # Get active budget for this category
            budget = Budget.objects.filter(
                category=category,
                start_date__lte=today,
                end_date__gte=today
            ).first()

            if budget:
                item['budget'] = {
                    'amount': budget.amount,
                    'remaining': budget.get_remaining_amount()
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
    """View for displaying all transactions with filters"""
    transactions = Transaction.objects.select_related('wallet', 'category').all()

    # Apply filters
    transaction_type = request.GET.get('type')
    category_id = request.GET.get('category')
    wallet_id = request.GET.get('wallet')

    if transaction_type:
        transactions = transactions.filter(type=transaction_type)

    if category_id:
        transactions = transactions.filter(category_id=category_id)

    if wallet_id:
        transactions = transactions.filter(wallet_id=wallet_id)

    # Order by date descending
    transactions = transactions.order_by('-date', '-created_at')

    # Get limit for "load more" functionality
    limit = int(request.GET.get('limit', 10))
    has_more = transactions.count() > limit
    transactions = transactions[:limit]

    # Get all categories and wallets for filter dropdowns
    categories = Category.objects.filter(is_active=True).order_by('name')
    wallets = Wallet.objects.all().order_by('name')

    context = {
        'transactions': transactions,
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

    categories = Category.objects.filter(is_active=True).order_by('name')

    # Filter out already existing suggested categories
    existing_names = set(categories.values_list('name', flat=True))
    suggested_categories = [cat for cat in SUGGESTED_CATEGORIES if cat['name'] not in existing_names]

    context = {
        'form': form,
        'categories': categories,
        'suggested_categories': suggested_categories,
    }

    return render(request, 'transactions/categories_log.html', context)


def add_suggested_category(request):
    """Quick add a suggested category"""
    if request.method == 'POST':
        name = request.POST.get('name')
        icon = request.POST.get('icon')
        color = request.POST.get('color')

        if name:
            Category.objects.create(
                name=name,
                icon=icon,
                color=color,
                is_active=True
            )
            messages.success(request, f'Category "{name}" added successfully!')

    return redirect('categories_log')


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
