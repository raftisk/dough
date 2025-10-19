"""
Constants for the Dough transactions app.
Contains preset categories and currencies for consistency across the application.
"""

# Currency choices
CURRENCIES = [
    ('EUR', 'Euro (€)'),
    ('USD', 'US Dollar ($)'),
    ('GBP', 'British Pound (£)'),
    ('JPY', 'Japanese Yen (¥)'),
    ('CHF', 'Swiss Franc (CHF)'),
    ('CAD', 'Canadian Dollar (C$)'),
    ('AUD', 'Australian Dollar (A$)'),
    ('CNY', 'Chinese Yuan (¥)'),
    ('INR', 'Indian Rupee (₹)'),
    ('SEK', 'Swedish Krona (kr)'),
    ('NOK', 'Norwegian Krone (kr)'),
    ('DKK', 'Danish Krone (kr)'),
    ('PLN', 'Polish Zloty (zł)'),
    ('CZK', 'Czech Koruna (Kč)'),
    ('HUF', 'Hungarian Forint (Ft)'),
]

DEFAULT_CURRENCY = 'EUR'

# Wallet type choices
WALLET_TYPES = [
    ('spending', 'Spending'),
    ('saving', 'Saving'),
    ('cash', 'Cash'),
    ('investment', 'Investment'),
]

# Category type choices
CATEGORY_TYPES = [
    ('income', 'Income'),
    ('expense', 'Expense'),
]

# Transaction type choices
TRANSACTION_TYPES = [
    ('income', 'Income'),
    ('expense', 'Expense'),
]

# Recurrence choices for transactions
RECURRENCE_CHOICES = [
    ('', 'No Recurrence'),
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
    ('yearly', 'Yearly'),
]

# Budget period choices
PERIOD_CHOICES = [
    ('monthly', 'Monthly'),
    ('quarterly', 'Quarterly'),
    ('6-month', '6-Month'),
    ('yearly', 'Yearly'),
]

# Priority choices for wishlist items
PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),
]

# Preset expense categories
PRESET_EXPENSE_CATEGORIES = [
    {'name': 'Groceries', 'icon': 'shopping-cart', 'color': '#4CAF50'},
    {'name': 'Dining Out', 'icon': 'restaurant', 'color': '#FF9800'},
    {'name': 'Transportation', 'icon': 'car', 'color': '#2196F3'},
    {'name': 'Entertainment', 'icon': 'film', 'color': '#E91E63'},
    {'name': 'Healthcare', 'icon': 'heart', 'color': '#F44336'},
    {'name': 'Shopping', 'icon': 'shopping-bag', 'color': '#9C27B0'},
    {'name': 'Utilities', 'icon': 'zap', 'color': '#FFC107'},
    {'name': 'Rent', 'icon': 'home', 'color': '#795548'},
    {'name': 'Education', 'icon': 'book', 'color': '#3F51B5'},
    {'name': 'Travel', 'icon': 'plane', 'color': '#00BCD4'},
    {'name': 'Subscriptions', 'icon': 'repeat', 'color': '#673AB7'},
    {'name': 'Insurance', 'icon': 'shield', 'color': '#607D8B'},
    {'name': 'Personal Care', 'icon': 'heart', 'color': '#E91E63'},
    {'name': 'Gifts', 'icon': 'gift', 'color': '#FF5722'},
    {'name': 'Coffee & Snacks', 'icon': 'coffee', 'color': '#795548'},
    {'name': 'Phone & Internet', 'icon': 'smartphone', 'color': '#009688'},
    {'name': 'Other Expenses', 'icon': 'more-horizontal', 'color': '#9E9E9E'},
]

# Preset income categories
PRESET_INCOME_CATEGORIES = [
    {'name': 'Salary', 'icon': 'dollar-sign', 'color': '#4CAF50'},
    {'name': 'Freelance', 'icon': 'briefcase', 'color': '#2196F3'},
    {'name': 'Investments', 'icon': 'trending-up', 'color': '#FF9800'},
    {'name': 'Business', 'icon': 'laptop', 'color': '#9C27B0'},
    {'name': 'Bonus', 'icon': 'gift', 'color': '#FFC107'},
    {'name': 'Refund', 'icon': 'credit-card', 'color': '#00BCD4'},
    {'name': 'Other Income', 'icon': 'more-horizontal', 'color': '#9E9E9E'},
]

# Money field configuration - use everywhere for consistency
MONEY_FIELD_CONFIG = {
    'max_digits': 12,
    'decimal_places': 2,
}
