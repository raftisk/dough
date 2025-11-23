import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown, Lock } from 'lucide-react';
import { theme } from '../styles/theme';
import CurrencyPicker from './CurrencyPicker';
import { CURRENCIES } from '../constants';
import { AuthContext } from '../contexts/AuthContext';

const WalletForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) => {
  // Get user preferences from context
  const { preferences } = useContext(AuthContext);

  // Initialize form state
  const [name, setName] = useState('');
  const [type, setType] = useState('spending');
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [currency, setCurrency] = useState({ code: 'EUR', name: 'Euro', symbol: '€' });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if currency field should be locked
  const isCurrencyLocked = !preferences?.multi_currency;

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

      // Set currency to user's default when creating new wallet
      if (preferences?.default_currency) {
        const currencyObj = CURRENCIES.find(c => c.code === preferences.default_currency) || { code: 'EUR', name: 'Euro', symbol: '€' };
        setCurrency(currencyObj);
      } else {
        setCurrency({ code: 'EUR', name: 'Euro', symbol: '€' });
      }
    }
    setErrors({});
  }, [initialData, mode, isOpen, preferences]);

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
      <div style={theme.components.modal.overlay} onClick={onClose}>
        {/* Modal Content */}
        <div
          style={{
            ...theme.components.modal.content,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={theme.components.modal.header}>
            <h2 style={theme.components.modal.title}>
              {mode === 'edit' ? 'Edit Wallet' : 'Add Wallet'}
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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: theme.spacing[6],
                paddingTop: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing[5],
              }}
            >
              {/* Name Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label htmlFor="wallet-name" style={theme.components.form.label}>
                  Name
                </label>
                <input
                  id="wallet-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Spending Wallet, Savings Account"
                  style={{
                    ...theme.components.form.input,
                    borderColor: errors.name
                      ? theme.colors.semantic.expense
                      : theme.colors.border.medium,
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }
                  }}
                />
                {errors.name && <span style={theme.components.form.errorText}>{errors.name}</span>}
              </div>

              {/* Type Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label htmlFor="wallet-type" style={theme.components.form.label}>
                  Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="wallet-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      ...theme.components.form.select,
                      textTransform: 'capitalize',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }}
                  >
                    <option value="spending">Spending</option>
                    <option value="saving">Saving</option>
                    <option value="cash">Cash</option>
                    <option value="investment">Investment</option>
                  </select>
                  <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
                </div>
              </div>

              {/* Currency Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label htmlFor="wallet-currency" style={theme.components.form.label}>
                  Currency
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => !isCurrencyLocked && setShowCurrencyPicker(!showCurrencyPicker)}
                    disabled={isCurrencyLocked}
                    style={{
                      ...theme.components.form.input,
                      borderColor: errors.currency
                        ? theme.colors.semantic.expense
                        : theme.colors.border.medium,
                      backgroundColor: isCurrencyLocked
                        ? theme.colors.background.cardHover
                        : theme.colors.background.card,
                      color: isCurrencyLocked
                        ? theme.colors.text.secondary
                        : theme.colors.text.primary,
                      cursor: isCurrencyLocked ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      opacity: isCurrencyLocked ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!errors.currency && !isCurrencyLocked) {
                        e.currentTarget.style.borderColor = theme.colors.text.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.currency && !isCurrencyLocked) {
                        e.currentTarget.style.borderColor = theme.colors.border.medium;
                      }
                    }}
                  >
                    {currency ? `${currency.code} (${currency.symbol})` : 'Choose currency'}
                    {isCurrencyLocked ? (
                      <Lock size={16} style={theme.components.popover.chevronIcon} />
                    ) : (
                      <ChevronDown size={20} style={theme.components.popover.chevronIcon} />
                    )}
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
                  <span style={theme.components.form.errorText}>{errors.currency}</span>
                )}
                {isCurrencyLocked && (
                  <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                    Multi-currency is disabled. Enable it in Settings to use different currencies.
                  </span>
                )}
              </div>

              {/* Initial Balance Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                <label htmlFor="wallet-balance" style={theme.components.form.label}>
                  Initial Balance
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={theme.components.form.currencyPrefix}>
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
                      ...theme.components.form.input,
                      paddingLeft: theme.spacing[6],
                      borderColor: errors.initialBalance
                        ? theme.colors.semantic.expense
                        : theme.colors.border.medium,
                    }}
                    onFocus={(e) => {
                      if (!errors.initialBalance) {
                        e.currentTarget.style.borderColor = theme.colors.text.primary;
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.initialBalance) {
                        e.currentTarget.style.borderColor = theme.colors.border.medium;
                      }
                    }}
                  />
                </div>
                {errors.initialBalance && (
                  <span style={theme.components.form.errorText}>{errors.initialBalance}</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: theme.spacing[6],
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing[3],
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
