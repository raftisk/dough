"""
User-related models for the accounts app.
This app handles user identity, authentication, and user preferences.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


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
    # Import CURRENCIES and DEFAULT_CURRENCY from transactions constants
    from transactions.constants import CURRENCIES, DEFAULT_CURRENCY

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
        'transactions.Wallet',
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
    smart_allocation = models.BooleanField(
        default=False,
        help_text='Enable smart budget allocation algorithm'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User Preferences'

    def __str__(self):
        return f"{self.user.email} preferences"
