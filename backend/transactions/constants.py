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
    ('CHF', 'Swiss Franc (Fr)'),
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
    ('none', 'None'),
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
    ('yearly', 'Yearly'),
]

# Budget period choices
PERIOD_CHOICES = [
    ('monthly', 'Monthly'),
    ('quarterly', 'Quarterly'),
    ('half-year', 'Half-Year'),
    ('yearly', 'Yearly'),
]

# Priority choices for wishlist items
PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),

]

# Money field configuration - use everywhere for consistency
MONEY_FIELD_CONFIG = {
    'max_digits': 12,
    'decimal_places': 2,
}

# Currency symbols mapping
CURRENCY_SYMBOLS = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CHF': 'Fr',
    'CAD': 'C$',
    'AUD': 'A$',
    'CNY': '¥',
    'INR': '₹',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'SGD': 'S$',
}


def get_currency_symbol(currency_code):
    """Get currency symbol for a given currency code."""
    return CURRENCY_SYMBOLS.get(currency_code, currency_code)
