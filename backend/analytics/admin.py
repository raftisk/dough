from django.contrib import admin
from analytics.models import MonthlySummary


@admin.register(MonthlySummary)
class MonthlySummaryAdmin(admin.ModelAdmin):
    """Admin configuration for MonthlySummary model"""

    list_display = [
        'user',
        'year',
        'month',
        'total_income',
        'total_expenses',
        'net_surplus',
        'is_current_month',
        'last_updated'
    ]

    list_filter = [
        'year',
        'month',
        'is_current_month'
    ]

    search_fields = [
        'user__username',
        'user__email'
    ]

    ordering = ['-year', '-month']

    readonly_fields = [
        'user',
        'year',
        'month',
        'total_income',
        'total_expenses',
        'net_surplus',
        'savings_rate',
        'wallets_snapshot',
        'liquid_balance',
        'reserved_balance',
        'total_balance',
        'spent_per_categories',
        'last_updated',
        'is_current_month'
    ]

    def has_add_permission(self, request):
        """Disable manual creation - summaries are auto-generated"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deletion for cleanup"""
        return True
