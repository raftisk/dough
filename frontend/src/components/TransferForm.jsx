import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ArrowRightLeft, ChevronDown } from 'lucide-react';
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
            {initialData ? 'Edit Transfer' : 'Add Transfer'}
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
            {/* Transfer subtitle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}
            >
              <ArrowRightLeft size={16} color={theme.colors.semantic.transfer} />
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                Transfer between wallets
              </span>
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
                placeholder="e.g., Monthly savings transfer"
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
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
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

            {/* From Wallet */}
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
                From Wallet
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
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
              {errors.from_wallet && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.from_wallet}
                </p>
              )}
            </div>

            {/* To Wallet */}
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
                To Wallet
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
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
              {errors.to_wallet && (
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.semantic.expense, marginTop: theme.spacing[1], margin: 0 }}>
                  {errors.to_wallet}
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
