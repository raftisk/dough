from django import forms
from .models import Transaction, Category, Wallet, Transfer, Budget, WishlistItem
from datetime import date
from .constants import PRESET_EXPENSE_CATEGORIES, PRESET_INCOME_CATEGORIES
#from .suggested_categories import SUGGESTED_CATEGORIES


class TransactionForm(forms.ModelForm):
    """Base form for transactions with recurrence support"""

    auto_post = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'rounded border-notion-border focus:ring-2 focus:ring-blue-500',
            'id': 'id_auto_post'
        }),
        help_text='Automatically post this transaction on the scheduled date'
    )

    class Meta:
        model = Transaction
        fields = ['desc', 'category', 'amount', 'wallet', 'date', 'recurrence', 'recurrence_parent']
        widgets = {
            'desc': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Enter description'
            }),
            'category': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': '0.00',
                'step': '0.01',
                'min': '0.01'
            }),
            'wallet': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'date': forms.DateInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'date'
            }),
            'recurrence': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'recurrence_parent': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default date to today
        if not self.instance.pk:
            self.initial['date'] = date.today()

        # Set default category to "Other" if it exists
        try:
            other_category = Category.objects.get(name='Other')
            self.initial['category'] = other_category
        except Category.DoesNotExist:
            pass


class ExpenseForm(TransactionForm):
    """Form for expense transactions"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.initial['amount'] = '0.00'
        # Filter categories to only show expense categories
        self.fields['category'].queryset = Category.objects.filter(
            is_active=True,
            type='expense'
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.type = 'expense'
        if commit:
            instance.save()
        return instance


class IncomeForm(TransactionForm):
    """Form for income transactions"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.initial['amount'] = '0.00'
        # Filter categories to only show income categories
        self.fields['category'].queryset = Category.objects.filter(
            is_active=True,
            type='income'
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.type = 'income'
        if commit:
            instance.save()
        return instance


class CategoryForm(forms.ModelForm):
    """Form for creating/editing categories"""

    ICON_CHOICES = [
        ('shopping-cart', 'Shopping Cart'),
        ('restaurant', 'Restaurant'),
        ('car', 'Car'),
        ('film', 'Film'),
        ('heart', 'Heart'),
        ('shopping-bag', 'Shopping Bag'),
        ('zap', 'Zap'),
        ('home', 'Home'),
        ('book', 'Book'),
        ('plane', 'Plane'),
        ('repeat', 'Repeat'),
        ('briefcase', 'Briefcase'),
        ('laptop', 'Laptop'),
        ('trending-up', 'Trending Up'),
        ('more-horizontal', 'More'),
        ('dollar-sign', 'Dollar Sign'),
        ('credit-card', 'Credit Card'),
        ('gift', 'Gift'),
        ('coffee', 'Coffee'),
        ('smartphone', 'Smartphone'),
        ('shield', 'Shield'),
    ]

    icon = forms.ChoiceField(
        choices=ICON_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        })
    )

    class Meta:
        model = Category
        fields = ['name', 'type', 'icon', 'color', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Category name'
            }),
            'type': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'color': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'color',
                'value': '#9E9E9E'
            }),
            'is_active': forms.CheckboxInput(attrs={
                'class': 'rounded border-notion-border focus:ring-2 focus:ring-blue-500'
            })
        }




class WalletForm(forms.ModelForm):
    """Form for creating/editing wallets"""

    class Meta:
        model = Wallet
        fields = ['name', 'type', 'initial_balance', 'currency']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Enter wallet name'
            }),
            'type': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'initial_balance': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': '0.00',
                'step': '0.01'
            }),
            'currency': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
        }


class TransferForm(forms.ModelForm):
    """Form for creating transfers between wallets"""

    class Meta:
        model = Transfer
        fields = ['from_wallet', 'to_wallet', 'amount', 'date', 'desc']
        widgets = {
            'from_wallet': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'to_wallet': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': '0.00',
                'step': '0.01',
                'min': '0.01'
            }),
            'date': forms.DateInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'date'
            }),
            'desc': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Enter description (optional)',
                'rows': 3
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default date to today
        if not self.instance.pk:
            self.initial['date'] = date.today()


class BudgetForm(forms.ModelForm):
    """Form for creating/editing budgets"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter categories to only show expense categories for budgets
        self.fields['category'].queryset = Category.objects.filter(
            is_active=True,
            type='expense'
        )
        # Set default start month to current month
        if not self.instance.pk:
            from monthfield import MonthField as Month
            self.initial['start_month'] = Month.from_date(date.today())
            self.initial['period'] = 'monthly'

    class Meta:
        model = Budget
        fields = ['category', 'amount', 'period', 'start_month', 'reset', 'rollover']
        widgets = {
            'category': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': '0.00',
                'step': '0.01',
                'min': '0.01'
            }),
            'period': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'start_month': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'month',
                'placeholder': 'YYYY-MM'
            }),
            'reset': forms.CheckboxInput(attrs={
                'class': 'rounded border-notion-border focus:ring-2 focus:ring-blue-500',
                'id': 'id_reset'
            }),
            'rollover': forms.CheckboxInput(attrs={
                'class': 'rounded border-notion-border focus:ring-2 focus:ring-blue-500',
                'id': 'id_rollover'
            })
        }


class WishlistItemForm(forms.ModelForm):
    """Form for creating/editing wishlist items"""

    class Meta:
        model = WishlistItem
        fields = ['desc', 'amount', 'category', 'priority', 'target', 'is_completed']
        widgets = {
            'desc': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Enter wishlist item description',
                'rows': 3
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': '0.00',
                'step': '0.01',
                'min': '0.01'
            }),
            'category': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'priority': forms.Select(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            'target': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'month',
                'placeholder': 'YYYY-MM'
            }),
            'is_completed': forms.CheckboxInput(attrs={
                'class': 'rounded border-notion-border focus:ring-2 focus:ring-blue-500'
            })
        }
