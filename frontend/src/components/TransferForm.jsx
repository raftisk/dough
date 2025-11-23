import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';
import DatePicker from './DatePicker';
import { formatDateToLocal } from '../utils/format';

const TransferForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  wallets = [],
}) => {
  // Initialize form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [date, setDate] = useState(formatDateToLocal(new Date()));
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setFromWalletId(initialData.from_wallet?.toString() || '');
      setToWalletId(initialData.to_wallet?.toString() || '');
      setDate(initialData.date || formatDateToLocal(new Date()));
    } else {
      // Reset form for new transfer
      setDescription('');
      setAmount('');
      setFromWalletId(wallets.length > 0 ? wallets[0].id.toString() : '');
      setToWalletId(wallets.length > 1 ? wallets[1].id.toString() : '');
      setDate(formatDateToLocal(new Date()));
    }
    setErrors({});
  }, [initialData, wallets, isOpen]);

  // Set default wallets when wallets load
  useEffect(() => {
    if (!fromWalletId && wallets.length > 0) {
      setFromWalletId(wallets[0].id.toString());
    }
    if (!toWalletId && wallets.length > 1) {
      setToWalletId(wallets[1].id.toString());
    }
  }, [wallets, fromWalletId, toWalletId]);

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

    if (!fromWalletId) {
      newErrors.from_wallet = 'From wallet is required';
    }

    if (!toWalletId) {
      newErrors.to_wallet = 'To wallet is required';
    }

    // Validate that from_wallet !== to_wallet
    if (fromWalletId && toWalletId && fromWalletId === toWalletId) {
      newErrors.to_wallet = 'Cannot transfer to the same wallet';
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
      description: description.trim(),
      amount: parseFloat(amount),
      from_wallet: parseInt(fromWalletId, 10),
      to_wallet: parseInt(toWalletId, 10),
      date,
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

  return (
    // Modal Overlay
    <div style={theme.components.modal.overlay} onClick={handleCancel}>
      {/* Modal Content */}
      <div style={theme.components.modal.content} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={theme.components.modal.header}>
          <h2 style={theme.components.modal.title}>
            {initialData ? 'Edit Transfer' : 'Add Transfer'}
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
              <label style={theme.components.form.label}>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly savings transfer"
                maxLength={200}
                style={{
                  ...theme.components.form.input,
                  borderColor: errors.description
                    ? theme.colors.semantic.expense
                    : theme.colors.border.medium,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.text.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.medium;
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
                <span style={theme.components.form.currencyPrefix}>€</span>
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

            {/* From Wallet */}
            <div>
              <label style={theme.components.form.label}>From Wallet</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
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
              {errors.from_wallet && (
                <p style={theme.components.form.errorText}>{errors.from_wallet}</p>
              )}
            </div>

            {/* To Wallet */}
            <div>
              <label style={theme.components.form.label}>To Wallet</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
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
              {errors.to_wallet && (
                <p style={theme.components.form.errorText}>{errors.to_wallet}</p>
              )}
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
                placeholder="Select date"
              />
              {errors.date && <p style={theme.components.form.errorText}>{errors.date}</p>}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TransferForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default TransferForm;
