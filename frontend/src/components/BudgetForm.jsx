import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent, FALLBACK_CURRENCY } from '../constants';
import { getCurrencySymbol } from '../utils/format';
import Toggle from './Toggle';

const BudgetForm = ({ isOpen, onClose, onSubmit, initialData, categories }) => {
  const [name, setName] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [reset, setReset] = useState(true);
  const [rollover, setRollover] = useState(false);
  const [error, setError] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const categoriesDropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialData) {
      // Edit mode - populate form
      setName(initialData.name || '');
      setCategoryIds(initialData.categories || []);
      setAmount(initialData.amount || '');
      setPeriod(initialData.period || 'monthly');
      setReset(initialData.reset !== undefined ? initialData.reset : true);
      setRollover(initialData.rollover || false);
    } else if (isOpen) {
      // Create mode - reset form
      setName('');
      setCategoryIds([]);
      setAmount('');
      setPeriod('monthly');
      setReset(true);
      setRollover(false);
      setError('');
    }
  }, [isOpen, initialData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoriesOpen && categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoriesOpen]);

  const handleCategoryToggle = (categoryId) => {
    if (categoryIds.includes(categoryId)) {
      setCategoryIds(categoryIds.filter((id) => id !== categoryId));
    } else {
      setCategoryIds([...categoryIds, categoryId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter a budget name');
      return;
    }
    if (categoryIds.length === 0) {
      setError('Please select at least one category');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Rollover validation
    if (rollover && !reset) {
      setError('Rollover can only be enabled when reset is enabled');
      return;
    }

    const payload = {
      name: name.trim(),
      categories: categoryIds.map(id => parseInt(id)),
      amount: parseFloat(amount),
      period: period,
      reset: reset,
      rollover: rollover,
    };

    try {
      await onSubmit(payload);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={theme.components.modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={theme.components.modal.content} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={theme.components.modal.header}>
          <h2 style={theme.components.modal.title}>
            {initialData ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} style={{ padding: theme.spacing[6], paddingTop: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: theme.colors.semantic.expenseLight,
                color: theme.colors.semantic.expense,
                padding: theme.spacing[3],
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {error}
            </div>
          )}

          {/* Budget Name */}
          <div>
            <label style={theme.components.form.label}>Budget Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={theme.components.form.input}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.text.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.medium;
              }}
              placeholder="e.g., Monthly Essentials, Entertainment"
              required
            />
          </div>

          {/* Categories Dropdown with Checkboxes */}
          <div>
            <label style={theme.components.form.label}>Categories</label>
            <div style={{ position: 'relative' }} ref={categoriesDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                style={theme.components.form.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.text.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.medium;
                }}
              >
                {categoryIds.length === 0
                  ? 'Select categories'
                  : `${categoryIds.length} categor${categoryIds.length === 1 ? 'y' : 'ies'} selected`}
              </button>
              <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
              {isCategoriesOpen && (
                <div
                  style={{
                    ...theme.components.popover.menu,
                    width: '100%',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <label
                        key={category.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing[2],
                          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                          cursor: 'pointer',
                          borderRadius: theme.border.radius.base,
                          transition: theme.transitions.fast,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={categoryIds.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          style={theme.components.form.checkbox}
                        />
                        <IconComponent size={16} color={theme.colors.text.primary} />
                        <span style={{ fontSize: theme.typography.fontSize.sm }}>{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={theme.components.form.label}>Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={theme.components.form.currencyPrefix}>
                {getCurrencySymbol(FALLBACK_CURRENCY)}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  ...theme.components.form.input,
                  paddingLeft: theme.spacing[6],
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.text.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.medium;
                }}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Period */}
          <div>
            <label style={theme.components.form.label}>Period</label>
            <div style={{ position: 'relative' }}>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={theme.components.form.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.text.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.medium;
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="6-month">Half-Year</option>
                <option value="yearly">Yearly</option>
              </select>
              <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div>
            <Toggle
              checked={reset}
              onChange={() => {
                setReset(!reset);
                // If unchecking reset, also uncheck rollover
                if (reset) {
                  setRollover(false);
                }
              }}
              label="Recurring"
              description="Budget automatically renews each period"
            />
          </div>

          {/* Rollover Toggle - only show if Recurring is enabled */}
          {reset && (
            <div>
              <Toggle
                checked={rollover}
                onChange={() => setRollover(!rollover)}
                label="Rollover"
                description="Unused budget carries over to next period"
              />
            </div>
          )}
          </div>

          {/* Submit Buttons */}
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
              onClick={onClose}
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
              {initialData ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

BudgetForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.number),
    amount: PropTypes.number,
    period: PropTypes.string,
    reset: PropTypes.bool,
    rollover: PropTypes.bool,
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

export default BudgetForm;
