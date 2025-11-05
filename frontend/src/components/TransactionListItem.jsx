import PropTypes from 'prop-types';
import { Plus, Minus, ArrowRightLeft, Trash2, RefreshCw } from 'lucide-react';
import { theme, getTypeColor } from '../styles/theme';
import { getIconComponent, DEFAULT_CURRENCY } from '../constants';
import { formatAmount } from '../utils/format';
import CategoryTag from './CategoryTag';

const TransactionListItem = ({ transaction, onClick, onDelete }) => {
  // Determine icon based on transaction type
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
        return <Plus size={20} color={theme.colors.semantic.income} />;
      case 'expense':
        return <Minus size={20} color={theme.colors.semantic.expense} />;
      case 'transfer':
        return <ArrowRightLeft size={20} color={theme.colors.semantic.transfer} />;
      default:
        return <Minus size={20} color={theme.colors.text.secondary} />;
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get currency CODE from wallet (not symbol)
  const currency = transaction.wallet_currency || DEFAULT_CURRENCY;

  // Determine sign and sign color based on transaction type
  const getSignDisplay = () => {
    const type = transaction.type?.toLowerCase();
    if (type === 'income') {
      return { sign: '+', color: theme.colors.semantic.income };
    } else if (type === 'expense') {
      return { sign: '-', color: theme.colors.semantic.expense };
    }
    // Transfer or other types: no sign, default color
    return { sign: '', color: theme.colors.text.primary };
  };

  const signDisplay = getSignDisplay();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.base,
        padding: theme.spacing[2],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing[3],
        transition: theme.transitions.fast,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Left section: Type icon + Description + Metadata */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3], flex: 1 }}>
        {/* Type Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            height: '40px',
          }}
        >
          {getTypeIcon(transaction.type)}
        </div>

        {/* Description and metadata */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
            }}
          >
            {transaction.description}
            {transaction.recurrence && transaction.recurrence !== 'none' && (
              <RefreshCw size={14} color={theme.colors.text.muted} />
            )}
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              display: 'flex',
              gap: theme.spacing[2],
            }}
          >
            <span>{formatDate(transaction.date)}</span>
            <span>•</span>
            <span>
              {transaction.type?.toLowerCase() === 'transfer'
                ? `${transaction.from_wallet_name} → ${transaction.to_wallet_name}`
                : transaction.wallet}
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Category (only shown for non-transfers) */}
      {transaction.type?.toLowerCase() !== 'transfer' && transaction.category && (
        <CategoryTag category={{ icon: transaction.category_icon, name: transaction.category }} />
      )}

      {/* Right section: Amount + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[4] }}>
        {/* Amount */}
        <div
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            textAlign: 'right',
            minWidth: '100px',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'flex-end',
            gap: '4px',
          }}
        >
          {signDisplay.sign && (
            <span
              style={{
                color: signDisplay.color,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              {signDisplay.sign}
            </span>
          )}
          <span style={{ color: theme.colors.text.primary }}>
            {formatAmount(transaction.amount, currency)}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: theme.spacing[2] }}>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(transaction);
              }}
              style={{
                padding: theme.spacing[2],
                borderRadius: theme.border.radius.base,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 size={16} color={theme.colors.text.primary} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

TransactionListItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    category: PropTypes.string,
    category_icon: PropTypes.string,
    wallet: PropTypes.string,
    from_wallet_name: PropTypes.string,
    to_wallet_name: PropTypes.string,
    currency_symbol: PropTypes.string,
    recurrence: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TransactionListItem;
