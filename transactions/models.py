from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Wallet(models.Model):
    SAVING = 'saving'
    SPENDING = 'spending'
    CASH = 'cash'
    INVESTMENT = 'investment'
    WALLET_TYPES = [
        (SPENDING, 'Spending'),
        (SAVING, 'Saving'),
        (CASH, 'Cash'),
        (INVESTMENT, 'Investment'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=15,
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
        """Calculate current balance including all transactions and transfers"""
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
    INCOME = 'income'
    EXPENSE = 'expense'
    CATEGORY_TYPES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]

    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(
        max_length=10,
        choices=CATEGORY_TYPES,
        default=EXPENSE
    )
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, blank=True)
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
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    SIX_MONTH = '6-month'
    YEARLY = 'yearly'

    PERIOD_CHOICES = [
        (MONTHLY, 'Monthly'),
        (QUARTERLY, 'Quarterly'),
        (SIX_MONTH, '6-Month'),
        (YEARLY, 'Yearly'),
    ]

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    period = models.CharField(
        max_length=15,
        choices=PERIOD_CHOICES,
        default=MONTHLY
    )
    start_date = models.DateField()
    reset = models.BooleanField(
        default=False,
        help_text='True for recurring budgets'
    )
    rollover = models.BooleanField(
        default=False,
        help_text='Rollover remaining budget to next period (only if reset is True)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.category.name} - {self.get_period_display()} budget"

    @property
    def end_date(self):
        """Calculate end date based on start_date and period"""
        from dateutil.relativedelta import relativedelta

        if self.period == self.MONTHLY:
            # End of the month containing start_date
            next_month = self.start_date + relativedelta(months=1)
            return next_month.replace(day=1) - relativedelta(days=1)
        elif self.period == self.QUARTERLY:
            # 3 months from start_date
            end = self.start_date + relativedelta(months=3)
            return end - relativedelta(days=1)
        elif self.period == self.SIX_MONTH:
            # 6 months from start_date
            end = self.start_date + relativedelta(months=6)
            return end - relativedelta(days=1)
        elif self.period == self.YEARLY:
            # 1 year from start_date
            end = self.start_date + relativedelta(years=1)
            return end - relativedelta(days=1)

        return self.start_date

    def spent_amount(self):
        """Calculate total spent in this budget period"""
        filters = {
            'type': Transaction.EXPENSE,
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
        if self.category and self.start_date:
            end = self.end_date

            # Find overlapping budgets for the same category
            overlapping = Budget.objects.filter(
                category=self.category,
                start_date__lte=end,
            ).exclude(pk=self.pk)

            for budget in overlapping:
                if budget.end_date >= self.start_date:
                    raise ValidationError({
                        'start_date': f'A budget for {self.category.name} already exists for this period.'
                    })

        # Validate rollover only works with reset
        if self.rollover and not self.reset:
            raise ValidationError({
                'rollover': 'Rollover can only be enabled when reset is True.'
            })


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


class Transfer(models.Model):
    """Transfer money between wallets"""
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
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Must be positive'
    )
    date = models.DateField(auto_now_add=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

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

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
