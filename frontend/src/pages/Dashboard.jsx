import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import TransactionListItem from '../components/TransactionListItem';
import FloatingActionButton from '../components/FloatingActionButton';
import TransactionForm from '../components/TransactionForm';
import TransferForm from '../components/TransferForm';
import TemplateForm from '../components/TemplateForm';
import CalendarView from '../components/CalendarView';
import ErrorState from '../components/ErrorState';
import { theme } from '../styles/theme';
import { getCurrentMonthYear } from '../utils/date';
import { getDashboardData, getCurrentMonthSummary, getCategories, getWallets, createTransaction, updateTransaction, deleteTransaction, createTransfer, updateTransfer, deleteTransfer, getTemplates, createTemplate, updateTemplate } from '../services/api';
import { DEFAULT_CURRENCY } from '../constants';
import { formatAmount, formatDateToLocal } from '../utils/format';

function Dashboard() {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
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

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [dashData, currentMonthData, categoriesData, walletsData, templatesData] = await Promise.all([
        getDashboardData(),
        getCurrentMonthSummary(),
        getCategories(),
        getWallets(),
        getTemplates(),
      ]);

      // Merge dashboard data with current month summary from analytics
      const mergedData = {
        ...dashData,
        current_month_income: currentMonthData.total_income,
        current_month_expenses: currentMonthData.total_expenses,
        net_savings: currentMonthData.net_surplus,
        total_balance: currentMonthData.total_balance,
        income_trend: currentMonthData.income_trend,
        expenses_trend: currentMonthData.expenses_trend,
      };

      setDashboardData(mergedData);
      setCategories(categoriesData.filter(c => c.is_active));
      setWallets(walletsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    }
  };

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
        date: formatDateToLocal(new Date()),
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

  const handleEditTransaction = (transaction) => {
    console.log('Edit transaction:', transaction);
    if (transaction.type === 'transfer') {
      setSelectedTransfer({
        ...transaction,
        from_wallet: transaction.from_wallet || transaction.from_wallet_id,
        to_wallet: transaction.to_wallet || transaction.to_wallet_id,
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

  // Build menu options for posted transactions
  const getPostedTransactionMenuOptions = () => {
    return [
      {
        label: 'Delete',
        action: 'delete',
        icon: 'Trash2',
        variant: 'default',
      },
    ];
  };

  // Handle menu actions for posted transactions
  const handleMenuAction = async (action, transaction) => {
    if (action !== 'delete') {
      console.warn('Unknown action:', action);
      return;
    }

    try {
      if (transaction.type === 'transfer') {
        await deleteTransfer(transaction.id);
      } else {
        await deleteTransaction(transaction.id);
      }
      await fetchDashboardData(); // Refresh dashboard
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(err.message || 'Failed to delete transaction');
    }
  };

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

      if (selectedTransaction && selectedTransaction.id) {
        // Update existing transaction (has ID)
        await updateTransaction(selectedTransaction.id, transactionData);
      } else {
        // Create new transaction (no ID = new or from template)
        await createTransaction(transactionData);
      }

      // Refresh dashboard
      await fetchDashboardData();

      // Close form
      setIsFormOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.message || 'Failed to save transaction');
    }
  };

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

      // Refresh dashboard
      await fetchDashboardData();

      // Close form
      setIsTransferFormOpen(false);
      setSelectedTransfer(null);
    } catch (err) {
      console.error('Failed to save transfer:', err);
      alert(err.message || 'Failed to save transfer');
    }
  };

  const handleWalletClick = (wallet) => {
    console.log('Wallet clicked:', wallet);
  };

  const handleEditWallet = (wallet) => {
    console.log('Edit wallet:', wallet);
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
  };

  const handleEditCategory = (category) => {
    console.log('Edit category:', category);
  };

  const handleEditBudget = (budget) => {
    console.log('Edit budget:', budget);
  };

  const handleDeleteBudget = (budget) => {
    console.log('Delete budget:', budget);
  };

  const handleCalendarTransactionClick = (transaction) => {
    console.log('Calendar transaction clicked:', transaction);
    setFormType(transaction.type);
    // Map transaction fields for form
    setSelectedTransaction({
      ...transaction,
      category_id: transaction.category,
      wallet_id: transaction.wallet,
    });
    setIsFormOpen(true);
  };

  const handleTemplateFormSubmit = async (formData) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }

      await fetchDashboardData();
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
            title={getCurrentMonthYear()}
            subtitle="Overview of your finances"
          />
          <ErrorState error={error} onRetry={fetchDashboardData} />
        </div>
      </div>
    );
  }

  // Check if we have data
  if (!dashboardData) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.pageAlt,
      }}
    >
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing[6],
        }}
      >
        {/* Page Header with Current Month/Year */}
        <PageHeader
          title={getCurrentMonthYear()}
          subtitle="Overview of your finances"
        />

        {/* Metric Cards Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            <MetricCard
              label="Total Income"
              value={formatAmount(parseFloat(dashboardData.current_month_income), DEFAULT_CURRENCY)}
              icon={TrendingUp}
              iconColor={theme.colors.semantic.income}
              subtitle={
                dashboardData.income_trend !== null && dashboardData.income_trend !== undefined
                  ? dashboardData.income_trend > 0
                    ? `${Math.round(dashboardData.income_trend)}% more than last month`
                    : dashboardData.income_trend < 0
                    ? `${Math.round(Math.abs(dashboardData.income_trend))}% less than last month`
                    : 'Same as last month'
                  : 'No comparison data'
              }
            />
            <MetricCard
              label="Total Expenses"
              value={formatAmount(parseFloat(dashboardData.current_month_expenses), DEFAULT_CURRENCY)}
              icon={TrendingDown}
              iconColor={theme.colors.semantic.expense}
              subtitle={
                dashboardData.expenses_trend !== null && dashboardData.expenses_trend !== undefined
                  ? dashboardData.expenses_trend > 0
                    ? `${Math.round(dashboardData.expenses_trend)}% more than last month`
                    : dashboardData.expenses_trend < 0
                    ? `${Math.round(Math.abs(dashboardData.expenses_trend))}% less than last month`
                    : 'Same as last month'
                  : 'No comparison data'
              }
            />
            <MetricCard
              label="Net Savings"
              value={formatAmount(parseFloat(dashboardData.net_savings), DEFAULT_CURRENCY)}
              icon={PiggyBank}
              iconColor={theme.colors.text.secondary}
              subtitle={
                parseFloat(dashboardData.current_month_income) > 0
                  ? `${Math.round((parseFloat(dashboardData.net_savings) / parseFloat(dashboardData.current_month_income)) * 100)}% savings rate`
                  : 'No income this month'
              }
            />
            <MetricCard
              label="Total Wealth"
              value={formatAmount(parseFloat(dashboardData.total_balance), DEFAULT_CURRENCY)}
              icon={Wallet}
              iconColor={theme.colors.text.secondary}
              subtitle={`Across ${dashboardData.wallet_count} wallet${dashboardData.wallet_count !== 1 ? 's' : ''}`}
              masked={true}
            />
          </div>
        </section>


        {/* Transaction Items Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Recent Transactions
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[3],
            }}
          >
            {dashboardData.recent_transactions && dashboardData.recent_transactions.length > 0 ? (
              dashboardData.recent_transactions.map((transaction) => {
                return (
                  <TransactionListItem
                    key={transaction.id}
                    transaction={{
                      ...transaction,
                      description: transaction.description,
                      category: transaction.category_name,
                      category_icon: transaction.category_icon,
                      wallet: transaction.wallet_name,
                    }}
                    onClick={handleEditTransaction}
                    menuOptions={getPostedTransactionMenuOptions()}
                    onMenuAction={handleMenuAction}
                  />
                );
              })
            ) : (
              <div style={{ color: theme.colors.text.secondary, padding: theme.spacing[4] }}>
                No recent transactions
              </div>
            )}
          </div>
        </section>

        {/* Calendar View Section */}
        {dashboardData.recent_transactions && dashboardData.recent_transactions.length > 0 && (
          <CalendarView
            transactions={dashboardData.recent_transactions}
            onTransactionClick={handleCalendarTransactionClick}
          />
        )}

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
}

export default Dashboard;
