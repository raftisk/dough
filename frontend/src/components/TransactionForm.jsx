import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import { formatDateToLocal } from '../utils/format';

const TransactionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  transactionType = 'expense',
  categories = [],
  wallets = [],
}) => {
  // Initialize form state
  const [type, setType] = useState(transactionType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState('');
  const [autoPost, setAutoPost] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || transactionType);
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setCategoryId(initialData.category?.toString() || '');
      setWalletId(initialData.wallet?.toString() || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setRecurrence(initialData.recurrence || '');
      setAutoPost(initialData.auto_post || false);
    } else {
      // Reset form for new transaction
      setType(transactionType);
      setDescription('');
      setAmount('');
      setCategoryId('');
      setWalletId(wallets.length > 0 ? wallets[0].id.toString() : '');
      setDate(new Date().toISOString().split('T')[0]);
      setRecurrence('');
      setAutoPost(false);
    }
    setErrors({});
  }, [initialData, transactionType, wallets, isOpen]);

  // Set default wallet when wallets load
  useEffect(() => {
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets[0].id.toString());
    }
  }, [wallets, walletId]);

  // Filter categories by type
  const filteredCategories = categories.filter((cat) => cat.type === type);

  // Reset category if type changes and current category is no longer valid
  useEffect(() => {
    if (categoryId) {
      const isValidCategory = filteredCategories.some(
        (cat) => cat.id?.toString() === categoryId || cat.name === categoryId
      );
      if (!isValidCategory) {
        setCategoryId('');
      }
    }
  }, [type, categoryId, filteredCategories]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!categoryId) {
      newErrors.category = 'Category is required';
    }

    if (!walletId) {
      newErrors.wallet = 'Wallet is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      type,
      description: description.trim(),
      amount: parseFloat(amount),
      category: parseInt(categoryId, 10),
      wallet: parseInt(walletId, 10),
      date,
      recurrence, // Send the actual recurrence value (including 'None')
      auto_post: autoPost, // Include auto_post in payload
    };

    onSubmit(formData);
  };

  // Handle cancel
  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  const TypeIcon = type === 'income' ? Plus : Minus;

  return (
    // Modal Overlay
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal,
        padding: theme.spacing[4],
      }}
      onClick={handleCancel}
    >
      {/* Modal Content */}
      <div
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.xl,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing[6],
            borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
            }}
          >
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={handleCancel}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: theme.spacing[2],
              borderRadius: theme.border.radius.base,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: theme.transitions.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} color={theme.colors.text.secondary} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: theme.spacing[6] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
            {/* Type */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                <TypeIcon size={16} color={type === 'income' ? theme.colors.semantic.income : theme.colors.semantic.expense} />
                Type
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    paddingRight: theme.spacing[8],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <ChevronDown
                  size={20}
                  style={{
                    position: 'absolute',
                    right: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: theme.colors.text.secondary,
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Salary, Groceries"
                maxLength={200}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                    errors.description ? theme.colors.semantic.expense : theme.colors.border.medium
                  }`,
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.card,
                }}
              />
              {errors.description && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Amount (EUR)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary,
                  }}
                >
                  €
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    paddingLeft: theme.spacing[6],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.amount ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                  }}
                />
              </div>
              {errors.amount && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Category
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    paddingRight: theme.spacing[8],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.category ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id || category.name} value={category.id || category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  style={{
                    position: 'absolute',
                    right: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: theme.colors.text.secondary,
                  }}
                />
              </div>
              {errors.category && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Wallet */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Wallet
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    paddingRight: theme.spacing[8],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.wallet ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  style={{
                    position: 'absolute',
                    right: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: theme.colors.text.secondary,
                  }}
                />
              </div>
              {errors.wallet && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.wallet}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Date
              </label>
              <DatePicker
                date={date}
                onDateChange={(newDate) => {
                  const dateStr = newDate ? formatDateToLocal(newDate) : '';
                  setDate(dateStr);
                }}
                placeholder="Select date"
              />
              {errors.date && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.date}
                </p>
              )}
            </div>

            {/* Recurrence */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                Recurrence
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    paddingRight: theme.spacing[8],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown
                  size={20}
                  style={{
                    position: 'absolute',
                    right: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: theme.colors.text.secondary,
                  }}
                />
              </div>
            </div>

            {/* Auto-post checkbox (only show for future dates) */}
            {new Date(date) > new Date() && (
              <div
                style={{
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.background.page,
                  borderRadius: theme.border.radius.base,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoPost}
                    onChange={(e) => setAutoPost(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Auto-post when date arrives
                  </span>
                </label>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing[1],
                    marginLeft: '24px',
                    marginBottom: 0,
                  }}
                >
                  Transaction will be posted automatically without confirmation
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: theme.spacing[3],
              marginTop: theme.spacing[6],
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                backgroundColor: 'transparent',
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.inverse,
                backgroundColor: theme.colors.action.primary,
                border: 'none',
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.action.primary;
              }}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TransactionForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  transactionType: PropTypes.oneOf(['income', 'expense']),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string.isRequired,
    })
  ),
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default TransactionForm;
