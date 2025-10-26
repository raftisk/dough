import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import BudgetForm from '../components/BudgetForm';
import LargeBudgetCard from '../components/LargeBudgetCard';
import { theme } from '../styles/theme';
import { getBudgets, createBudget, updateBudget, deleteBudget, getCategories } from '../services/api';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgets(),
        getCategories(),
      ]);
      setBudgets(budgetsData);
      // Only active expense categories
      setCategories(categoriesData.filter(c => c.is_active && c.type === 'expense'));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (formData) => {
    try {
      await createBudget(formData);
      await fetchData(); // Refresh list
      setShowBudgetForm(false);
    } catch (err) {
      console.error('Failed to create budget:', err);
      throw err;
    }
  };

  const handleUpdateBudget = async (formData) => {
    try {
      await updateBudget(selectedBudget.id, formData);
      await fetchData(); // Refresh list
      setShowBudgetForm(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Failed to update budget:', err);
      throw err;
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      await fetchData(); // Refresh list
    } catch (err) {
      console.error('Failed to delete budget:', err);
      alert(err.message || 'Failed to delete budget');
    }
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setShowBudgetForm(true);
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
            title="Budgets"
            subtitle="Manage your spending limits"
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
            Loading budgets...
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
            title="Budgets"
            subtitle="Manage your spending limits"
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
              onClick={fetchData}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                backgroundColor: theme.colors.action.primary,
                color: theme.colors.text.inverse,
                border: 'none',
                borderRadius: theme.border.radius.base,
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
        {/* Page Header */}
        <PageHeader
          title="Budgets"
          subtitle="Manage your spending limits"
        />

        {/* Content Section */}
        <section style={{ marginBottom: theme.spacing[8] }}>
          {budgets.length === 0 ? (
            <div
              style={{
                backgroundColor: theme.colors.background.card,
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                borderRadius: theme.border.radius.lg,
                padding: theme.spacing[8],
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing[2],
                }}
              >
                No budgets yet
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.muted,
                }}
              >
                Click the + button to create your first budget
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                gap: theme.spacing[6],
              }}
            >
              {budgets.map((budget) => (
                <LargeBudgetCard
                  key={budget.id}
                  budget={budget}
                  onClick={() => handleEditBudget(budget)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          bottom: theme.spacing[6],
          right: theme.spacing[6],
          zIndex: theme.zIndex.popover,
        }}
      >
        <button
          onClick={handleAddBudget}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: theme.border.radius.full,
            backgroundColor: theme.colors.action.primary,
            color: theme.colors.text.inverse,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows.lg,
            transition: theme.transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = theme.shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primary;
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Budget Form Modal */}
      <BudgetForm
        isOpen={showBudgetForm}
        onClose={() => {
          setShowBudgetForm(false);
          setSelectedBudget(null);
        }}
        onSubmit={selectedBudget ? handleUpdateBudget : handleCreateBudget}
        initialData={selectedBudget}
        categories={categories}
      />
    </div>
  );
}

export default Budgets;
