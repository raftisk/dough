from django import forms
from .models import Transaction, Category, Wallet
from datetime import date


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
        fields = ['name', 'icon', 'color', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-notion-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Category name'
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


# Suggested categories for quick add
SUGGESTED_CATEGORIES = [
    {'name': 'Groceries', 'icon': 'shopping-cart', 'color': '#FF9800'},
    {'name': 'Eating Out', 'icon': 'restaurant', 'color': '#FF5722'},
    {'name': 'Transportation', 'icon': 'car', 'color': '#2196F3'},
    {'name': 'Entertainment', 'icon': 'film', 'color': '#9C27B0'},
    {'name': 'Healthcare', 'icon': 'heart', 'color': '#E91E63'},
    {'name': 'Shopping', 'icon': 'shopping-bag', 'color': '#FF4081'},
    {'name': 'Utilities', 'icon': 'zap', 'color': '#FFC107'},
    {'name': 'Rent', 'icon': 'home', 'color': '#795548'},
    {'name': 'Education', 'icon': 'book', 'color': '#3F51B5'},
    {'name': 'Travel', 'icon': 'plane', 'color': '#00BCD4'},
    {'name': 'Subscriptions', 'icon': 'repeat', 'color': '#607D8B'},
    {'name': 'Salary', 'icon': 'briefcase', 'color': '#4CAF50'},
    {'name': 'Freelance', 'icon': 'laptop', 'color': '#8BC34A'},
    {'name': 'Investments', 'icon': 'trending-up', 'color': '#009688'},
    {'name': 'Other', 'icon': 'more-horizontal', 'color': '#9E9E9E'},
]
