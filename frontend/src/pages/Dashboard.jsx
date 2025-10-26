import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import BudgetCard from '../components/BudgetCard';
import TransactionListItem from '../components/TransactionListItem';
import WalletCard from '../components/WalletCard';
import CategoryCard from '../components/CategoryCard';
import FloatingActionButton from '../components/FloatingActionButton';
import TransactionForm from '../components/TransactionForm';
import CalendarView from '../components/CalendarView';
import { theme } from '../styles/theme';
import { getCurrentMonthYear } from '../utils/date';
import { getDashboardData, getCategories, getWallets, createTransaction, updateTransaction, deleteTransaction } from '../services/api';
import { getIconComponent } from '../constants';

function Dashboard() {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Transaction form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formType, setFormType] = useState('expense');

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, categoriesData, walletsData] = await Promise.all([
        getDashboardData(),
        getCategories(),
        getWallets(),
      ]);
      setDashboardData(dashData);
      setCategories(categoriesData.filter(c => c.is_active));
      setWallets(walletsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = (type) => {
    console.log('Add transaction type:', type);
    setFormType(type);
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

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

  const handleDeleteTransaction = async (transaction) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.description}"?`
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(transaction.id);
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

      if (selectedTransaction) {
        // Update existing transaction
        await updateTransaction(selectedTransaction.id, transactionData);
      } else {
        // Create new transaction
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
          <PageHeader
            title={getCurrentMonthYear()}
            subtitle="Overview of your finances"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing[8],
              color: theme.colors.text.secondary,
            }}
          >
            Loading dashboard...
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
          <PageHeader
            title={getCurrentMonthYear()}
            subtitle="Overview of your finances"
          />
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
              onClick={fetchDashboardData}
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
              value={`€${parseFloat(dashboardData.current_month_income).toFixed(2)}`}
              icon={TrendingUp}
              iconColor={theme.colors.semantic.income}
              subtitle={`${dashboardData.transaction_count} transaction${dashboardData.transaction_count !== 1 ? 's' : ''} this month`}
            />
            <MetricCard
              label="Total Expenses"
              value={`€${parseFloat(dashboardData.current_month_expenses).toFixed(2)}`}
              icon={TrendingDown}
              iconColor={theme.colors.semantic.expense}
              subtitle={`${dashboardData.transaction_count} transaction${dashboardData.transaction_count !== 1 ? 's' : ''} this month`}
            />
            <MetricCard
              label="Net Savings"
              value={`€${parseFloat(dashboardData.net_savings).toFixed(2)}`}
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
              value={`€${parseFloat(dashboardData.total_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              iconColor={theme.colors.text.secondary}
              subtitle={`Across ${dashboardData.wallet_count} wallets`}
              masked={true}
            />
          </div>
        </section>

        {/* Budget Cards Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Budgets
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            {dashboardData.budget_summary && dashboardData.budget_summary.length > 0 ? (
              dashboardData.budget_summary.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                />
              ))
            ) : (
              <div style={{ color: theme.colors.text.secondary, padding: theme.spacing[4] }}>
                No budgets configured
              </div>
            )}
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
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
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
}

export default Dashboard;
