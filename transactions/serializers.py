from rest_framework import serializers
from decimal import Decimal
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction


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
            'icon',
            'color',
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
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    spent_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_spent_amount'
    )
    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_remaining_amount'
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_name',
            'wallet',
            'wallet_name',
            'amount',
            'spent_amount',
            'remaining_amount',
            'start_date',
            'end_date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validate date range"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })

        return data


class UpcomingTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True
    )

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
            'next_date',
            'frequency',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
