import PropTypes from 'prop-types';
import { theme } from '../styles/theme';
import { formatAmount } from '../utils/format';

const TransactionSummary = ({ transactions, currency = 'EUR' }) => {
  // Calculate totals
  const calculateTotals = () => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount) || 0;

      if (transaction.type?.toLowerCase() === 'income') {
        income += amount;
      } else if (transaction.type?.toLowerCase() === 'expense') {
        expenses += amount;
      }
      // Transfers are not included in calculations
    });

    return {
      income,
      expenses,
      savings: income - expenses,
    };
  };

  const totals = calculateTotals();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: theme.spacing[6],
        marginBottom: theme.spacing[4],
        paddingBottom: theme.spacing[4],
        borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
      }}
    >
      {/* Income */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.semantic.income,
          }}
        >
          {formatAmount(totals.income, currency)}
        </div>
      </div>

      {/* Expenses */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.semantic.expense,
          }}
        >
          {formatAmount(-totals.expenses, currency)}
        </div>
      </div>
    </div>
  );
};

TransactionSummary.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  currency: PropTypes.string,
};

export default TransactionSummary;
