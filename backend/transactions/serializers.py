from rest_framework import serializers
from decimal import Decimal
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem, Template
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
    wallet_currency = serializers.CharField(
        source='wallet.currency',
        read_only=True,
        help_text='Currency code from parent wallet (e.g., EUR, USD)'
    )
    currency_symbol = serializers.SerializerMethodField()
    signed_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='get_signed_amount',
        help_text='Amount with sign based on type (negative for expenses)'
    )
    is_posted = serializers.SerializerMethodField()
    description = serializers.CharField(required=False, allow_blank=True)

    def get_currency_symbol(self, obj):
        return get_currency_symbol(obj.wallet.currency)

    def get_is_posted(self, obj):
        from datetime import date
        return obj.date <= date.today()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'wallet',
            'wallet_name',
            'wallet_currency',
            'type',
            'category',
            'category_name',
            'category_icon',
            'amount',
            'signed_amount',
            'currency_symbol',
            'is_posted',
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
    categories_data = serializers.SerializerMethodField()
    spent_per_category = serializers.SerializerMethodField()
    upcoming_amount = serializers.SerializerMethodField()
    currency_symbol = serializers.SerializerMethodField()
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

    def get_categories_data(self, obj):
        """Return list of category data"""
        return [
            {
                'id': cat.id,
                'name': cat.name,
                'icon': cat.icon,
                'type': cat.type
            }
            for cat in obj.categories.all()
        ]

    def get_spent_per_category(self, obj):
        """Return spending breakdown by category"""
        per_category = obj.spent_amount_per_category()
        # Convert Decimal values to float for JSON serialization
        return {str(cat_id): float(amount) for cat_id, amount in per_category.items()}

    def get_upcoming_amount(self, obj):
        """Return upcoming spending amount"""
        return float(obj.upcoming_amount())

    def get_currency_symbol(self, obj):
        """
        Return currency symbol for budget display using user's default currency.
        """
        try:
            user_currency = obj.user.preferences.default_currency
            return get_currency_symbol(user_currency)
        except Exception:
            # Fallback if preferences don't exist
            from .constants import FALLBACK_CURRENCY
            return get_currency_symbol(FALLBACK_CURRENCY)

    class Meta:
        model = Budget
        fields = [
            'id',
            'name',
            'categories',
            'categories_data',
            'spent_per_category',
            'upcoming_amount',
            'amount',
            'spent_amount',
            'remaining_amount',
            'percentage_spent',
            'percentage_used',  # Legacy field
            'currency_symbol',
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
    category_icon = serializers.CharField(
        source='category.icon',
        read_only=True
    )
    wallet_name = serializers.CharField(
        source='wallet.name',
        read_only=True
    )
    wallet_currency = serializers.CharField(
        source='wallet.currency',
        read_only=True
    )
    currency_symbol = serializers.SerializerMethodField()
    is_posted = serializers.SerializerMethodField()
    description = serializers.CharField(required=False, allow_blank=True)

    def get_currency_symbol(self, obj):
        return get_currency_symbol(obj.wallet.currency)

    def get_is_posted(self, obj):
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert empty string recurrence to 'none' for consistency
        if data.get('recurrence') == '':
            data['recurrence'] = 'none'
        return data

    def to_internal_value(self, data):
        # Convert empty string recurrence to 'none' for consistency
        if 'recurrence' in data and data['recurrence'] == '':
            data = data.copy()
            data['recurrence'] = 'none'
        return super().to_internal_value(data)

    class Meta:
        model = UpcomingTransaction
        fields = [
            'id',
            'wallet',
            'wallet_name',
            'wallet_currency',
            'type',
            'category',
            'category_name',
            'category_icon',
            'amount',
            'currency_symbol',
            'is_posted',
            'description',
            'date',
            'recurrence',
            'recurrence_parent',
            'auto_post',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'recurrence_parent']


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
    category_icon = serializers.CharField(
        source='category.icon',
        read_only=True
    )
    description = serializers.CharField(required=True, allow_blank=False, max_length=500)
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        min_value=Decimal('0.01')
    )
    target = serializers.CharField(
        required=True,
        help_text='Target month in YYYY-MM format'
    )

    def validate_description(self, value):
        """Validate description is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()

    def validate_target(self, value):
        """Validate target is in correct YYYY-MM format"""
        import re
        if not re.match(r'^\d{4}-\d{2}$', str(value)):
            raise serializers.ValidationError("Target must be in YYYY-MM format.")
        return value

    class Meta:
        model = WishlistItem
        fields = [
            'id',
            'description',
            'amount',
            'category',
            'category_name',
            'category_icon',
            'priority',
            'target',
            'is_completed',
            'use_savings',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TemplateSerializer(serializers.ModelSerializer):
    category_data = serializers.SerializerMethodField()
    wallet_data = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    def get_category_data(self, obj):
        """Return nested category data"""
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'icon': obj.category.icon,
                'type': obj.category.type
            }
        return None

    def get_wallet_data(self, obj):
        """Return nested wallet data"""
        return {
            'id': obj.wallet.id,
            'name': obj.wallet.name,
            'type': obj.wallet.type,
            'currency': obj.wallet.currency
        }

    class Meta:
        model = Template
        fields = [
            'id',
            'user',
            'description',
            'type',
            'category',
            'category_data',
            'amount',
            'wallet',
            'wallet_data',
            'created_at'
        ]
        read_only_fields = ['created_at', 'user']
