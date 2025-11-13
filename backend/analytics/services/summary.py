"""
Summary calculation services for analytics app.

This module provides functions to calculate and update monthly financial summaries.
Updates are triggered automatically by signals when transactions change.
"""

from django.db import transaction
from django.db.models import Sum, Count, Q
from decimal import Decimal
from datetime import date, timedelta
from calendar import monthrange

from analytics.models import MonthlySummary
from transactions.models import Transaction, Wallet


@transaction.atomic
def update_monthly_summary(user, year, month):
    """
    Calculate and update monthly summary for a specific user/year/month.

    This function:
    1. Queries all transactions for the given month
    2. Calculates cash flow metrics (income, expenses, surplus, savings rate)
    3. Calculates category breakdown with percentages
    4. Calculates wallet balance snapshots
    5. Determines if this is the current month
    6. Updates or creates the MonthlySummary record

    Args:
        user: User object
        year: int, year (e.g., 2025)
        month: int, month (1-12)

    Returns:
        MonthlySummary object (created or updated)
    """

    # Step 1: Define month date range
    first_day = date(year, month, 1)
    last_day_num = monthrange(year, month)[1]
    last_day = date(year, month, last_day_num)

    # Step 2: Query transactions for this month
    month_transactions = Transaction.objects.filter(
        wallet__user=user,
        date__gte=first_day,
        date__lte=last_day
    ).select_related('category', 'wallet')

    # Step 3: Calculate cash flow metrics
    total_income = month_transactions.filter(
        type='income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    total_expenses = month_transactions.filter(
        type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    net_surplus = total_income - total_expenses

    # Calculate savings rate (as percentage of income)
    if total_income > 0:
        savings_rate = (net_surplus / total_income) * 100
        # Cap at -999.99 to 999.99 for the DecimalField(max_digits=5, decimal_places=2)
        savings_rate = max(min(savings_rate, Decimal('999.99')), Decimal('-999.99'))
    else:
        savings_rate = Decimal('0.00')

    # Step 4: Calculate category breakdown (expenses only)
    category_data = []
    if total_expenses > 0:
        # Group expenses by category
        expense_transactions = month_transactions.filter(type='expense')
        categories_summary = expense_transactions.values(
            'category__id', 'category__name'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')

        for cat in categories_summary:
            if cat['total']:
                percentage = (cat['total'] / total_expenses) * 100
                category_data.append({
                    'category_id': cat['category__id'],
                    'category_name': cat['category__name'],
                    'amount': float(cat['total']),
                    'percentage': float(percentage.quantize(Decimal('0.01')))
                })

    # Step 5: Calculate wallet balance snapshot
    # Get all wallets for the user
    wallets = Wallet.objects.filter(user=user)

    # Initialize wallet type totals
    wallet_totals = {
        'spending': Decimal('0.00'),
        'saving': Decimal('0.00'),
        'investment': Decimal('0.00'),
        'cash': Decimal('0.00'),
    }

    # Sum balances by wallet type
    for wallet in wallets:
        balance = wallet.get_current_balance()
        wallet_type = wallet.type
        if wallet_type in wallet_totals:
            wallet_totals[wallet_type] += balance

    # Convert to floats for JSON storage
    wallets_snapshot = {
        k: float(v) for k, v in wallet_totals.items()
    }

    # Calculate aggregated balances
    liquid_balance = wallet_totals['spending'] + wallet_totals['cash']
    reserved_balance = wallet_totals['saving'] + wallet_totals['investment']
    total_balance = liquid_balance + reserved_balance

    # Step 6: Determine if this is the current month
    today = date.today()
    is_current = (year == today.year and month == today.month)

    # If this is the current month, set all other summaries for this user to is_current_month=False
    if is_current:
        MonthlySummary.objects.filter(
            user=user,
            is_current_month=True
        ).exclude(
            year=year,
            month=month
        ).update(is_current_month=False)

    # Step 7: Update or create the MonthlySummary record
    summary, created = MonthlySummary.objects.update_or_create(
        user=user,
        year=year,
        month=month,
        defaults={
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_surplus': net_surplus,
            'savings_rate': savings_rate,
            'spent_per_categories': category_data,
            'wallets_snapshot': wallets_snapshot,
            'liquid_balance': liquid_balance,
            'reserved_balance': reserved_balance,
            'total_balance': total_balance,
            'is_current_month': is_current,
        }
    )

    return summary


def get_current_month_summary(user):
    """
    Get or create the current month summary for a user.

    If the summary doesn't exist or is stale, it will be recalculated.

    Args:
        user: User object

    Returns:
        MonthlySummary object for the current month, or None if no data
    """
    today = date.today()
    year = today.year
    month = today.month

    # Try to get existing summary
    try:
        summary = MonthlySummary.objects.get(
            user=user,
            year=year,
            month=month
        )

        # If exists but is_current_month is False, refresh it
        if not summary.is_current_month:
            summary = update_monthly_summary(user, year, month)

    except MonthlySummary.DoesNotExist:
        # Create new summary
        summary = update_monthly_summary(user, year, month)

    return summary
