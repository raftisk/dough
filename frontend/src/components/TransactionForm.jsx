import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import Toggle from './Toggle';
import { formatDateToLocal, getCurrencySymbol } from '../utils/format';
import { FALLBACK_CURRENCY } from '../constants';
import { createTemplate } from '../services/api';

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
  const [date, setDate] = useState(formatDateToLocal(new Date()));
  const [recurrence, setRecurrence] = useState('');
  const [autoPost, setAutoPost] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedWalletCurrency, setSelectedWalletCurrency] = useState(FALLBACK_CURRENCY);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || transactionType);
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setCategoryId(initialData.category?.toString() || '');
      setWalletId(initialData.wallet?.toString() || '');
      setDate(initialData.date || formatDateToLocal(new Date()));
      setRecurrence(initialData.recurrence || '');
      setAutoPost(initialData.auto_post || false);
    } else {
      // Reset form for new transaction
      setType(transactionType);
      setDescription('');
      setAmount('');
      setCategoryId('');
      setWalletId(wallets.length > 0 ? wallets[0].id.toString() : '');
      setDate(formatDateToLocal(new Date()));
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

  // Track selected wallet's currency
  useEffect(() => {
    if (walletId && wallets.length > 0) {
      const selectedWallet = wallets.find(w => w.id === parseInt(walletId));
      setSelectedWalletCurrency(selectedWallet?.currency || FALLBACK_CURRENCY);
    }
  }, [walletId, wallets]);

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

  // Handle save as template
  const handleSaveAsTemplate = async () => {
    // Validate required fields for template
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!type) {
      newErrors.type = 'Type is required';
    }

    if (!walletId) {
      newErrors.wallet = 'Wallet is required';
    }

    // Category is optional for templates
    // Amount is optional (defaults to 0 in backend)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill in required fields: Description, Type, and Wallet');
      return;
    }

    try {
      // Prepare template data (exclude date and recurrence)
      const templateData = {
        description: description.trim(),
        type,
        wallet: parseInt(walletId, 10),
        amount: amount ? parseFloat(amount) : 0,
      };

      // Include category only if selected
      if (categoryId) {
        templateData.category = parseInt(categoryId, 10);
      }

      // Call API to create template
      await createTemplate(templateData);

      // Show success message
      alert('Template saved successfully!');

      // Keep form open - user might want to submit transaction too
    } catch (err) {
      console.error('Failed to save template:', err);
      alert(err.message || 'Failed to save template');
    }
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
    <div style={theme.components.modal.overlay} onClick={handleCancel}>
      {/* Modal Content */}
      <div style={theme.components.modal.content} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={theme.components.modal.header}>
          <h2 style={theme.components.modal.title}>
            {initialData && initialData.id ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={handleCancel}
            style={theme.components.modal.closeButton}
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
        <form onSubmit={handleSubmit} style={{ padding: theme.spacing[6], paddingTop: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
            {/* Type */}
            <div>
              <label
                style={{
                  ...theme.components.form.label,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}
              >
                <TypeIcon size={16} color={type === 'income' ? theme.colors.semantic.income : theme.colors.semantic.expense} />
                Type
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={theme.components.form.select}
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
                <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={theme.components.form.label}>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Salary, Groceries"
                maxLength={200}
                style={{
                  ...theme.components.form.input,
                  borderColor: errors.description
                    ? theme.colors.semantic.expense
                    : theme.colors.border.medium,
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
                <p style={theme.components.form.errorText}>{errors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label style={theme.components.form.label}>Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={theme.components.form.currencyPrefix}>
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
                    ...theme.components.form.input,
                    paddingLeft: theme.spacing[6],
                    borderColor: errors.amount
                      ? theme.colors.semantic.expense
                      : theme.colors.border.medium,
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
              {errors.amount && <p style={theme.components.form.errorText}>{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
              <label style={theme.components.form.label}>Category</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={theme.components.form.select}
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
                <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
              </div>
              {errors.category && (
                <p style={theme.components.form.errorText}>{errors.category}</p>
              )}
            </div>

            {/* Wallet */}
            <div>
              <label style={theme.components.form.label}>Wallet</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  style={theme.components.form.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
                  }}
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
              </div>
              {errors.wallet && <p style={theme.components.form.errorText}>{errors.wallet}</p>}
            </div>

            {/* Date */}
            <div>
              <label style={theme.components.form.label}>Date</label>
              <DatePicker
                date={date}
                onDateChange={(newDate) => {
                  const dateStr = newDate ? formatDateToLocal(newDate) : '';
                  setDate(dateStr);
                }}
              />
              {errors.date && <p style={theme.components.form.errorText}>{errors.date}</p>}
            </div>

            {/* Recurrence */}
            <div>
              <label style={theme.components.form.label}>Recurrence</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  disabled={initialData?.is_posted}
                  style={{
                    ...theme.components.form.select,
                    backgroundColor: initialData?.is_posted
                      ? theme.colors.background.cardHover
                      : theme.colors.background.card,
                    cursor: initialData?.is_posted ? 'default' : 'pointer',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
                  }}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {!initialData?.is_posted && (
                  <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
                )}
              </div>
            </div>

            {/* Auto-post toggle (only show for future dates) */}
            {new Date(date) > new Date() && (
              <div>
                <Toggle
                  checked={autoPost}
                  onChange={() => setAutoPost(!autoPost)}
                  label="Auto-post when date arrives"
                  description="Transaction will be posted automatically without confirmation"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing[3],
              marginTop: theme.spacing[6],
            }}
          >
            {/* Left side - Save as Template button */}
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.normal,
                color: theme.colors.text.secondary,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: theme.transitions.fast,
                textDecoration: 'underline',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.secondary;
              }}
            >
              Save as Template
            </button>

            {/* Right side - Cancel and Post buttons */}
            <div style={{ display: 'flex', gap: theme.spacing[3] }}>
              <button
                type="button"
                onClick={handleCancel}
                style={theme.components.button.secondary}
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
                style={theme.components.button.primary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primary;
                }}
              >
                {initialData && initialData.id ? 'Save' : 'Post'}
              </button>
            </div>
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
