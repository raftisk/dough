from datetime import date, timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import MinValueValidator
from decimal import Decimal
from month.models import MonthField
from month import Month
from dateutil.relativedelta import relativedelta
from .constants import (
    WALLET_TYPES, CURRENCIES, DEFAULT_CURRENCY, CATEGORY_TYPES,
    TRANSACTION_TYPES, RECURRENCE_CHOICES, PERIOD_CHOICES, PRIORITY_CHOICES,
    MONEY_FIELD_CONFIG
)

def get_current_month():
    return Month.from_date(date.today())


class UserManager(BaseUserManager):

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=150)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.email


class UserPreferences(models.Model):
    """User preferences for customization"""
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    default_currency = models.CharField(
        max_length=3,
        choices=CURRENCIES,
        default=DEFAULT_CURRENCY
    )
    default_wallet = models.ForeignKey(
        'Wallet',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='light'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User Preferences'

    def __str__(self):
        return f"{self.user.email} preferences"


class Wallet(models.Model):
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='wallets'
    )
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
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='categories'
    )
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
        default='none',
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

    def clean(self):
        from django.core.exceptions import ValidationError

        # Ensure Transaction date is not in the future
        if self.date and self.date > date.today():
            raise ValidationError({
                'date': 'Transaction date cannot be in the future. Use Upcoming Transactions for future dates.'
            })

    def get_signed_amount(self):
        """Return amount with appropriate sign based on transaction type"""
        if self.type == 'expense':
            return -abs(self.amount)
        return abs(self.amount)

    def is_recurring(self):
        """Check if this transaction is recurring"""
        return bool(self.recurrence and self.recurrence != 'none')

    def calculate_next_date(self):
        """Calculate next recurrence date based on current date and recurrence pattern"""
        if not self.recurrence or self.recurrence == 'none':
            return None

        if self.recurrence == 'daily':
            return self.date + timedelta(days=1)
        elif self.recurrence == 'weekly':
            return self.date + timedelta(weeks=1)
        elif self.recurrence == 'monthly':
            return self.date + relativedelta(months=1)
        elif self.recurrence == 'yearly':
            return self.date + relativedelta(years=1)

        return None


class Budget(models.Model):
    """Budgets are only for expense tracking"""
    name = models.CharField(
        max_length=100,
    )
    categories = models.ManyToManyField(
        Category,
        related_name='budgets',
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
        return f"{self.name} - {self.get_period_display()} budget"

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
        """Calculate total spent across ALL categories for past/present only"""
        today = date.today()
        filters = {
            'type': 'expense',
            'category__in': self.categories.all(),
            'date__gte': self.start_date,
            'date__lte': min(self.end_date, today),
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

    def spent_amount_per_category(self):
        """Return dict of {category_id: spent_amount} for past/present only"""
        today = date.today()
        result = {}
        for category in self.categories.all():
            spent = Transaction.objects.filter(
                type='expense',
                category=category,
                date__gte=self.start_date,
                date__lte=min(self.end_date, today)
            ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
            result[category.id] = Decimal(str(spent)).quantize(Decimal('0.01'))
        return result

    def upcoming_amount(self):
        """Calculate upcoming (future) spending for this budget period"""
        today = date.today()
        if self.end_date <= today:
            return Decimal('0.00')

        filters = {
            'type': 'expense',
            'category__in': self.categories.all(),
            'date__gt': today,
            'date__lte': self.end_date,
        }
        upcoming = Transaction.objects.filter(**filters).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        return Decimal(str(upcoming)).quantize(Decimal('0.01'))

    def clean(self):
        from django.core.exceptions import ValidationError

        # Ensure amount is positive (already handled by validator, but double check)
        if self.amount and self.amount <= 0:
            raise ValidationError({
                'amount': 'Amount must be positive.'
            })

        # Overlapping budgets and categories are now allowed - validation removed

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
        verbose_name = 'Upcoming Transaction'
        verbose_name_plural = 'Upcoming Transactions'

    def __str__(self):
        recurring = " (Recurring)" if self.is_recurring() else ""
        return f"Upcoming: {self.get_type_display()} - {self.category.name} - {self.amount} on {self.date}{recurring}"

    @property
    def is_due(self):
        """Check if this upcoming transaction is due (date is today or in the past)"""
        return self.date <= date.today()

    def post_transaction(self):
        """Convert upcoming transaction to regular transaction and create next if recurring"""
        # Create regular transaction with same data
        transaction = Transaction.objects.create(
            description=self.description,
            amount=self.amount,
            type=self.type,
            category=self.category,
            wallet=self.wallet,
            date=self.date,
            recurrence=self.recurrence,
            recurrence_parent=self.recurrence_parent,
        )

        # If recurring, create next upcoming transaction
        if self.recurrence and self.recurrence != 'none':
            next_date = self.calculate_next_date()
            if next_date:
                UpcomingTransaction.objects.create(
                    description=self.description,
                    amount=self.amount,
                    type=self.type,
                    category=self.category,
                    wallet=self.wallet,
                    date=next_date,
                    recurrence=self.recurrence,
                    recurrence_parent=self.recurrence_parent or transaction,
                    auto_post=self.auto_post,
                )

        # Delete this upcoming transaction
        self.delete()

        return transaction

    def skip_occurrence(self):
        """Skip this occurrence and create next if recurring"""
        # Store recurrence_parent before deletion
        parent = self.recurrence_parent

        # Create next if recurring
        if self.recurrence and self.recurrence != 'none':
            next_date = self.calculate_next_date()
            if next_date:
                UpcomingTransaction.objects.create(
                    description=self.description,
                    amount=self.amount,
                    type=self.type,
                    category=self.category,
                    wallet=self.wallet,
                    date=next_date,
                    recurrence=self.recurrence,
                    recurrence_parent=parent,
                    auto_post=self.auto_post,
                )

        # Delete current upcoming
        self.delete()


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


class WishlistItem(models.Model):
    """Wishlist items for tracking savings goals"""
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='wishlist_items'
    )
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


class Template(models.Model):
    """Template for quick transaction entry with pre-filled data"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='transaction_templates'
    )
    description = models.TextField(blank=True)
    type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='templates'
    )
    amount = models.DecimalField(
        **MONEY_FIELD_CONFIG,
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        help_text='Default amount for this template (can be zero)'
    )
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.description if self.description else f"{self.get_type_display()} Template"


