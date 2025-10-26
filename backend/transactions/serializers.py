from rest_framework import serializers
from decimal import Decimal
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem
from .constants import get_currency_symbol


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
    currency_symbol = serializers.SerializerMethodField()

    def get_currency_symbol(self, obj):
        return get_currency_symbol(obj.currency)

    class Meta:
        model = Wallet
        fields = [
            'id',
            'name',
            'type',
            'initial_balance',
            'current_balance',
            'currency',
            'currency_symbol',
            'transaction_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()

    def get_transaction_count(self, obj):
        """Calculate the number of transactions using this category"""
        return Transaction.objects.filter(category=obj).count()

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
    category_icon = serializers.CharField(
        source='category.icon',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True
    )
    currency_symbol = serializers.SerializerMethodField()
    signed_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_signed_amount',
        help_text='Amount with sign based on type (negative for expenses)'
    )
    description = serializers.CharField(required=False, allow_blank=True)

    def get_currency_symbol(self, obj):
        return get_currency_symbol(obj.wallet.currency)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'wallet',
            'wallet_name',
            'type',
            'category',
            'category_name',
            'category_icon',
            'amount',
            'signed_amount',
            'currency_symbol',
            'description',
            'date',
            'recurrence',
            'recurrence_parent',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    percentage_spent = serializers.SerializerMethodField()
    period_start_date = serializers.SerializerMethodField()
    period_end_date = serializers.SerializerMethodField()
    period_display = serializers.SerializerMethodField()
    category_data = serializers.SerializerMethodField()
    # Keep legacy fields for backward compatibility
    percentage_used = serializers.SerializerMethodField()
    start_date = serializers.DateField(read_only=True)
    end_date = serializers.DateField(read_only=True)

    def get_spent_amount(self, obj):
        """Return spent amount as float"""
        return float(obj.spent_amount())

    def get_remaining_amount(self, obj):
        """Return remaining amount as float"""
        return float(obj.remaining_amount())

    def get_percentage_spent(self, obj):
        """Return percentage spent rounded to 1 decimal as float"""
        percentage = obj.percentage_used()
        return round(float(percentage), 1)

    def get_percentage_used(self, obj):
        """Legacy field - same as percentage_spent"""
        return self.get_percentage_spent(obj)

    def get_period_start_date(self, obj):
        """Return start date of current period as ISO string"""
        return obj.start_date.isoformat()

    def get_period_end_date(self, obj):
        """Return end date of current period as ISO string"""
        return obj.end_date.isoformat()

    def get_period_display(self, obj):
        """Return formatted period string for display"""
        from calendar import month_name

        start_date = obj.start_date
        end_date = obj.end_date

        if obj.period == 'monthly':
            # Format: "Oct 2025"
            return f"{month_name[start_date.month]} {start_date.year}"
        else:
            # Format: "Aug 2025 - Oct 2025"
            start_str = f"{month_name[start_date.month]} {start_date.year}"
            end_str = f"{month_name[end_date.month]} {end_date.year}"
            return f"{start_str} - {end_str}"

    def get_category_data(self, obj):
        """Return nested category data with name and icon"""
        return {
            'id': obj.category.id,
            'name': obj.category.name,
            'icon': obj.category.icon,
            'type': obj.category.type
        }

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_data',
            'amount',
            'spent_amount',
            'remaining_amount',
            'percentage_spent',
            'percentage_used',  # Legacy field
            'period',
            'period_start_date',
            'period_end_date',
            'period_display',
            'start_month',
            'start_date',  # Legacy field
            'end_date',  # Legacy field
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
    description = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert empty string recurrence to 'None' for consistency
        if data.get('recurrence') == '':
            data['recurrence'] = 'None'
        return data

    def to_internal_value(self, data):
        # Convert empty string recurrence to 'None' for consistency
        if 'recurrence' in data and data['recurrence'] == '':
            data = data.copy()
            data['recurrence'] = 'None'
        return super().to_internal_value(data)

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
    description = serializers.CharField(required=False, allow_blank=True)

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
    description = serializers.CharField()

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
