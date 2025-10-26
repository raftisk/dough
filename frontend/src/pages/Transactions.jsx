import { useState, useEffect } from 'react';
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
import { getTransactions, getCategories, getWallets, createTransaction, updateTransaction, deleteTransaction } from '../services/api';
import { getIconComponent } from '../constants';

const Transactions = () => {
  // Data state
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch all data from API on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsData, categoriesData, walletsData] = await Promise.all([
        getTransactions(),
        getCategories(),
        getWallets(),
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData.filter(c => c.is_active)); // Only active categories for forms
      setWallets(walletsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const getFilteredTransactions = () => {
    const filtered = transactions
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
          // For transfers, check both from_wallet and to_wallet
          if (transaction.type === 'transfer') {
            const fromWalletId = transaction.from_wallet;
            const toWalletId = transaction.to_wallet;
            if (!selectedWallets.includes(fromWalletId) && !selectedWallets.includes(toWalletId)) {
              return false;
            }
          } else {
            // For regular transactions, check wallet
            if (!selectedWallets.includes(transaction.wallet)) return false;
          }
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
      totalTransactions: transactions.length,
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
    // Map API response fields to form expected fields
    setSelectedTransaction({
      ...transaction,
      category_id: transaction.category,
      wallet_id: transaction.wallet,
    });
    setIsFormOpen(true);
  };

  // Handle delete transaction
  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.description}"?`
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(transaction.id);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(err.message || 'Failed to delete transaction');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      const transactionData = {
        wallet: formData.wallet,
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description, 
        date: formData.date,
        recurrence: formData.recurrence, // Send as is from form (empty string for "None")
      };

      if (selectedTransaction) {
        // Update existing transaction
        await updateTransaction(selectedTransaction.id, transactionData);
      } else {
        // Create new transaction
        await createTransaction(transactionData);
      }

      // Refresh data
      await fetchData();

      // Close form
      setIsFormOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.message || 'Failed to save transaction');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors.background.pageAlt,
        }}
      >
        <NavigationBar />
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: theme.spacing[6],
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing[8],
              color: theme.colors.text.secondary,
            }}
          >
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors.background.pageAlt,
        }}
      >
        <NavigationBar />
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: theme.spacing[6],
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing[8],
              gap: theme.spacing[4],
            }}
          >
            <div style={{ color: theme.colors.semantic.expense }}>
              {error}
            </div>
            <button
              onClick={fetchData}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                backgroundColor: theme.colors.action.primary,
                color: theme.colors.text.inverse,
                border: 'none',
                borderRadius: theme.border.radius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        categories={categories}
        wallets={wallets}
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
            <EmptyState message="No transactions found" />
          ) : (
            filteredTransactions.map((transaction) => {
              return (
                <TransactionListItem
                  key={transaction.id}
                  transaction={{
                    ...transaction,
                    // Map API fields to component expected fields
                    description: transaction.description,
                    category: transaction.category_name,
                    category_icon: transaction.category_icon,
                    wallet: transaction.wallet_name,
                  }}
                  onClick={() => handleEditTransaction(transaction)}
                  onDelete={() => handleDelete(transaction)}
                />
              );
            })
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
        categories={categories}
        wallets={wallets}
      />
    </div>
  );
};

export default Transactions;
