from rest_framework import serializers
from decimal import Decimal
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem


class WalletSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_current_balance'
    )
    transaction_count = serializers.IntegerField(
        read_only=True,
        source='transactions.count'
    )

    class Meta:
        model = Wallet
        fields = [
            'id',
            'name',
            'type',
            'initial_balance',
            'current_balance',
            'currency',
            'transaction_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.IntegerField(
        read_only=True,
        source='transactions.count'
    )

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'type',
            'icon',
            'is_active',
            'transaction_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True
    )
    signed_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_signed_amount',
        help_text='Amount with sign based on type (negative for expenses)'
    )
    description = serializers.CharField(source='desc', required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'wallet',
            'wallet_name',
            'type',
            'category',
            'category_name',
            'amount',
            'signed_amount',
            'description',
            'date',
            'recurrence',
            'recurrence_parent',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    spent_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='spent_amount'
    )
    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='remaining_amount'
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    start_date = serializers.DateField(source='start_date', read_only=True)
    end_date = serializers.DateField(read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_name',
            'amount',
            'spent_amount',
            'remaining_amount',
            'period',
            'start_month',
            'start_date',
            'end_date',
            'reset',
            'rollover',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'start_date', 'end_date']


class UpcomingTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True
    )
    description = serializers.CharField(source='desc', required=False, allow_blank=True)

    class Meta:
        model = UpcomingTransaction
        fields = [
            'id',
            'wallet',
            'wallet_name',
            'type',
            'category',
            'category_name',
            'amount',
            'description',
            'date',
            'recurrence',
            'recurrence_parent',
            'auto_post',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TransferSerializer(serializers.ModelSerializer):
    from_wallet_name = serializers.CharField(
        source='from_wallet.name',
        read_only=True
    )
    to_wallet_name = serializers.CharField(
        source='to_wallet.name',
        read_only=True
    )
    description = serializers.CharField(source='desc', required=False, allow_blank=True)

    class Meta:
        model = Transfer
        fields = [
            'id',
            'from_wallet',
            'from_wallet_name',
            'to_wallet',
            'to_wallet_name',
            'amount',
            'description',
            'date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class WishlistItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    description = serializers.CharField(source='desc')

    class Meta:
        model = WishlistItem
        fields = [
            'id',
            'description',
            'amount',
            'category',
            'category_name',
            'priority',
            'target',
            'is_completed',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
