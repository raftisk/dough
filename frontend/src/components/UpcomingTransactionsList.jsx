import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { theme } from '../styles/theme';
import TransactionListItem from './TransactionListItem';
import {
  deleteUpcomingTransaction,
  skipUpcomingTransaction,
  skipAllUpcomingTransactions,
} from '../services/api';

const UpcomingTransactionsList = ({
  isOpen,
  onClose,
  upcomingTransactions,
  onEdit,
  onRefresh,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  if (!isOpen) return null;

  // Handle delete click - show modal with options
  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (action) => {
    if (!selectedTransaction) return;

    try {
      if (action === 'delete') {
        // One-time delete or direct delete
        await deleteUpcomingTransaction(selectedTransaction.id);
      } else if (action === 'skip') {
        // Skip this recurrence
        await skipUpcomingTransaction(selectedTransaction.id);
      } else if (action === 'delete-all') {
        // Delete all future
        await skipAllUpcomingTransactions(selectedTransaction.id);
      }

      setShowDeleteModal(false);
      setSelectedTransaction(null);
      onRefresh(); // Refresh upcoming list
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(err.message || 'Failed to delete transaction');
    }
  };

  const isRecurring = selectedTransaction &&
    selectedTransaction.recurrence &&
    selectedTransaction.recurrence !== 'none' &&
    selectedTransaction.recurrence !== '';

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                {upcomingTransactions.map((transaction) => (
                  <TransactionListItem
                    key={transaction.id}
                    transaction={{
                      ...transaction,
                      category: transaction.category_name,
                      category_icon: transaction.category_icon,
                      wallet: transaction.wallet_name,
                    }}
                    onClick={() => onEdit(transaction)}
                    onDelete={() => handleDeleteClick(transaction)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Options Modal */}
      {showDeleteModal && (
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
            zIndex: theme.zIndex.modal + 1,
            padding: theme.spacing[4],
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.border.radius.xl,
              maxWidth: '450px',
              width: '100%',
              boxShadow: theme.shadows.xl,
              padding: theme.spacing[6],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
                marginTop: 0,
              }}
            >
              {isRecurring ? 'Manage Recurring Transaction' : 'Delete Transaction'}
            </h3>

            {isRecurring ? (
              <>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing[4],
                  }}
                >
                  This is a recurring transaction. Choose an action:
                </p>

                {/* Skip This Option */}
                <button
                  onClick={() => handleDeleteConfirm('skip')}
                  style={{
                    width: '100%',
                    padding: theme.spacing[4],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                    borderRadius: theme.border.radius.base,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    marginBottom: theme.spacing[3],
                    transition: theme.transitions.fast,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.card;
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    Skip This Recurrence
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Delete this occurrence and create the next one
                  </div>
                </button>

                {/* Delete All Option */}
                <button
                  onClick={() => handleDeleteConfirm('delete-all')}
                  style={{
                    width: '100%',
                    padding: theme.spacing[4],
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.semantic.expense}`,
                    borderRadius: theme.border.radius.base,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    marginBottom: theme.spacing[3],
                    transition: theme.transitions.fast,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.card;
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.semantic.expense,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    Delete All Future
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Delete this and all future occurrences
                  </div>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                    borderRadius: theme.border.radius.base,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
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
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing[4],
                  }}
                >
                  Are you sure you want to delete this future transaction?
                </p>

                <div style={{ display: 'flex', gap: theme.spacing[3], justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    style={{
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                      borderRadius: theme.border.radius.base,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
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
                    onClick={() => handleDeleteConfirm('delete')}
                    style={{
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      border: 'none',
                      borderRadius: theme.border.radius.base,
                      backgroundColor: theme.colors.semantic.expense,
                      color: theme.colors.text.inverse,
                      cursor: 'pointer',
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      transition: theme.transitions.fast,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.semantic.expense;
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
