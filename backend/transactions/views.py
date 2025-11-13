from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from datetime import date
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem, Template
from .serializers import (
    WalletSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    UpcomingTransactionSerializer,
    TransferSerializer,
    WishlistItemSerializer,
    TemplateSerializer
)


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer

    def get_queryset(self):
        """Filter wallets by current user"""
        return Wallet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Auto-populate user when creating wallet"""
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Filter categories by current user"""
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Auto-populate user when creating category"""
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Filter by current user's wallets
        queryset = Transaction.objects.filter(wallet__user=self.request.user)

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

    def create(self, request, *args, **kwargs):
        """Override create to handle future-dated transactions"""
        from datetime import datetime

        data = request.data.copy()

        # Parse transaction date
        transaction_date_str = data.get('date')
        if not transaction_date_str:
            return Response(
                {'error': 'Date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            transaction_date = datetime.strptime(transaction_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        today = date.today()

        # If date is in future, create UpcomingTransaction
        if transaction_date > today:
            serializer = UpcomingTransactionSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            upcoming = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Otherwise, create regular Transaction
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # If has recurrence, create first upcoming transaction
        if transaction.recurrence and transaction.recurrence != 'none':
            next_date = transaction.calculate_next_date()
            if next_date:
                UpcomingTransaction.objects.create(
                    description=transaction.description,
                    amount=transaction.amount,
                    type=transaction.type,
                    category=transaction.category,
                    wallet=transaction.wallet,
                    date=next_date,
                    recurrence=transaction.recurrence,
                    recurrence_parent=transaction,
                    auto_post=data.get('auto_post', False),
                )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override update to handle date changes from past/today to future"""
        from datetime import datetime

        instance = self.get_object()
        data = request.data.copy()

        # Check if date is being changed
        new_date_str = data.get('date')
        if new_date_str:
            try:
                new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = date.today()

            # If date is being changed to future, convert to UpcomingTransaction
            if new_date > today:
                # Prepare data for UpcomingTransaction
                upcoming_data = {
                    'description': data.get('description', instance.description),
                    'amount': data.get('amount', instance.amount),
                    'type': data.get('type', instance.type),
                    'category': data.get('category', instance.category.id),
                    'wallet': data.get('wallet', instance.wallet.id),
                    'date': new_date_str,
                    'recurrence': data.get('recurrence', instance.recurrence),
                    'recurrence_parent': instance.recurrence_parent.id if instance.recurrence_parent else None,
                    'auto_post': data.get('auto_post', False),
                }

                # Create UpcomingTransaction
                upcoming_serializer = UpcomingTransactionSerializer(data=upcoming_data)
                upcoming_serializer.is_valid(raise_exception=True)
                upcoming = upcoming_serializer.save()

                # Delete original Transaction
                instance.delete()

                return Response({
                    'converted': True,
                    'message': 'Transaction converted to Upcoming Transaction (future date)',
                    'upcoming_transaction': upcoming_serializer.data
                }, status=status.HTTP_200_OK)

        # Normal update if date is not changed or stays <= today
        return super().update(request, *args, **kwargs)

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

        # Build queryset - filter by current user's wallets
        queryset = Transaction.objects.filter(
            wallet__user=request.user,
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
        # Filter by current user
        queryset = Budget.objects.filter(user=self.request.user)

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

    def perform_create(self, serializer):
        """Auto-populate user when creating budget"""
        serializer.save(user=self.request.user)


class UpcomingTransactionViewSet(viewsets.ModelViewSet):
    queryset = UpcomingTransaction.objects.all()
    serializer_class = UpcomingTransactionSerializer

    def get_queryset(self):
        # Filter by current user's wallets
        queryset = UpcomingTransaction.objects.filter(wallet__user=self.request.user)

        # Filter by wallet
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(wallet_id=wallet_id)

        return queryset

    def update(self, request, *args, **kwargs):
        """Override update to handle date changes from future to past/today"""
        from datetime import datetime

        instance = self.get_object()
        data = request.data.copy()

        # Check if date is being changed
        new_date_str = data.get('date')
        if new_date_str:
            try:
                new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = date.today()

            # If date is being changed to past/today, convert to Transaction
            if new_date <= today:
                # First update the instance with new data
                serializer = self.get_serializer(instance, data=data, partial=kwargs.get('partial', False))
                serializer.is_valid(raise_exception=True)
                serializer.save()

                # Refresh instance to get updated values
                instance.refresh_from_db()

                # Check auto_post to decide behavior
                if instance.auto_post:
                    # Post automatically
                    transaction = instance.post_transaction()
                    return Response({
                        'converted': True,
                        'auto_posted': True,
                        'message': 'Upcoming Transaction posted automatically (date is due and auto_post enabled)',
                        'transaction': TransactionSerializer(transaction).data
                    }, status=status.HTTP_200_OK)
                else:
                    # Convert to Transaction manually (similar to post_transaction but explicit)
                    transaction = Transaction.objects.create(
                        description=instance.description,
                        amount=instance.amount,
                        type=instance.type,
                        category=instance.category,
                        wallet=instance.wallet,
                        date=instance.date,
                        recurrence=instance.recurrence,
                        recurrence_parent=instance.recurrence_parent,
                    )

                    # If recurring, create next upcoming transaction
                    if instance.recurrence and instance.recurrence != 'none':
                        next_date = instance.calculate_next_date()
                        if next_date:
                            UpcomingTransaction.objects.create(
                                description=instance.description,
                                amount=instance.amount,
                                type=instance.type,
                                category=instance.category,
                                wallet=instance.wallet,
                                date=next_date,
                                recurrence=instance.recurrence,
                                recurrence_parent=instance.recurrence_parent or transaction,
                                auto_post=instance.auto_post,
                            )

                    # Delete this upcoming transaction
                    instance.delete()

                    return Response({
                        'converted': True,
                        'auto_posted': False,
                        'message': 'Upcoming Transaction converted to Transaction (date is due)',
                        'transaction': TransactionSerializer(transaction).data
                    }, status=status.HTTP_200_OK)

        # Normal update if date is not changed or stays > today
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def post_now(self, request, pk=None):
        """Post this upcoming transaction immediately"""
        upcoming = self.get_object()
        transaction = upcoming.post_transaction()
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def skip(self, request, pk=None):
        """Skip this occurrence and create next if recurring"""
        upcoming = self.get_object()
        upcoming.skip_occurrence()
        return Response({'message': 'Skipped successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def skip_all(self, request, pk=None):
        """Skip this and all future occurrences in recurrence chain"""
        upcoming = self.get_object()
        parent = upcoming.recurrence_parent

        # If this has a parent, delete all siblings with same parent
        if parent:
            UpcomingTransaction.objects.filter(
                recurrence_parent=parent
            ).delete()

        # Delete current one too
        upcoming.delete()

        return Response({'message': 'All future occurrences skipped'}, status=status.HTTP_200_OK)


class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer

    def get_queryset(self):
        # Filter by current user's wallets (either from or to)
        queryset = Transfer.objects.filter(
            Q(from_wallet__user=self.request.user) | Q(to_wallet__user=self.request.user)
        )

        # Filter by wallet (either from or to)
        wallet_id = self.request.query_params.get('wallet', None)
        if wallet_id:
            queryset = queryset.filter(Q(from_wallet_id=wallet_id) | Q(to_wallet_id=wallet_id))

        return queryset


class WishlistItemViewSet(viewsets.ModelViewSet):
    queryset = WishlistItem.objects.all()
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        # Filter by current user
        queryset = WishlistItem.objects.filter(user=self.request.user)

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

    def perform_create(self, serializer):
        """Auto-populate user when creating wishlist item"""
        serializer.save(user=self.request.user)


class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

    def get_queryset(self):
        """Filter templates by current user"""
        return Template.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Auto-populate user when creating template"""
        serializer.save(user=self.request.user)
