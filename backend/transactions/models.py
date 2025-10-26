from datetime import date
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from month.models import MonthField
from month import Month
from .constants import (
    WALLET_TYPES, CURRENCIES, DEFAULT_CURRENCY, CATEGORY_TYPES,
    TRANSACTION_TYPES, RECURRENCE_CHOICES, PERIOD_CHOICES, PRIORITY_CHOICES,
    MONEY_FIELD_CONFIG
)

def get_current_month():
    return Month.from_date(date.today())

class Wallet(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=15,
        choices=WALLET_TYPES,
        default='spending'
    )
    initial_balance = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        default=Decimal('0.00')
    )
    currency = models.CharField(
        max_length=3,
        choices=CURRENCIES,
        default=DEFAULT_CURRENCY
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    def get_current_balance(self):
        """Calculate current balance including all transactions and transfers"""
        from django.db.models import Case, When, F

        # Sum with appropriate signs based on transaction type
        transactions_sum = self.transactions.aggregate(
            total=models.Sum(
                Case(
                    When(type='expense', then=-F('amount')),
                    default=F('amount')
                )
            )
        )['total'] or Decimal('0.00')

        # Sum transfers in (money received)
        transfers_in_sum = self.transfers_in.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

        # Sum transfers out (money sent)
        transfers_out_sum = self.transfers_out.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

        return self.initial_balance + transactions_sum + transfers_in_sum - transfers_out_sum


class Category(models.Model):
    """
    Category represents a classification for transactions.
    Examples: 'Eating out', 'Transportation', 'Salary', 'Investments'
    Categories are user-configurable.
    """
    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(
        max_length=10,
        choices=CATEGORY_TYPES,
        default='expense'
    )
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['type', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Prevent deletion if category has transactions
        if self.pk and not self.is_active:
            transaction_count = self.transactions.count()
            if transaction_count > 0:
                raise ValidationError({
                    '__all__': f'Cannot deactivate category "{self.name}" because it has {transaction_count} associated transaction(s). Please change the category of those transactions first.'
                })


class Transaction(models.Model):
    description = models.TextField(blank=True)
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    amount = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Always positive, type determines if income or expense'
    )
    date = models.DateField()
    recurrence = models.CharField(
        max_length=10,
        choices=RECURRENCE_CHOICES,
        blank=True,
        null=True,
        default='None',
        help_text='Recurrence pattern for recurring transactions'
    )
    recurrence_parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recurrence_children',
        help_text='Parent transaction for recurring transactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['-date']),
            models.Index(fields=['wallet', '-date']),
            models.Index(fields=['type', '-date']),
        ]

    def __str__(self):
        return f"{self.get_type_display()}: {self.category.name} - {self.amount} on {self.date}"

    def get_signed_amount(self):
        """Return amount with appropriate sign based on transaction type"""
        if self.type == 'expense':
            return -abs(self.amount)
        return abs(self.amount)

    def is_recurring(self):
        """Check if this transaction is recurring"""
        return bool(self.recurrence and self.recurrence != 'None')

    # @property
    # def description(self):
    #     """Alias for description to maintain backward compatibility"""
    #     return self.description

    # @description.setter
    # def description(self, value):
    #     """Alias setter for description to maintain backward compatibility"""
    #     self.description = value


class Budget(models.Model):
    """Budgets are only for expense tracking"""
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    amount = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    period = models.CharField(
        max_length=15,
        choices=PERIOD_CHOICES,
        default='monthly'
    )
    start_month = MonthField(
        default=get_current_month
    )
    reset = models.BooleanField(
        default=True,
        help_text='True for recurring budgets'
    )
    rollover = models.BooleanField(
        default=False,
        help_text='Rollover remaining budget to next period (only if reset is True)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_month']

    def __str__(self):
        return f"{self.category.name} - {self.get_period_display()} budget"

    @property
    def start_date(self):
        """Get the first day of the start month"""
        return self.start_month.first_day()

    @property
    def end_date(self):
        """Calculate end date based on start_month and period"""
        from dateutil.relativedelta import relativedelta
        from calendar import monthrange

        if self.period == 'monthly':
            # Last day of start_month
            year = self.start_month.year
            month = self.start_month.month
            last_day = monthrange(year, month)[1]
            return date(year, month, last_day)
        elif self.period == 'quarterly':
            # 3 months from start_month, last day of that month
            end_month = self.start_month.first_day() + relativedelta(months=3) - relativedelta(days=1)
            return end_month
        elif self.period == '6-month':
            # 6 months from start_month, last day of that month
            end_month = self.start_month.first_day() + relativedelta(months=6) - relativedelta(days=1)
            return end_month
        elif self.period == 'yearly':
            # 12 months from start_month, last day of that month
            end_month = self.start_month.first_day() + relativedelta(months=12) - relativedelta(days=1)
            return end_month

        return self.start_date

    def spent_amount(self):
        """Calculate total spent in this budget period"""
        filters = {
            'type': 'expense',
            'category': self.category,
            'date__gte': self.start_date,
            'date__lte': self.end_date,
        }

        spent = Transaction.objects.filter(**filters).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

        return Decimal(str(spent)).quantize(Decimal('0.01'))

    def remaining_amount(self):
        """Calculate remaining budget"""
        remaining = self.amount - self.spent_amount()
        return Decimal(str(remaining)).quantize(Decimal('0.01'))

    def percentage_used(self):
        """Calculate percentage of budget used"""
        if self.amount <= 0:
            return Decimal('0.00')
        percentage = (self.spent_amount() / self.amount) * 100
        return Decimal(str(percentage)).quantize(Decimal('0.01'))

    def is_over_budget(self):
        """Check if spending exceeds budget"""
        return self.spent_amount() > self.amount

    def clean(self):
        from django.core.exceptions import ValidationError

        # Ensure amount is positive (already handled by validator, but double check)
        if self.amount and self.amount <= 0:
            raise ValidationError({
                'amount': 'Amount must be positive.'
            })

        # Prevent duplicate budgets for same category and overlapping periods
        if self.category and self.start_month:
            end = self.end_date

            # Find overlapping budgets for the same category
            overlapping = Budget.objects.filter(
                category=self.category,
            ).exclude(pk=self.pk)

            for budget in overlapping:
                if budget.end_date >= self.start_date and budget.start_date <= end:
                    raise ValidationError({
                        'start_month': f'A budget for {self.category.name} already exists for this period.'
                    })

        # Validate rollover only works with reset
        if self.rollover and not self.reset:
            raise ValidationError({
                'rollover': 'Rollover can only be enabled when reset is True.'
            })


class UpcomingTransaction(Transaction):
    """
    UpcomingTransaction extends Transaction for scheduled future transactions.
    Uses multi-table inheritance to inherit all Transaction fields.
    """
    auto_post = models.BooleanField(
        default=False,
        help_text='If True, automatically convert to Transaction on scheduled date'
    )

    class Meta:
        ordering = ['date', '-created_at']

    def __str__(self):
        recurring = " (Recurring)" if self.is_recurring() else ""
        return f"Upcoming: {self.get_type_display()} - {self.category.name} - {self.amount} on {self.date}{recurring}"


class Transfer(models.Model):
    """Transfer money between wallets"""
    description = models.TextField(blank=True)
    from_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transfers_out'
    )
    to_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transfers_in'
    )
    amount = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Must be positive'
    )
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['-date']),
            models.Index(fields=['from_wallet', '-date']),
            models.Index(fields=['to_wallet', '-date']),
        ]

    def __str__(self):
        return f"Transfer: {self.amount} from {self.from_wallet.name} to {self.to_wallet.name}"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Prevent transfer from wallet to itself
        if self.from_wallet_id and self.to_wallet_id and self.from_wallet_id == self.to_wallet_id:
            raise ValidationError({
                'to_wallet': 'Cannot transfer to the same wallet.'
            })

        # Ensure amount is positive
        if self.amount and self.amount <= 0:
            raise ValidationError({
                'amount': 'Amount must be positive.'
            })

        # Prevent amount exceeding current balance of from_wallet
        if self.from_wallet_id and self.amount:
            current_balance = self.from_wallet.get_current_balance()
            if self.amount > current_balance:
                raise ValidationError({
                    'amount': f'Insufficient balance. Current balance: {current_balance}'
                })

    # @property
    # def description(self):
    #     """Alias for description to maintain backward compatibility"""
    #     return self.description

    # @description.setter
    # def description(self, value):
    #     """Alias setter for description to maintain backward compatibility"""
    #     self.description = value

    # def save(self, *args, **kwargs):
    #     self.full_clean()
    #     super().save(*args, **kwargs)


class WishlistItem(models.Model):
    """Wishlist items for tracking savings goals"""
    description = models.TextField()
    amount = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='wishlist_items'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    target = MonthField(
        default=get_current_month,
        help_text='Target month to purchase this item'
    )
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target', '-priority', '-created_at']

    def __str__(self):
        return f"{self.description} - {self.amount} (Target: {self.target})"

    # @property
    # def description(self):
    #     """Alias for description to maintain backward compatibility"""
    #     return self.description

    # @description.setter
    # def description(self, value):
    #     """Alias setter for description to maintain backward compatibility"""
    #     self.description = value


