import { useState } from 'react';
import {
  NavigationBar,
  FilterBar,
  TransactionSummary,
  TransactionListItem,
  EmptyState,
  FloatingActionButton,
  TransactionForm,
} from '../components';
import { theme } from '../styles/theme';

// Mock data for categories
const mockCategories = [
  { id: 1, name: 'Salary', type: 'income', icon: '💼' },
  { id: 2, name: 'Freelance', type: 'income', icon: '💻' },
  { id: 3, name: 'Investments', type: 'income', icon: '📈' },
  { id: 4, name: 'Gifts', type: 'income', icon: '🎁' },
  { id: 5, name: 'Groceries', type: 'expense', icon: '🛒' },
  { id: 6, name: 'Transport', type: 'expense', icon: '🚗' },
  { id: 7, name: 'Dining', type: 'expense', icon: '🍽️' },
  { id: 8, name: 'Entertainment', type: 'expense', icon: '🎬' },
  { id: 9, name: 'Utilities', type: 'expense', icon: '💡' },
  { id: 10, name: 'Shopping', type: 'expense', icon: '🛍️' },
  { id: 11, name: 'Healthcare', type: 'expense', icon: '⚕️' },
  { id: 12, name: 'Education', type: 'expense', icon: '📚' },
];

// Mock data for wallets
const mockWallets = [
  { id: 1, name: 'Spending Wallet', currency: 'EUR' },
  { id: 2, name: 'Savings Wallet', currency: 'EUR' },
  { id: 3, name: 'Cash Wallet', currency: 'EUR' },
];

// Mock data for transactions
const mockTransactions = [
  {
    id: 1,
    description: 'Groceries',
    amount: 45.0,
    type: 'expense',
    date: '2025-10-20',
    category: 'Groceries',
    category_icon: '🛒',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 2,
    description: 'Gas',
    amount: 32.0,
    type: 'expense',
    date: '2025-10-19',
    category: 'Transport',
    category_icon: '🚗',
    wallet: 'Cash Wallet',
    currency_symbol: '€',
  },
  {
    id: 3,
    description: 'Transfer to Savings',
    amount: 200.0,
    type: 'transfer',
    date: '2025-10-18',
    wallet: 'Spending Wallet',
    from_wallet: 'Spending Wallet',
    to_wallet: 'Savings Wallet',
    currency_symbol: '€',
  },
  {
    id: 4,
    description: 'Monthly Salary',
    amount: 2500.0,
    type: 'income',
    date: '2025-10-15',
    category: 'Salary',
    category_icon: '💼',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 5,
    description: 'Netflix Subscription',
    amount: 12.99,
    type: 'expense',
    date: '2025-10-14',
    category: 'Entertainment',
    category_icon: '🎬',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
    recurrence: 'monthly',
  },
  {
    id: 6,
    description: 'Restaurant Dinner',
    amount: 67.5,
    type: 'expense',
    date: '2025-10-12',
    category: 'Dining',
    category_icon: '🍽️',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 7,
    description: 'Freelance Project',
    amount: 450.0,
    type: 'income',
    date: '2025-10-10',
    category: 'Freelance',
    category_icon: '💻',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 8,
    description: 'Electric Bill',
    amount: 89.0,
    type: 'expense',
    date: '2025-10-08',
    category: 'Utilities',
    category_icon: '💡',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 9,
    description: 'Coffee Shop',
    amount: 4.5,
    type: 'expense',
    date: '2025-10-07',
    category: 'Dining',
    category_icon: '🍽️',
    wallet: 'Cash Wallet',
    currency_symbol: '€',
  },
  {
    id: 10,
    description: 'Pharmacy',
    amount: 23.8,
    type: 'expense',
    date: '2025-10-06',
    category: 'Healthcare',
    category_icon: '⚕️',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 11,
    description: 'Gift from Parents',
    amount: 100.0,
    type: 'income',
    date: '2025-10-05',
    category: 'Gifts',
    category_icon: '🎁',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 12,
    description: 'Grocery Shopping',
    amount: 78.3,
    type: 'expense',
    date: '2025-10-04',
    category: 'Groceries',
    category_icon: '🛒',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 13,
    description: 'Uber Ride',
    amount: 15.0,
    type: 'expense',
    date: '2025-10-03',
    category: 'Transport',
    category_icon: '🚗',
    wallet: 'Cash Wallet',
    currency_symbol: '€',
  },
  {
    id: 14,
    description: 'Movie Tickets',
    amount: 25.0,
    type: 'expense',
    date: '2025-10-02',
    category: 'Entertainment',
    category_icon: '🎬',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 15,
    description: 'New Shoes',
    amount: 89.99,
    type: 'expense',
    date: '2025-10-01',
    category: 'Shopping',
    category_icon: '🛍️',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 16,
    description: 'Book Purchase',
    amount: 19.99,
    type: 'expense',
    date: '2025-09-30',
    category: 'Education',
    category_icon: '📚',
    wallet: 'Spending Wallet',
    currency_symbol: '€',
  },
  {
    id: 17,
    description: 'Investment Returns',
    amount: 340.0,
    type: 'income',
    date: '2025-09-28',
    category: 'Investments',
    category_icon: '📈',
    wallet: 'Savings Wallet',
    currency_symbol: '€',
  },
  {
    id: 18,
    description: 'Gas Station',
    amount: 45.0,
    type: 'expense',
    date: '2025-09-25',
    category: 'Transport',
    category_icon: '🚗',
    wallet: 'Cash Wallet',
    currency_symbol: '€',
  },
];

const Transactions = () => {
  // Get current month's date range as default
  const getCurrentMonthRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    return {
      start: new Date(year, month, 1).toISOString().split('T')[0],
      end: new Date(year, month + 1, 0).toISOString().split('T')[0],
    };
  };

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState(['expense', 'income', 'transfer']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedWallets, setSelectedWallets] = useState([]);
  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  // Transaction form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formType, setFormType] = useState('expense');

  // Filtering logic
  const getFilteredTransactions = () => {
    const filtered = mockTransactions
      .filter((transaction) => {
        // Filter by type
        if (!selectedTypes.includes(transaction.type)) return false;

        // Filter by category (if any selected)
        if (selectedCategories.length > 0) {
          if (transaction.type === 'transfer') return true; // Transfers have no category
          if (!selectedCategories.includes(transaction.category)) return false;
        }

        // Filter by wallet (if any selected)
        if (selectedWallets.length > 0) {
          const walletName = transaction.wallet || transaction.from_wallet;
          if (!selectedWallets.includes(walletName)) return false;
        }

        // Filter by date range
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        if (transactionDate < startDate || transactionDate > endDate) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    console.log('Filter applied:', {
      selectedTypes,
      selectedCategories,
      selectedWallets,
      dateRange,
      totalTransactions: mockTransactions.length,
      filteredCount: filtered.length,
    });

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Handle add transaction from floating button
  const handleAddTransaction = (type) => {
    console.log('Add transaction type:', type);
    setFormType(type);
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  // Handle edit transaction from clicking TransactionListItem
  const handleEditTransaction = (transaction) => {
    console.log('Edit transaction:', transaction);
    setFormType(transaction.type);
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  // Handle delete transaction
  const handleDelete = (transaction) => {
    console.log('Delete transaction:', transaction);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.description}"?`
    );
    if (confirmed) {
      alert(`Delete functionality not implemented yet for: ${transaction.description}`);
    }
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData);

    if (selectedTransaction) {
      // Update existing transaction
      alert(`Update transaction: ${selectedTransaction.description} (mock)`);
    } else {
      // Create new transaction
      alert(`Create new transaction: ${formData.description} (mock)`);
    }

    setIsFormOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.pageAlt,
        paddingBottom: theme.spacing[16],
      }}
    >
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Filter Bar - Sticky */}
      <FilterBar
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedWallets={selectedWallets}
        setSelectedWallets={setSelectedWallets}
        dateRange={dateRange}
        setDateRange={setDateRange}
        categories={mockCategories}
        wallets={mockWallets}
      />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing[6],
        }}
      >
        {/* Transaction Summary */}
        <TransactionSummary transactions={filteredTransactions} currency="EUR" />

        {/* Transaction List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
          {filteredTransactions.length === 0 ? (
            <EmptyState message="No transactions found" icon="📭" />
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                onClick={() => handleEditTransaction(transaction)}
                onDelete={() => handleDelete(transaction)}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onSelectType={handleAddTransaction} />

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTransaction}
        transactionType={formType}
        categories={mockCategories}
        wallets={mockWallets}
      />
    </div>
  );
};

export default Transactions;
