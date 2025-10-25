from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from datetime import date
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem
from .serializers import (
    WalletSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    UpcomingTransactionSerializer,
    TransferSerializer,
    WishlistItemSerializer
)


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
        income = queryset.filter(type='income').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Calculate expenses
        expenses = queryset.filter(type='expense').aggregate(
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

        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter active budgets (current date falls within budget period)
        active_only = self.request.query_params.get('active', None)
        if active_only == 'true':
            today = date.today()
            # Filter budgets where today falls within their period
            active_budgets = []
            for budget in queryset:
                if budget.start_date <= today <= budget.end_date:
                    active_budgets.append(budget.id)
            queryset = queryset.filter(id__in=active_budgets)

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

        return queryset


class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer

    def get_queryset(self):
        queryset = Transfer.objects.all()

        # Filter by wallet (either from or to)
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(Q(from_wallet_id=wallet_id) | Q(to_wallet_id=wallet_id))

        return queryset


class WishlistItemViewSet(viewsets.ModelViewSet):
    queryset = WishlistItem.objects.all()
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        queryset = WishlistItem.objects.all()

        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)

        # Filter by completion status
        is_completed = self.request.query_params.get('is_completed', None)
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')

        return queryset
