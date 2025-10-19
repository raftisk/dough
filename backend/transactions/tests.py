from django.test import TestCase
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date
from .models import Wallet, Category, Transaction, Budget, UpcomingTransaction


class WalletModelTest(TestCase):
    def test_create_wallet(self):
        """Test creating a wallet successfully"""
        wallet = Wallet.objects.create(
            name='Main Wallet',
            type=Wallet.SPENDING,
            initial_balance=Decimal('1000.00'),
            currency='USD'
        )
        self.assertEqual(wallet.name, 'Main Wallet')
        self.assertEqual(wallet.type, Wallet.SPENDING)
        self.assertEqual(wallet.initial_balance, Decimal('1000.00'))
        self.assertEqual(wallet.currency, 'USD')

    def test_wallet_current_balance(self):
        """Test wallet current balance calculation"""
        wallet = Wallet.objects.create(
            name='Test Wallet',
            type=Wallet.SAVING,
            initial_balance=Decimal('500.00')
        )
        category = Category.objects.create(name='Salary')

        # Add income
        Transaction.objects.create(
            wallet=wallet,
            type=Transaction.INCOME,
            category=category,
            amount=Decimal('200.00'),
            date=date.today()
        )

        # Add expense
        expense_category = Category.objects.create(name='Food')
        Transaction.objects.create(
            wallet=wallet,
            type=Transaction.EXPENSE,
            category=expense_category,
            amount=Decimal('50.00'),
            date=date.today()
        )

        # Balance should be 500 + 200 - 50 = 650
        self.assertEqual(wallet.get_current_balance(), Decimal('650.00'))

    def test_wallet_default_type(self):
        """Test wallet defaults to SPENDING type"""
        wallet = Wallet.objects.create(name='Default Wallet')
        self.assertEqual(wallet.type, Wallet.SPENDING)


class CategoryModelTest(TestCase):
    def test_create_category(self):
        """Test creating a category successfully"""
        category = Category.objects.create(
            name='Transportation',
            icon='car',
            color='#FF5733'
        )
        self.assertEqual(category.name, 'Transportation')
        self.assertEqual(category.icon, 'car')
        self.assertEqual(category.color, '#FF5733')
        self.assertTrue(category.is_active)

    def test_category_unique_name(self):
        """Test that category names are unique"""
        Category.objects.create(name='Food')
        with self.assertRaises(Exception):
            Category.objects.create(name='Food')


class TransactionModelTest(TestCase):
    def setUp(self):
        self.wallet = Wallet.objects.create(
            name='Test Wallet',
            initial_balance=Decimal('1000.00')
        )
        self.category = Category.objects.create(name='Groceries')

    def test_create_income_transaction(self):
        """Test creating an income transaction successfully"""
        transaction = Transaction.objects.create(
            wallet=self.wallet,
            type=Transaction.INCOME,
            category=self.category,
            amount=Decimal('500.00'),
            description='Monthly salary',
            date=date.today()
        )
        self.assertEqual(transaction.wallet, self.wallet)
        self.assertEqual(transaction.type, Transaction.INCOME)
        self.assertEqual(transaction.category, self.category)
        self.assertEqual(transaction.amount, Decimal('500.00'))
        self.assertEqual(transaction.get_signed_amount(), Decimal('500.00'))

    def test_create_expense_transaction(self):
        """Test creating an expense transaction successfully"""
        transaction = Transaction.objects.create(
            wallet=self.wallet,
            type=Transaction.EXPENSE,
            category=self.category,
            amount=Decimal('50.00'),
            description='Weekly groceries',
            date=date.today()
        )
        self.assertEqual(transaction.type, Transaction.EXPENSE)
        self.assertEqual(transaction.amount, Decimal('50.00'))
        self.assertEqual(transaction.get_signed_amount(), Decimal('-50.00'))

    def test_transaction_validation_zero_amount(self):
        """Test that transactions with zero amount raise validation error"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                wallet=self.wallet,
                type=Transaction.EXPENSE,
                category=self.category,
                amount=Decimal('0.00'),
                date=date.today()
            )
            transaction.full_clean()

    def test_transaction_validation_negative_amount(self):
        """Test that transactions with negative amounts raise validation error"""
        with self.assertRaises(ValidationError):
            transaction = Transaction(
                wallet=self.wallet,
                type=Transaction.EXPENSE,
                category=self.category,
                amount=Decimal('-50.00'),
                date=date.today()
            )
            transaction.full_clean()


class BudgetModelTest(TestCase):
    def setUp(self):
        self.wallet = Wallet.objects.create(
            name='Test Wallet',
            initial_balance=Decimal('1000.00')
        )
        self.category = Category.objects.create(name='Groceries')

    def test_create_budget(self):
        """Test creating a budget successfully"""
        budget = Budget.objects.create(
            category=self.category,
            wallet=self.wallet,
            amount=Decimal('500.00'),
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31)
        )
        self.assertEqual(budget.category, self.category)
        self.assertEqual(budget.wallet, self.wallet)
        self.assertEqual(budget.amount, Decimal('500.00'))

    def test_budget_spent_amount(self):
        """Test budget spent amount calculation"""
        budget = Budget.objects.create(
            category=self.category,
            wallet=self.wallet,
            amount=Decimal('500.00'),
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31)
        )

        # Create expense transaction
        Transaction.objects.create(
            wallet=self.wallet,
            type=Transaction.EXPENSE,
            category=self.category,
            amount=Decimal('150.00'),
            date=date(2025, 1, 15)
        )

        self.assertEqual(budget.get_spent_amount(), Decimal('150.00'))

    def test_budget_remaining_amount(self):
        """Test budget remaining amount calculation"""
        budget = Budget.objects.create(
            category=self.category,
            wallet=self.wallet,
            amount=Decimal('500.00'),
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31)
        )

        Transaction.objects.create(
            wallet=self.wallet,
            type=Transaction.EXPENSE,
            category=self.category,
            amount=Decimal('150.00'),
            date=date(2025, 1, 15)
        )

        self.assertEqual(budget.get_remaining_amount(), Decimal('350.00'))

    def test_budget_ignores_income(self):
        """Test that budget only tracks expenses, not income"""
        budget = Budget.objects.create(
            category=self.category,
            wallet=self.wallet,
            amount=Decimal('500.00'),
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31)
        )

        # Create income transaction (should be ignored by budget)
        Transaction.objects.create(
            wallet=self.wallet,
            type=Transaction.INCOME,
            category=self.category,
            amount=Decimal('200.00'),
            date=date(2025, 1, 15)
        )

        # Spent amount should still be 0
        self.assertEqual(budget.get_spent_amount(), Decimal('0.00'))


class UpcomingTransactionModelTest(TestCase):
    def setUp(self):
        self.wallet = Wallet.objects.create(
            name='Test Wallet',
            initial_balance=Decimal('1000.00')
        )
        self.category = Category.objects.create(name='Rent')

    def test_create_upcoming_transaction(self):
        """Test creating an upcoming transaction successfully"""
        upcoming = UpcomingTransaction.objects.create(
            wallet=self.wallet,
            type=UpcomingTransaction.EXPENSE,
            category=self.category,
            amount=Decimal('800.00'),
            description='Monthly rent',
            next_date=date(2025, 2, 1),
            frequency='monthly'
        )
        self.assertEqual(upcoming.wallet, self.wallet)
        self.assertEqual(upcoming.type, UpcomingTransaction.EXPENSE)
        self.assertEqual(upcoming.category, self.category)
        self.assertEqual(upcoming.amount, Decimal('800.00'))
        self.assertEqual(upcoming.frequency, 'monthly')
        self.assertTrue(upcoming.is_active)

    def test_create_upcoming_income(self):
        """Test creating an upcoming income transaction"""
        upcoming = UpcomingTransaction.objects.create(
            wallet=self.wallet,
            type=UpcomingTransaction.INCOME,
            category=self.category,
            amount=Decimal('3000.00'),
            description='Monthly salary',
            next_date=date(2025, 2, 1),
            frequency='monthly'
        )
        self.assertEqual(upcoming.type, UpcomingTransaction.INCOME)
        self.assertEqual(upcoming.amount, Decimal('3000.00'))
