import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import { getCurrencySymbol } from '../utils/format';
import { FALLBACK_CURRENCY } from '../constants';

const TemplateForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  wallets = [],
}) => {
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedWalletCurrency, setSelectedWalletCurrency] = useState(FALLBACK_CURRENCY);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setCategoryId(initialData.category?.toString() || '');
      setWalletId(initialData.wallet?.toString() || '');
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategoryId('');
      setWalletId(wallets.length > 0 ? wallets[0].id.toString() : '');
    }
    setErrors({});
  }, [initialData, wallets, isOpen]);

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

  // Track selected wallet's currency
  useEffect(() => {
    if (walletId && wallets.length > 0) {
      const selectedWallet = wallets.find(w => w.id === parseInt(walletId));
      setSelectedWalletCurrency(selectedWallet?.currency || FALLBACK_CURRENCY);
    }
  }, [walletId, wallets]);

  const validateForm = () => {
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    const amountNum = parseFloat(amount);
    if (amount && (isNaN(amountNum) || amountNum < 0)) {
      newErrors.amount = 'Amount must be zero or greater';
    }

    if (!walletId) {
      newErrors.wallet = 'Wallet is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const templateData = {
      description: description.trim(),
      type,
      category: categoryId ? parseInt(categoryId) : null,
      amount: amount ? parseFloat(amount) : 0,
      wallet: parseInt(walletId),
    };

    onSubmit(templateData);
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  // Close on Escape key
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
            {initialData ? 'Edit Template' : 'Add Template'}
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
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
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
                placeholder="e.g., Monthly Groceries"
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
                  outline: 'none',
                  transition: theme.transitions.base,
                }}
                onFocus={(e) => {
                  if (!errors.description) {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.description) {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
                  }
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
                Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: theme.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.base,
                    pointerEvents: 'none',
                  }}
                >
                  {getCurrencySymbol(selectedWalletCurrency)}
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
                    paddingLeft: theme.spacing[8],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.amount ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                    if (!errors.amount) {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.amount) {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }
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
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
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
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                    if (!errors.wallet) {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.wallet) {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TemplateForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      type: PropTypes.string,
    })
  ),
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      currency: PropTypes.string,
    })
  ),
};

export default TemplateForm;
