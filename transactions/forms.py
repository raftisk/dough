from django import forms
from .models import Transaction, Category, Wallet, Transfer, Budget
from datetime import date
from .suggested_categories import SUGGESTED_CATEGORIES


class TransactionForm(forms.ModelForm):
    """Base form for transactions"""

    class Meta:
        model = Transaction
        fields = ['description', 'category', 'amount', 'wallet', 'date']
        widgets = {
            'description': forms.TextInput(attrs={
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
            })
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
            type=Category.EXPENSE
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.type = Transaction.EXPENSE
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
            type=Category.INCOME
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.type = Transaction.INCOME
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
            'currency': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'USD'
            }),
        }


class TransferForm(forms.ModelForm):
    """Form for creating transfers between wallets"""

    class Meta:
        model = Transfer
        fields = ['from_wallet', 'to_wallet', 'amount', 'date', 'description']
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
            'description': forms.Textarea(attrs={
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
            type=Category.EXPENSE
        )
        # Set default start date to first day of current month
        if not self.instance.pk:
            self.initial['start_date'] = date.today().replace(day=1)
            self.initial['period'] = Budget.MONTHLY

    class Meta:
        model = Budget
        fields = ['category', 'amount', 'period', 'start_date', 'reset', 'rollover']
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
            'start_date': forms.DateInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'type': 'date'
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
