import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { theme } from '../styles/theme';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import WishlistItem from '../components/WishlistItem';
import WishlistItemForm from '../components/WishlistItemForm';
import api from '../services/api';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/wishlist-items/'),
        api.get('/categories/'),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle create/update save
  const handleSave = () => {
    fetchData(); // Refresh list
    setShowForm(false);
    setEditingItem(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await api.delete(`/wishlist-items/${id}/`);
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete goal. Please try again.');
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Handle FAB click
  const handleFABClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

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
          title="Wishlist"
          subtitle="Track items or goals you want to save up for"
        />

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing[12],
              color: theme.colors.text.muted,
            }}
          >
            Loading...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchData} />
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <EmptyState message="No wishlist items yet" />
        )}

        {/* Wishlist Items Grid */}
        {!loading && !error && items.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: theme.spacing[4],
              marginTop: theme.spacing[6],
            }}
          >
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onClick={() => handleEdit(item)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <div
        style={{
          position: 'fixed',
          bottom: theme.spacing[6],
          right: theme.spacing[6],
          zIndex: theme.zIndex.popover,
        }}
      >
        <button
          onClick={handleFABClick}
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

      {/* Wishlist Item Form Modal */}
      <WishlistItemForm
        isOpen={showForm}
        onClose={handleCancel}
        onSave={handleSave}
        item={editingItem}
        categories={categories}
      />
    </div>
  );
};

export default Wishlist;
