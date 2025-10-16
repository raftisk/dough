from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Wallet(models.Model):
    SAVING = 'saving'
    SPENDING = 'spending'
    WALLET_TYPES = [
        (SAVING, 'Saving'),
        (SPENDING, 'Spending'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=10,
        choices=WALLET_TYPES,
        default=SPENDING
    )
    initial_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    def get_current_balance(self):
        """Calculate current balance including all transactions"""
        from django.db.models import Case, When, F

        # Sum with appropriate signs based on transaction type
        transactions_sum = self.transactions.aggregate(
            total=models.Sum(
                Case(
                    When(type=Transaction.EXPENSE, then=-F('amount')),
                    default=F('amount')
                )
            )
        )['total'] or Decimal('0.00')
        return self.initial_balance + transactions_sum


class Category(models.Model):
    """
    Category represents a classification for transactions.
    Examples: 'Eating out', 'Transportation', 'Salary', 'Investments'
    Categories are user-configurable.
    """
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Transaction(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    TRANSACTION_TYPES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]

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
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Always positive, type determines if income or expense'
    )
    description = models.TextField(blank=True)
    date = models.DateField()
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
        if self.type == self.EXPENSE:
            return -abs(self.amount)
        return abs(self.amount)


class Budget(models.Model):
    """Budgets are only for expense tracking"""
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='budgets',
        null=True,
        blank=True,
        help_text='Leave blank for all wallets'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        wallet_name = self.wallet.name if self.wallet else 'All Wallets'
        return f"{self.category.name} - {wallet_name}: {self.amount}"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError({
                'end_date': 'End date must be after start date.'
            })

    def get_spent_amount(self):
        """Calculate total spent in this budget period"""
        filters = {
            'type': Transaction.EXPENSE,
            'category': self.category,
            'date__gte': self.start_date,
            'date__lte': self.end_date,
        }
        if self.wallet:
            filters['wallet'] = self.wallet

        spent = Transaction.objects.filter(**filters).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

        return spent

    def get_remaining_amount(self):
        """Calculate remaining budget"""
        return self.amount - self.get_spent_amount()


class UpcomingTransaction(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    TRANSACTION_TYPES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('once', 'One-time'),
    ]

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='upcoming_transactions'
    )
    type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='upcoming_transactions'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Always positive, type determines if income or expense'
    )
    description = models.TextField(blank=True)
    next_date = models.DateField(help_text='Next occurrence date')
    frequency = models.CharField(
        max_length=10,
        choices=FREQUENCY_CHOICES,
        default='monthly'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_date']

    def __str__(self):
        return f"{self.get_type_display()}: {self.category.name} - {self.amount} on {self.next_date}"
