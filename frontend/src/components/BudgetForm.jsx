import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';

const BudgetForm = ({ isOpen, onClose, onSubmit, initialData, categories }) => {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [reset, setReset] = useState(true);
  const [rollover, setRollover] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      // Edit mode - populate form
      setCategoryId(initialData.category || '');
      setAmount(initialData.amount || '');
      setPeriod(initialData.period || 'monthly');
      setReset(initialData.reset !== undefined ? initialData.reset : true);
      setRollover(initialData.rollover || false);
    } else if (isOpen) {
      // Create mode - reset form
      setCategoryId('');
      setAmount('');
      setPeriod('monthly');
      setReset(true);
      setRollover(false);
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!categoryId) {
      setError('Please select a category');
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
      category: parseInt(categoryId),
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
        zIndex: theme.zIndex.modal || 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.xl,
          maxWidth: '500px',
          width: '100%',
          padding: theme.spacing[6],
          boxShadow: theme.shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing[6],
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}
          >
            {initialData ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: theme.spacing[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} color={theme.colors.text.secondary} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: theme.colors.semantic.expenseLight,
                color: theme.colors.semantic.expense,
                padding: theme.spacing[3],
                borderRadius: theme.border.radius.base,
                marginBottom: theme.spacing[4],
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {error}
            </div>
          )}

          {/* Category Dropdown */}
          <div style={{ marginBottom: theme.spacing[4] }}>
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
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                backgroundColor: theme.colors.background.card,
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: theme.spacing[4] }}>
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
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  pointerEvents: 'none',
                }}
              >
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  paddingLeft: theme.spacing[6],
                  backgroundColor: theme.colors.background.card,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                }}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Period */}
          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[1],
              }}
            >
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                backgroundColor: theme.colors.background.card,
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="6-month">Half-Year</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Reset Checkbox */}
          <div style={{ marginBottom: theme.spacing[4] }}>
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
                checked={reset}
                onChange={(e) => {
                  setReset(e.target.checked);
                  // If unchecking reset, also uncheck rollover
                  if (!e.target.checked) {
                    setRollover(false);
                  }
                }}
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
                Recurring
              </span>
            </label>
            <p
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.muted,
                marginTop: theme.spacing[1],
                marginLeft: `calc(16px + ${theme.spacing[2]})`,
              }}
            >
              Budget automatically renews each period
            </p>
          </div>

          {/* Rollover Checkbox - only show if Reset is checked */}
          {reset && (
            <div style={{ marginBottom: theme.spacing[4] }}>
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
                  checked={rollover}
                  onChange={(e) => setRollover(e.target.checked)}
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
                  Rollover
                </span>
              </label>
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.muted,
                  marginTop: theme.spacing[1],
                  marginLeft: `calc(16px + ${theme.spacing[2]})`,
                }}
              >
                Unused budget carries over to next period
              </p>
            </div>
          )}

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
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                backgroundColor: 'transparent',
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
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
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                backgroundColor: theme.colors.action.primary,
                border: 'none',
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.inverse,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
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
    category: PropTypes.number,
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
