import PropTypes from 'prop-types';
import { X, CalendarClock, Calendar1 } from 'lucide-react';
import { theme } from '../styles/theme';
import TransactionListItem from './TransactionListItem';
import {
  deleteUpcomingTransaction,
  skipUpcomingTransaction,
  skipAllUpcomingTransactions,
  postUpcomingTransaction,
} from '../services/api';

const UpcomingTransactionsList = ({
  isOpen,
  onClose,
  upcomingTransactions,
  onEdit,
  onRefresh,
}) => {
  if (!isOpen) return null;

  // Separate due and upcoming transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueTransactions = upcomingTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    transactionDate.setHours(0, 0, 0, 0);
    return transactionDate <= today;
  });

  const futureTransactions = upcomingTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    transactionDate.setHours(0, 0, 0, 0);
    return transactionDate > today;
  });

  // Helper to check if transaction is recurring
  const isRecurring = (transaction) => {
    return transaction.recurrence &&
           transaction.recurrence !== 'none' &&
           transaction.recurrence !== '';
  };

  // Build menu options based on transaction context
  const getMenuOptions = (transaction, isDue) => {
    const options = [];
    const recurring = isRecurring(transaction);

    // Post option for due transactions
    if (isDue) {
      options.push({
        label: 'Post',
        action: 'post',
        icon: 'Plus',
        variant: 'default',
      });
    }

    // Delete/Skip options based on recurring status
    if (recurring) {
      options.push({
        label: 'Skip This',
        action: 'skip',
        icon: 'RefreshCw',
        variant: 'default',
      });
      options.push({
        label: 'Delete All',
        action: 'delete-all',
        icon: 'Trash2',
        variant: 'danger',
      });
    } else {
      options.push({
        label: 'Delete',
        action: 'delete',
        icon: 'Trash2',
        variant: 'default',
      });
    }

    return options;
  };

  // Handle menu actions
  const handleMenuAction = async (action, transaction) => {
    try {
      switch (action) {
        case 'post':
          await postUpcomingTransaction(transaction.id);
          break;
        case 'delete':
          await deleteUpcomingTransaction(transaction.id);
          break;
        case 'skip':
          await skipUpcomingTransaction(transaction.id);
          break;
        case 'delete-all':
          await skipAllUpcomingTransactions(transaction.id);
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }
      onRefresh();
    } catch (err) {
      console.error(`Failed to ${action} transaction:`, err);
      alert(err.message || `Failed to ${action} transaction`);
    }
  };

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
            maxWidth: '700px',
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
              Future Transactions
            </h2>
            <button
              onClick={onClose}
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
          <div style={{ padding: theme.spacing[6] }}>
            {upcomingTransactions.length === 0 ? (
              <div
                style={{
                  padding: theme.spacing[8],
                  textAlign: 'center',
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.base,
                }}
              >
                No future transactions scheduled
              </div>
            ) : (
              <>
                {/* Due Transactions Section */}
                {dueTransactions.length > 0 && (
                  <div style={{ marginBottom: theme.spacing[6] }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        marginBottom: theme.spacing[4],
                        paddingBottom: theme.spacing[2],
                        borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                      }}
                    >
                      <CalendarClock size={16} color={theme.colors.text.secondary} />
                      <h3
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                          margin: 0,
                        }}
                      >
                        Due
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                      {dueTransactions.map((transaction) => (
                        <TransactionListItem
                          key={transaction.id}
                          transaction={{
                            ...transaction,
                            category: transaction.category_name,
                            category_icon: transaction.category_icon,
                            wallet: transaction.wallet_name,
                          }}
                          onClick={() => onEdit(transaction)}
                          menuOptions={getMenuOptions(transaction, true)}
                          onMenuAction={handleMenuAction}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Future Transactions Section */}
                {futureTransactions.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        marginBottom: theme.spacing[4],
                        paddingBottom: theme.spacing[2],
                        borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                      }}
                    >
                      <Calendar1 size={16} color={theme.colors.text.secondary} />
                      <h3
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                          margin: 0,
                        }}
                      >
                        Upcoming
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                      {futureTransactions.map((transaction) => (
                        <TransactionListItem
                          key={transaction.id}
                          transaction={{
                            ...transaction,
                            category: transaction.category_name,
                            category_icon: transaction.category_icon,
                            wallet: transaction.wallet_name,
                          }}
                          onClick={() => onEdit(transaction)}
                          menuOptions={getMenuOptions(transaction, false)}
                          onMenuAction={handleMenuAction}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

UpcomingTransactionsList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  upcomingTransactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
      amount: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      recurrence: PropTypes.string,
      category_name: PropTypes.string,
      category_icon: PropTypes.string,
      wallet_name: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default UpcomingTransactionsList;
