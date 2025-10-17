from django.contrib import admin
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'initial_balance', 'currency', 'created_at']
    list_filter = ['type', 'currency', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'icon', 'color', 'is_active', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'type', 'wallet', 'category', 'amount', 'description']
    list_filter = ['type', 'wallet', 'category', 'date']
    search_fields = ['description', 'wallet__name', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'period', 'start_date', 'get_end_date', 'reset', 'rollover', 'created_at']
    list_filter = ['category', 'period', 'reset', 'rollover', 'start_date']
    search_fields = ['category__name']
    readonly_fields = ['created_at', 'updated_at', 'get_end_date', 'get_spent_amount', 'get_remaining_amount', 'get_percentage_used']
    date_hierarchy = 'start_date'

    def get_end_date(self, obj):
        """Display calculated end date"""
        return obj.end_date
    get_end_date.short_description = 'End Date'

    def get_spent_amount(self, obj):
        """Display spent amount"""
        return f"€{obj.spent_amount()}"
    get_spent_amount.short_description = 'Spent'

    def get_remaining_amount(self, obj):
        """Display remaining amount"""
        return f"€{obj.remaining_amount()}"
    get_remaining_amount.short_description = 'Remaining'

    def get_percentage_used(self, obj):
        """Display percentage used"""
        return f"{obj.percentage_used()}%"
    get_percentage_used.short_description = 'Usage %'


@admin.register(UpcomingTransaction)
class UpcomingTransactionAdmin(admin.ModelAdmin):
    list_display = ['next_date', 'type', 'wallet', 'category', 'amount', 'frequency', 'is_active']
    list_filter = ['type', 'wallet', 'category', 'frequency', 'is_active']
    search_fields = ['description', 'wallet__name', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'next_date'


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ['date', 'from_wallet', 'to_wallet', 'amount', 'description']
    list_filter = ['from_wallet', 'to_wallet', 'date']
    search_fields = ['description', 'from_wallet__name', 'to_wallet__name']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
