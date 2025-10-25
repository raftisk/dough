import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import CurrencyPicker from './CurrencyPicker';
import { CURRENCIES } from '../constants';

const WalletForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) => {
  // Initialize form state
  const [name, setName] = useState('');
  const [type, setType] = useState('spending');
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [currency, setCurrency] = useState({ code: 'EUR', name: 'Euro', symbol: '€' });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setType(initialData.type || 'spending');
      setInitialBalance(initialData.initial_balance?.toString() || '0.00');

      // Convert currency code string to currency object
      const currencyCode = initialData.currency || 'EUR';
      const currencyObj = CURRENCIES.find(c => c.code === currencyCode) || { code: 'EUR', name: 'Euro', symbol: '€' };
      setCurrency(currencyObj);
    } else {
      // Reset form for new wallet
      setName('');
      setType('spending');
      setInitialBalance('0.00');
      setCurrency({ code: 'EUR', name: 'Euro', symbol: '€' });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!type) {
      newErrors.type = 'Type is required';
    }

    const balanceNum = parseFloat(initialBalance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      newErrors.initialBalance = 'Balance must be 0 or greater';
    }

    if (!currency || !currency.code) {
      newErrors.currency = 'Currency is required';
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

    const walletData = {
      name: name.trim(),
      type,
      initial_balance: parseFloat(initialBalance),
      currency: currency.code,
    };

    if (mode === 'edit' && initialData) {
      walletData.id = initialData.id;
    }

    onSubmit(walletData);
  };

  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyPicker(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
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
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.border.radius.xl,
            boxShadow: theme.shadows.xl,
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: theme.spacing[6],
              borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
              }}
            >
              {mode === 'edit' ? 'Edit Wallet' : 'Add Wallet'}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: theme.spacing[2],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.text.secondary,
                borderRadius: theme.border.radius.base,
                transition: theme.transitions.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: theme.spacing[6],
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing[5],
              }}
            >
              {/* Name Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label
                  htmlFor="wallet-name"
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Name
                </label>
                <input
                  id="wallet-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Spending Wallet, Savings Account"
                  style={{
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    fontSize: theme.typography.fontSize.base,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.name ? theme.colors.semantic.expense : theme.colors.border.light
                    }`,
                    borderRadius: theme.border.radius.base,
                    backgroundColor: theme.colors.background.card,
                    color: theme.colors.text.primary,
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = theme.colors.border.light;
                    }
                  }}
                />
                {errors.name && (
                  <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Type Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label
                  htmlFor="wallet-type"
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="wallet-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      paddingRight: theme.spacing[10],
                      fontSize: theme.typography.fontSize.base,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                      borderRadius: theme.border.radius.base,
                      backgroundColor: theme.colors.background.card,
                      color: theme.colors.text.primary,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: theme.transitions.base,
                      textTransform: 'capitalize',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.light;
                    }}
                  >
                    <option value="spending">Spending</option>
                    <option value="saving">Saving</option>
                    <option value="cash">Cash</option>
                    <option value="investment">Investment</option>
                  </select>
                  <ChevronDown
                    size={20}
                    style={{
                      position: 'absolute',
                      right: theme.spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Currency Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label
                  htmlFor="wallet-currency"
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Currency
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    style={{
                      width: '100%',
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      paddingRight: theme.spacing[10],
                      fontSize: theme.typography.fontSize.base,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                        errors.currency ? theme.colors.semantic.expense : theme.colors.border.light
                      }`,
                      borderRadius: theme.border.radius.base,
                      backgroundColor: theme.colors.background.card,
                      color: theme.colors.text.primary,
                      outline: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: theme.transitions.base,
                    }}
                    onMouseEnter={(e) => {
                      if (!errors.currency) {
                        e.currentTarget.style.borderColor = theme.colors.text.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.currency) {
                        e.currentTarget.style.borderColor = theme.colors.border.light;
                      }
                    }}
                  >
                    {currency ? `${currency.code} (${currency.symbol})` : 'Choose currency'}
                    <ChevronDown
                      size={20}
                      style={{
                        position: 'absolute',
                        right: theme.spacing[3],
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: theme.colors.text.secondary,
                        pointerEvents: 'none',
                      }}
                    />
                  </button>
                  {/* Currency Picker Popover */}
                  <CurrencyPicker
                    isOpen={showCurrencyPicker}
                    onClose={() => setShowCurrencyPicker(false)}
                    onSelectCurrency={handleCurrencySelect}
                    selectedCurrency={currency}
                  />
                </div>
                {errors.currency && (
                  <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense }}>
                    {errors.currency}
                  </span>
                )}
              </div>

              {/* Initial Balance Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label
                  htmlFor="wallet-balance"
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Initial Balance
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
                    {currency?.symbol || '€'}
                  </span>
                  <input
                    id="wallet-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      paddingLeft: theme.spacing[6],
                      fontSize: theme.typography.fontSize.base,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                        errors.initialBalance ? theme.colors.semantic.expense : theme.colors.border.light
                      }`,
                      borderRadius: theme.border.radius.base,
                      backgroundColor: theme.colors.background.card,
                      color: theme.colors.text.primary,
                      outline: 'none',
                      transition: theme.transitions.base,
                    }}
                    onFocus={(e) => {
                      if (!errors.initialBalance) {
                        e.currentTarget.style.borderColor = theme.colors.text.primary;
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.initialBalance) {
                        e.currentTarget.style.borderColor = theme.colors.border.light;
                      }
                    }}
                  />
                </div>
                {errors.initialBalance && (
                  <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense }}>
                    {errors.initialBalance}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: theme.spacing[6],
                borderTop: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing[3],
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.secondary,
                  backgroundColor: 'transparent',
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                  borderRadius: theme.border.radius.base,
                  cursor: 'pointer',
                  transition: theme.transitions.base,
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
                  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.background.card,
                  backgroundColor: theme.colors.text.primary,
                  border: 'none',
                  borderRadius: theme.border.radius.base,
                  cursor: 'pointer',
                  transition: theme.transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {mode === 'edit' ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

WalletForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
    initial_balance: PropTypes.number,
    currency: PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
      symbol: PropTypes.string,
    }),
  }),
  mode: PropTypes.oneOf(['create', 'edit']),
};

export default WalletForm;
