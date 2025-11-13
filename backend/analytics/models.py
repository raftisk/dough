from django.db import models
from django.conf import settings
from decimal import Decimal
from datetime import date


class MonthlySummary(models.Model):
    """
    Monthly summary of financial data for a user.

    This model stores pre-calculated monthly summaries to avoid expensive
    real-time calculations. Updated automatically via signals when transactions
    are created, updated, or deleted.

    Fields:
    - Cash flow metrics: income, expenses, surplus, savings rate
    - Wallet balances: snapshots of wallet balances at end of month
    - Category breakdowns: spending by category
    - Metadata: tracking current month flag and last update time
    """

    # User reference
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='monthly_summaries'
    )

    # Date fields
    year = models.IntegerField()
    month = models.IntegerField()  # 1-12

    # Cash flow metrics (from transactions)
    total_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total income for this month'
    )
    total_expenses = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total expenses for this month'
    )
    net_surplus = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Net surplus (income - expenses)'
    )
    savings_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Savings rate as percentage of income'
    )

    # Wallet balance snapshots (at end of month or current if is_current_month)
    wallets_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text='Snapshot of wallet balances: {"spending": 1500.00, "saving": 5000.00, ...}'
    )
    liquid_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Sum of spending + cash wallet balances'
    )
    reserved_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Sum of saving + investment wallet balances'
    )
    total_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Sum of all wallet balances'
    )

    # Category breakdown
    spent_per_categories = models.JSONField(
        default=list,
        blank=True,
        help_text='List of category spending: [{"category_id": 1, "category_name": "Food", "amount": 500.00, "percentage": 20.5}, ...]'
    )

    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    is_current_month = models.BooleanField(
        default=False,
        help_text='True only for the current month (only one per user should be True)'
    )

    class Meta:
        unique_together = ['user', 'year', 'month']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['user', 'year', 'month']),
            models.Index(fields=['user', 'is_current_month']),
        ]
        verbose_name = 'Monthly Summary'
        verbose_name_plural = 'Monthly Summaries'

    def __str__(self):
        return f"{self.user.username} - {self.year}/{self.month:02d}"

    @property
    def date_representation(self):
        """Return date object for the first day of this month"""
        return date(self.year, self.month, 1)
