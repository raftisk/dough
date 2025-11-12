"""
Admin registrations for the accounts app.
Handles User and UserPreferences model administration.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreferences


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
    list_display = ['user', 'default_currency', 'default_wallet', 'theme', 'smart_allocation', 'created_at']
    list_filter = ['default_currency', 'theme', 'smart_allocation', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
