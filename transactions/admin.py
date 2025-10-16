from django.contrib import admin
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'initial_balance', 'currency', 'created_at']
    list_filter = ['type', 'currency', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
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
    list_display = ['category', 'wallet', 'amount', 'start_date', 'end_date']
    list_filter = ['category', 'wallet', 'start_date', 'end_date']
    search_fields = ['category__name', 'wallet__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(UpcomingTransaction)
class UpcomingTransactionAdmin(admin.ModelAdmin):
    list_display = ['next_date', 'type', 'wallet', 'category', 'amount', 'frequency', 'is_active']
    list_filter = ['type', 'wallet', 'category', 'frequency', 'is_active']
    search_fields = ['description', 'wallet__name', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'next_date'
