from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreferences, Wallet, Category, Transaction, Budget, UpcomingTransaction, Transfer, WishlistItem, Template


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['email', 'username']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'last_login']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'default_currency', 'default_wallet', 'theme', 'created_at']
    list_filter = ['default_currency', 'theme', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'initial_balance', 'currency', 'created_at']
    list_filter = ['type', 'currency', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'icon', 'is_active', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'type', 'wallet', 'category', 'amount', 'get_description']
    list_filter = ['type', 'wallet', 'category', 'date', 'recurrence']
    search_fields = ['description', 'wallet__name', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']

    def get_description(self, obj):
        """Display description (description field)"""
        return obj.description[:50] if obj.description else ''
    get_description.short_description = 'Description'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_categories', 'amount', 'period', 'start_month', 'get_end_date', 'reset', 'rollover', 'created_at']
    list_filter = ['period', 'reset', 'rollover']
    search_fields = ['name', 'categories__name']
    readonly_fields = ['created_at', 'updated_at', 'get_start_date', 'get_end_date', 'get_spent_amount', 'get_remaining_amount', 'get_percentage_used']
    filter_horizontal = ['categories']

    def get_categories(self, obj):
        """Display categories as comma-separated list"""
        return ", ".join([cat.name for cat in obj.categories.all()])
    get_categories.short_description = 'Categories'

    def get_start_date(self, obj):
        """Display calculated start date"""
        return obj.start_date
    get_start_date.short_description = 'Start Date'

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
    list_display = ['date', 'type', 'wallet', 'category', 'amount', 'auto_post', 'get_recurring_status']
    list_filter = ['type', 'wallet', 'category', 'auto_post', 'recurrence']
    search_fields = ['description', 'wallet__name', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'

    def get_recurring_status(self, obj):
        """Display if transaction is recurring"""
        return obj.is_recurring()
    get_recurring_status.short_description = 'Recurring'
    get_recurring_status.boolean = True


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ['date', 'from_wallet', 'to_wallet', 'amount', 'get_description']
    list_filter = ['from_wallet', 'to_wallet', 'date']
    search_fields = ['description', 'from_wallet__name', 'to_wallet__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']

    def get_description(self, obj):
        """Display description (description field)"""
        return obj.description[:50] if obj.description else ''
    get_description.short_description = 'Description'


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['get_description', 'amount', 'category', 'priority', 'target', 'is_completed', 'created_at']
    list_filter = ['category', 'priority', 'is_completed', 'target']
    search_fields = ['description', 'category__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['target', '-priority', '-created_at']

    def get_description(self, obj):
        """Display description (description field)"""
        return obj.description[:50] if obj.description else ''
    get_description.short_description = 'Description'


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_description', 'type', 'category', 'wallet', 'amount', 'created_at']
    list_filter = ['type', 'wallet', 'category', 'created_at']
    search_fields = ['description', 'user__email', 'user__username', 'wallet__name', 'category__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    def get_description(self, obj):
        """Display description (description field)"""
        return obj.description[:50] if obj.description else f"{obj.get_type_display()} Template"
    get_description.short_description = 'Description'
