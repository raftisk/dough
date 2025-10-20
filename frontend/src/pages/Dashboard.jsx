import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import BudgetCard from '../components/BudgetCard';
import TransactionListItem from '../components/TransactionListItem';
import WalletCard from '../components/WalletCard';
import CategoryCard from '../components/CategoryCard';
import { theme } from '../styles/theme';
import { getCurrentMonthYear } from '../utils/date';

// Mock data for Metric Cards
const mockMetrics = {
  totalIncome: {
    label: 'Total Income',
    value: '€3,450.00',
    icon: TrendingUp,
    iconColor: theme.colors.semantic.income,
    subtitle: '+15% from last month',
  },
  totalExpenses: {
    label: 'Total Expenses',
    value: '€2,180.00',
    icon: TrendingDown,
    iconColor: theme.colors.semantic.expense,
    subtitle: '+8% from last month',
  },
  netSavings: {
    label: 'Net Savings',
    value: '€1,270.00',
    icon: PiggyBank,
    iconColor: theme.colors.text.secondary,
    subtitle: '58% savings rate',
  },
  totalWealth: {
    label: 'Total Wealth',
    value: '€24,567.89',
    icon: Wallet,
    iconColor: theme.colors.text.secondary,
    subtitle: 'Across 3 wallets',
    masked: true,
  },
};

// Mock data for Budget Cards
const mockBudgets = [
  {
    category: { name: 'Food & Dining', icon: '🍔' },
    amount: 1000,
    spent_amount: 650,
    remaining_amount: 350,
    percentage_used: 65,
    period: 'monthly',
    is_active: true,
  },
  {
    category: { name: 'Transportation', icon: '🚗' },
    amount: 300,
    spent_amount: 280,
    remaining_amount: 20,
    percentage_used: 93,
    period: 'monthly',
    is_active: true,
  },
  {
    category: { name: 'Entertainment', icon: '🎬' },
    amount: 200,
    spent_amount: 245,
    remaining_amount: -45,
    percentage_used: 122,
    period: 'monthly',
    is_active: true,
  },
  {
    category: { name: 'Travel', icon: '✈️' },
    amount: 2000,
    spent_amount: 450,
    remaining_amount: 1550,
    percentage_used: 22,
    period: 'quarterly',
    is_active: false,
  },
];

// Mock data for transactions (updated to EUR)
const mockTransactions = [
  {
    id: 1,
    description: 'Grocery shopping at Whole Foods',
    amount: 127.50,
    type: 'expense',
    date: '2025-10-15',
    category: 'Groceries',
    category_icon: '🛒',
    wallet: 'Main Checking',
    currency_symbol: '€',
  },
  {
    id: 2,
    description: 'Monthly salary deposit',
    amount: 3450.00,
    type: 'income',
    date: '2025-10-01',
    category: 'Salary',
    category_icon: '💰',
    wallet: 'Main Checking',
    currency_symbol: '€',
  },
  {
    id: 3,
    description: 'Netflix subscription',
    amount: 13.99,
    type: 'expense',
    date: '2025-10-10',
    category: 'Entertainment',
    category_icon: '🎬',
    wallet: 'Credit Card',
    currency_symbol: '€',
    recurrence: 'monthly',
  },
  {
    id: 4,
    description: 'Transfer to savings',
    amount: 500.00,
    type: 'transfer',
    date: '2025-10-05',
    category: 'Transfer',
    category_icon: '💸',
    wallet: 'Main Checking',
    currency_symbol: '€',
  },
];

// Mock data for wallets (updated to EUR)
const mockWallets = [
  {
    id: 1,
    name: 'Main Checking',
    type: 'Checking',
    currency: 'EUR',
    currency_symbol: '€',
    current_balance: 12532.75,
  },
  {
    id: 2,
    name: 'Savings Account',
    type: 'Savings',
    currency: 'EUR',
    currency_symbol: '€',
    current_balance: 8450.00,
  },
  {
    id: 3,
    name: 'Credit Card',
    type: 'Credit',
    currency: 'EUR',
    currency_symbol: '€',
    current_balance: -850.25,
  },
];

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: 'Groceries',
    icon: '🛒',
    type: 'expense',
    total_amount: 450.00,
  },
  {
    id: 2,
    name: 'Salary',
    icon: '💰',
    type: 'income',
    total_amount: 3450.00,
  },
  {
    id: 3,
    name: 'Entertainment',
    icon: '🎬',
    type: 'expense',
    total_amount: 125.50,
  },
  {
    id: 4,
    name: 'Transportation',
    icon: '🚗',
    type: 'expense',
    total_amount: 200.00,
  },
  {
    id: 5,
    name: 'Freelance',
    icon: '💼',
    type: 'income',
    total_amount: 850.00,
  },
  {
    id: 6,
    name: 'Utilities',
    icon: '⚡',
    type: 'expense',
    total_amount: 180.00,
  },
];

function Dashboard() {
  const handleAddClick = () => {
    console.log('Add button clicked');
  };

  const handleEditTransaction = (transaction) => {
    console.log('Edit transaction:', transaction);
  };

  const handleDeleteTransaction = (transaction) => {
    console.log('Delete transaction:', transaction);
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
          actionLabel="Add Transaction"
          onAction={handleAddClick}
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
            <MetricCard {...mockMetrics.totalIncome} />
            <MetricCard {...mockMetrics.totalExpenses} />
            <MetricCard {...mockMetrics.netSavings} />
            <MetricCard {...mockMetrics.totalWealth} />
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
            {mockBudgets.map((budget, index) => (
              <BudgetCard
                key={index}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
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
            {mockTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            ))}
          </div>
        </section>

        {/* Wallet Cards Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Wallets
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            {mockWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onClick={handleWalletClick}
                onEdit={handleEditWallet}
              />
            ))}
          </div>
        </section>

        {/* Category Cards Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Categories
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            {mockCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={handleCategoryClick}
                onEdit={handleEditCategory}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
