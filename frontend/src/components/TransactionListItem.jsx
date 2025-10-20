import PropTypes from 'prop-types';
import { Plus, Minus, ArrowRightLeft, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { theme, getTypeColor } from '../styles/theme';

const TransactionListItem = ({ transaction, onEdit, onDelete }) => {
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

  // Format currency amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.base,
        padding: theme.spacing[4],
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
            {transaction.recurrence && (
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
            <span>{transaction.wallet}</span>
            <span>•</span>
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      {/* Center section: Category */}
      {transaction.category && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
            backgroundColor: theme.colors.background.cardHover,
            borderRadius: theme.border.radius.full,
          }}
        >
          <span style={{ fontSize: theme.typography.fontSize.lg }}>
            {transaction.category_icon || '📁'}
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            {transaction.category}
          </span>
        </div>
      )}

      {/* Right section: Amount + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[4] }}>
        {/* Amount */}
        <div
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            textAlign: 'right',
            minWidth: '100px',
          }}
        >
          <span style={{ color: getTypeColor(transaction.type) }}>
            {transaction.type?.toLowerCase() === 'income' ? '+' : '-'}
          </span>
          {transaction.currency_symbol || '$'}
          {formatAmount(transaction.amount)}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: theme.spacing[2] }}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
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
              <Edit2 size={16} color={theme.colors.text.primary} />
            </button>
          )}
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
                e.currentTarget.style.backgroundColor = theme.colors.semantic.expenseLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 size={16} color={theme.colors.semantic.expense} />
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
    wallet: PropTypes.string.isRequired,
    currency_symbol: PropTypes.string,
    recurrence: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TransactionListItem;
