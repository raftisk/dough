import { useState, useEffect } from 'react';
import {
  NavigationBar,
  PageHeader,
  FilterBar,
  TransactionSummary,
  TransactionListItem,
  EmptyState,
  ErrorState,
  FloatingActionButton,
  TransactionForm,
  UpcomingTransactionsList,
  TransferForm,
} from '../components';
import TemplateForm from '../components/TemplateForm';
import { theme } from '../styles/theme';
import {
  getTransactions,
  getCategories,
  getWallets,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUpcomingTransactions,
  updateUpcomingTransaction,
  getTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  getTemplates,
  createTemplate,
  updateTemplate,
} from '../services/api';
import { getIconComponent } from '../constants';

const Transactions = () => {
  // Data state
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [upcomingTransactions, setUpcomingTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [templates, setTemplates] = useState([]);
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

  // Transfer form states
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Template form states
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Upcoming transactions modal state
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // Fetch all data from API on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [transactionsData, transfersData, upcomingData, categoriesData, walletsData, templatesData] = await Promise.all([
        getTransactions(),
        getTransfers(),
        getUpcomingTransactions(),
        getCategories(),
        getWallets(),
        getTemplates(),
      ]);
      setTransactions(transactionsData);
      setTransfers(transfersData.map(t => ({ ...t, type: 'transfer' }))); // Add type field for filtering
      setUpcomingTransactions(upcomingData);
      setCategories(categoriesData.filter(c => c.is_active)); // Only active categories for forms
      setWallets(walletsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    }
  };

  // Filtering logic
  const getFilteredTransactions = () => {
    // Merge transactions and transfers into one array
    const allItems = [...transactions, ...transfers];

    const filtered = allItems
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
      totalTransfers: transfers.length,
      filteredCount: filtered.length,
    });

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Handle add transaction from floating button
  const handleAddTransaction = (type, templateData = null) => {
    console.log('Add transaction type:', type, 'templateData:', templateData);
    if (type === 'transfer') {
      setSelectedTransfer(null);
      setIsTransferFormOpen(true);
    } else if (type === 'add-template') {
      setSelectedTemplate(null);
      setIsTemplateFormOpen(true);
    } else if (type === 'template') {
      // Open TransactionForm with template data pre-filled
      setFormType(templateData.type);
      setSelectedTransaction({
        description: templateData.description,
        type: templateData.type,
        category: templateData.category,
        amount: templateData.amount,
        wallet: templateData.wallet,
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none',
        auto_post: false,
      });
      setIsFormOpen(true);
    } else {
      setFormType(type);
      setSelectedTransaction(null);
      setIsFormOpen(true);
    }
  };

  // Handle edit transaction from clicking TransactionListItem
  const handleEditTransaction = (transaction) => {
    console.log('Edit transaction:', transaction);
    if (transaction.type === 'transfer') {
      setSelectedTransfer({
        ...transaction,
        from_wallet: transaction.from_wallet,
        to_wallet: transaction.to_wallet,
      });
      setIsTransferFormOpen(true);
    } else {
      setFormType(transaction.type);
      // Map API response fields to form expected fields
      setSelectedTransaction({
        ...transaction,
        category_id: transaction.category,
        wallet_id: transaction.wallet,
      });
      setIsFormOpen(true);
    }
  };

  // Handle edit upcoming transaction
  const handleEditUpcoming = (upcoming) => {
    console.log('Edit upcoming transaction:', upcoming);
    setFormType(upcoming.type);
    // Mark as upcoming for proper endpoint routing
    setSelectedTransaction({
      ...upcoming,
      category_id: upcoming.category,
      wallet_id: upcoming.wallet,
      _isUpcoming: true,
    });
    setShowUpcomingModal(false); // Close upcoming modal
    setIsFormOpen(true);
  };

  // Handle delete transaction
  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.description}"?`
    );

    if (!confirmed) return;

    try {
      if (transaction.type === 'transfer') {
        await deleteTransfer(transaction.id);
      } else {
        await deleteTransaction(transaction.id);
      }
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
        auto_post: formData.auto_post, // Include auto_post field
      };

      if (selectedTransaction) {
        // Check if editing upcoming transaction
        if (selectedTransaction._isUpcoming) {
          // Update upcoming transaction
          await updateUpcomingTransaction(selectedTransaction.id, transactionData);
        } else {
          // Update regular transaction
          await updateTransaction(selectedTransaction.id, transactionData);
        }
      } else {
        // Create new transaction (backend will route to upcoming if future date)
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

  // Handle transfer form submission
  const handleTransferFormSubmit = async (formData) => {
    try {
      const transferData = {
        from_wallet: formData.from_wallet,
        to_wallet: formData.to_wallet,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      };

      if (selectedTransfer) {
        // Update existing transfer
        await updateTransfer(selectedTransfer.id, transferData);
      } else {
        // Create new transfer
        await createTransfer(transferData);
      }

      // Refresh data
      await fetchData();

      // Close form
      setIsTransferFormOpen(false);
      setSelectedTransfer(null);
    } catch (err) {
      console.error('Failed to save transfer:', err);
      alert(err.message || 'Failed to save transfer');
    }
  };

  // Handle template form submission
  const handleTemplateFormSubmit = async (formData) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }

      await fetchData();
      setIsTemplateFormOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Failed to save template:', err);
      alert(err.message || 'Failed to save template');
    }
  };

  const handleTemplateFormClose = () => {
    setIsTemplateFormOpen(false);
    setSelectedTemplate(null);
  };

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
          <PageHeader
            title="Transactions"
            subtitle="Track all your income, expenses, and transfers"
          />
          <ErrorState error={error} onRetry={fetchData} />
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

      {/* Page Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `${theme.spacing[6]} ${theme.spacing[6]} 0`,
        }}
      >
        <PageHeader
          title="Transactions"
          subtitle="Track all your income, expenses, and transfers"
          action={
            <button
              onClick={() => setShowUpcomingModal(true)}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.card,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.card;
              }}
            >
              Manage Future Transactions
            </button>
          }
        />
      </div>

      {/* Main Content - Constrained width for FilterBar and TransactionList */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${theme.spacing[4]}`,
        }}
      >
        {/* Filter Bar - Sticky */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.sticky,
            backgroundColor: theme.colors.background.pageAlt,
            paddingBottom: theme.spacing[4],
            paddingTop: theme.spacing[4],
          }}
        >
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
        </div>

        {/* Transaction Summary */}
        <TransactionSummary transactions={filteredTransactions} currency="EUR" />

        {/* Transaction List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], paddingBottom: theme.spacing[6] }}>
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
                    from_wallet_name: transaction.from_wallet_name,
                    to_wallet_name: transaction.to_wallet_name,
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
      <FloatingActionButton onSelectType={handleAddTransaction} templates={templates} />

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

      {/* Upcoming Transactions Modal */}
      <UpcomingTransactionsList
        isOpen={showUpcomingModal}
        onClose={() => setShowUpcomingModal(false)}
        upcomingTransactions={upcomingTransactions}
        onEdit={handleEditUpcoming}
        onRefresh={fetchData}
      />

      {/* Transfer Form Modal */}
      <TransferForm
        isOpen={isTransferFormOpen}
        onClose={() => setIsTransferFormOpen(false)}
        onSubmit={handleTransferFormSubmit}
        initialData={selectedTransfer}
        wallets={wallets}
      />

      {/* Template Form Modal */}
      <TemplateForm
        isOpen={isTemplateFormOpen}
        onClose={handleTemplateFormClose}
        onSubmit={handleTemplateFormSubmit}
        initialData={selectedTemplate}
        categories={categories}
        wallets={wallets}
      />
    </div>
  );
};

export default Transactions;
