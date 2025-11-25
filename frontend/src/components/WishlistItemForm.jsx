import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import MonthPicker from './MonthPicker';
import Toggle from './Toggle';
import { getCurrencySymbol } from '../utils/format';
import { FALLBACK_CURRENCY } from '../constants';
import api from '../services/api';

const WishlistItemForm = ({ isOpen, onClose, onSave, item = null, categories = [] }) => {
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [target, setTarget] = useState('');
  const [useSavings, setUseSavings] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && item) {
      // Edit mode - populate form
      setDescription(item.description || '');
      setAmount(item.amount?.toString() || '');
      setCategoryId(item.category?.toString() || '');
      setPriority(item.priority || 'medium');
      setTarget(item.target || '');
      setUseSavings(item.use_savings || false);
    } else if (isOpen) {
      // Create mode - reset form
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

      setDescription('');
      setAmount('');
      setCategoryId('');
      setPriority('medium');
      setTarget(currentMonth);
      setUseSavings(false);
      setErrors({});
    }
  }, [isOpen, item]);

  // Filter categories - only expense categories
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!categoryId) {
      newErrors.category = 'Category is required';
    }

    if (!target) {
      newErrors.target = 'Target month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = {
      description: description.trim(),
      amount: parseFloat(amount),
      category: parseInt(categoryId, 10),
      priority: priority,
      target: target,
      use_savings: useSavings,
    };

    try {
      if (item) {
        // Edit mode: PUT or PATCH
        await api.put(`/wishlist-items/${item.id}/`, formData);
      } else {
        // Create mode: POST
        await api.post('/wishlist-items/', formData);
      }

      onSave(); // Trigger parent refresh
      onClose(); // Close form
    } catch (error) {
      // Handle API errors
      if (error.response?.data) {
        // Backend validation errors
        const backendErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          const errorMsg = error.response.data[key];
          backendErrors[key] = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;
        });
        setErrors(backendErrors);
      } else {
        // Generic error
        alert('Failed to save goal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

  return (
    // Modal Overlay
    <div style={theme.components.modal.overlay} onClick={handleCancel}>
      {/* Modal Content */}
      <div style={theme.components.modal.content} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={theme.components.modal.header}>
          <h2 style={theme.components.modal.title}>
            {item ? 'Edit Goal' : 'Create Goal'}
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
            {/* Description */}
            <div>
              <label style={theme.components.form.label}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., New Laptop, Emergency Fund, Vacation"
                maxLength={500}
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
              <label style={theme.components.form.label}>
                Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={theme.components.form.currencyPrefix}>
                  {getCurrencySymbol(FALLBACK_CURRENCY)}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
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
              <label style={theme.components.form.label}>
                Category
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    ...theme.components.form.select,
                    borderColor: errors.category
                      ? theme.colors.semantic.expense
                      : theme.colors.border.medium,
                  }}
                  onFocus={(e) => {
                    if (!errors.category) {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.category) {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }
                  }}
                >
                  <option value="">Select category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
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

            {/* Priority */}
            <div>
              <label style={theme.components.form.label}>Priority</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={theme.components.form.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
              </div>
            </div>

            {/* Target Month */}
            <div>
              <label style={theme.components.form.label}>
                Target Month
              </label>
              <MonthPicker
                value={target}
                onChange={(newTarget) => setTarget(newTarget)}
                placeholder="Select target month"
              />
              {errors.target && <p style={theme.components.form.errorText}>{errors.target}</p>}
            </div>

            {/* Use Savings Toggle */}
            <div>
              <Toggle
                checked={useSavings}
                onChange={() => setUseSavings(!useSavings)}
                label="Use savings for this goal"
                description="Allows using money from Saving and Investment wallets"
              />
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
              style={theme.components.button.secondary}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...theme.components.button.primary,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primary;
                }
              }}
            >
              {loading ? 'Saving...' : item ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

WishlistItemForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
    amount: PropTypes.number,
    category: PropTypes.number,
    priority: PropTypes.string,
    target: PropTypes.string,
    use_savings: PropTypes.bool,
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
};

export default WishlistItemForm;
