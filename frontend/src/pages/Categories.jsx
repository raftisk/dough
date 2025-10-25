import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { theme } from '../styles/theme';
import PageHeader from '../components/PageHeader';
import CategoryListItem from '../components/CategoryListItem';
import EmptyState from '../components/EmptyState';
import NavigationBar from '../components/NavigationBar';
import CategoryForm from '../components/CategoryForm';
import { PRESET_CATEGORIES } from '../constants';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const Categories = () => {
  // State for categories data (fetched from API)
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for type toggles (separate for each section)
  const [activeType, setActiveType] = useState('expense');
  const [inactiveType, setInactiveType] = useState('expense');
  const [presetType, setPresetType] = useState('expense');

  // State for FloatingActionButton menu and CategoryForm
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const menuRef = useRef(null);
  const fabRef = useRef(null);

  // Fetch categories from API on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        fabRef.current &&
        !fabRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Filter categories by active status and type
  const getFilteredCategories = (isActive, type) => {
    return categories.filter(
      (cat) => cat.is_active === isActive && cat.type === type
    );
  };

  // Check if a preset category already exists in user's categories
  const isPresetAdded = (presetCategory) => {
    return categories.some(
      (cat) => cat.name === presetCategory.name && cat.type === presetType
    );
  };

  // Handle FloatingActionButton menu actions
  const handleFabMenuAction = (action) => {
    if (action === 'create') {
      setShowCategoryForm(true);
    } else if (action === 'preset') {
      // Placeholder - do nothing or show message
      console.log('Add preset - coming soon');
    }
    setShowMenu(false);
  };

  // Handle category form submission
  const handleCategorySubmit = async (formData) => {
    try {
      // Create new category via API
      await createCategory({
        name: formData.name,
        icon: formData.iconName, // Store icon NAME (string), not component
        type: formData.type,
        is_active: true,
      });

      // Refresh categories list
      await fetchCategories();

      // Close form
      setShowCategoryForm(false);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert(err.message || 'Failed to create category');
    }
  };

  // Handle category menu actions
  const handleMenuAction = (action, category) => {
    switch (action) {
      case 'edit':
        handleEdit(category);
        break;
      case 'delete':
        handleDelete(category);
        break;
      case 'activate':
        handleActivate(category);
        break;
      case 'deactivate':
        handleDeactivate(category);
        break;
      case 'add':
        handleAddPreset(category);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleEdit = (category) => {
    alert(`Edit category: ${category.name} - Edit functionality coming soon`);
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      // Delete via API
      await deleteCategory(category.id);

      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleActivate = async (category) => {
    try {
      // Update via API
      await updateCategory(category.id, { is_active: true });

      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to activate category:', err);
      alert(err.message || 'Failed to activate category');
    }
  };

  const handleDeactivate = async (category) => {
    try {
      // Update via API
      await updateCategory(category.id, { is_active: false });

      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to deactivate category:', err);
      alert(err.message || 'Failed to deactivate category');
    }
  };

  const handleAddPreset = async (presetCategory) => {
    try {
      // Create new category from preset via API
      await createCategory({
        name: presetCategory.name,
        icon: presetCategory.iconName, // Use iconName (string) not icon (component)
        type: presetType,
        is_active: true,
      });

      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Failed to add preset category:', err);
      alert(err.message || 'Failed to add preset category');
    }
  };

  // Render type toggle buttons
  const TypeToggle = ({ selectedType, onTypeChange }) => {
    return (
      <div style={{ display: 'flex', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
        <button
          onClick={() => onTypeChange('expense')}
          style={{
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            borderRadius: theme.border.radius.sm,
            border: 'none',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            transition: theme.transitions.fast,
            backgroundColor:
              selectedType === 'expense'
                ? theme.colors.text.primary
                : theme.colors.background.cardHover,
            color:
              selectedType === 'expense'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary,
          }}
        >
          Expense
        </button>
        <button
          onClick={() => onTypeChange('income')}
          style={{
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            borderRadius: theme.border.radius.sm,
            border: 'none',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            transition: theme.transitions.fast,
            backgroundColor:
              selectedType === 'income'
                ? theme.colors.text.primary
                : theme.colors.background.cardHover,
            color:
              selectedType === 'income'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary,
          }}
        >
          Income
        </button>
      </div>
    );
  };

  // Get active categories for current type
  const activeCategories = getFilteredCategories(true, activeType);
  const inactiveCategories = getFilteredCategories(false, inactiveType);
  const presetCategories = PRESET_CATEGORIES[presetType] || [];

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
            title="Categories"
            subtitle="Manage your income and expense categories"
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
            Loading categories...
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
            title="Categories"
            subtitle="Manage your income and expense categories"
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
              onClick={fetchCategories}
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
          title="Categories"
          subtitle="Manage your income and expense categories"
        />

        {/* ACTIVE CATEGORIES SECTION */}
        <section style={{ marginBottom: theme.spacing[10] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Active Categories
          </h2>

          <TypeToggle selectedType={activeType} onTypeChange={setActiveType} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[3],
            }}
          >
            {activeCategories.length > 0 ? (
              activeCategories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  statusDot="active"
                  menuOptions={[
                    { label: 'Edit', action: 'edit', icon: 'Edit' },
                    { label: 'Deactivate', action: 'deactivate', icon: 'XCircle' },
                    { label: 'Delete', action: 'delete', icon: 'Trash2' },
                  ]}
                  onMenuAction={handleMenuAction}
                  transactionCount={category.transaction_count || 0}
                />
              ))
            ) : (
              <EmptyState
                message={`No active ${activeType} categories`}
                icon="📂"
              />
            )}
          </div>
        </section>

        {/* INACTIVE CATEGORIES SECTION */}
        <section style={{ marginBottom: theme.spacing[10] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Inactive Categories
          </h2>

          <TypeToggle selectedType={inactiveType} onTypeChange={setInactiveType} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[3],
            }}
          >
            {inactiveCategories.length > 0 ? (
              inactiveCategories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  statusDot="inactive"
                  menuOptions={[
                    { label: 'Activate', action: 'activate', icon: 'CheckCircle' },
                    { label: 'Delete', action: 'delete', icon: 'Trash2' },
                  ]}
                  onMenuAction={handleMenuAction}
                  transactionCount={category.transaction_count || 0}
                />
              ))
            ) : (
              <EmptyState
                message={`No inactive ${inactiveType} categories`}
                icon="📂"
              />
            )}
          </div>
        </section>

        {/* PRESET CATEGORIES SECTION */}
        <section style={{ marginBottom: theme.spacing[10] }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[1],
            }}
          >
            Preset Categories
          </h2>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing[4],
            }}
          >
            Add common categories to your list
          </p>

          <TypeToggle selectedType={presetType} onTypeChange={setPresetType} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[3],
            }}
          >
            {presetCategories.map((preset, index) => {
              const alreadyAdded = isPresetAdded(preset);
              return (
                <CategoryListItem
                  key={index}
                  category={{
                    name: preset.name,
                    icon: preset.iconName, // Use iconName string, not icon component
                    type: presetType
                  }}
                  statusDot="preset"
                  menuOptions={
                    alreadyAdded
                      ? []
                      : [{ label: 'Activate', action: 'add', icon: 'CheckCircle' }]
                  }
                  onMenuAction={handleMenuAction}
                  isAlreadyAdded={alreadyAdded}
                />
              );
            })}
          </div>
        </section>
      </div>

      {/* Floating Action Button with Menu */}
      <div
        style={{
          position: 'fixed',
          bottom: theme.spacing[6],
          right: theme.spacing[6],
          zIndex: theme.zIndex.popover,
        }}
      >
        {/* Menu */}
        {showMenu && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              bottom: '70px',
              right: 0,
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.border.radius.lg,
              boxShadow: theme.shadows.lg,
              border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
              minWidth: '180px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => handleFabMenuAction('create')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[3],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                transition: theme.transitions.fast,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Create Category</span>
            </button>
            <button
              onClick={() => handleFabMenuAction('preset')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[3],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                transition: theme.transitions.fast,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Add Preset</span>
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          ref={fabRef}
          onClick={() => setShowMenu(!showMenu)}
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

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSubmit={handleCategorySubmit}
        mode="create"
      />
    </div>
  );
};

export default Categories;
