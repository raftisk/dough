import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';
import { formatAmount } from '../utils/format';
import { FALLBACK_CURRENCY } from '../constants';
import BudgetDoughnut from './BudgetDoughnut';
import CategoryTag from './CategoryTag';

/**
 * LargeBudgetCard - Budget display card with doughnut visualization
 * Shows budget info with visual progress indicator
 */
const LargeBudgetCard = ({ budget, onClick }) => {
  const currency = budget.currency_symbol || FALLBACK_CURRENCY;

  return (
    <div
      onClick={onClick}
      style={{
        ...theme.components.card.container,
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing[6],
        boxShadow: theme.shadows.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
        e.currentTarget.style.borderColor = theme.colors.border.medium;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.sm;
        e.currentTarget.style.borderColor = theme.colors.border.light;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Left Section: Compact Doughnut Chart + Category Tags */}
      <div
        style={{
          flex: '0 0 30%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing[4],
        }}
      >
        <BudgetDoughnut percentage={budget.percentage_spent}>
          <span
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}
          >
            {Math.round(budget.percentage_spent)}%
          </span>
        </BudgetDoughnut>

        {/* Category Tags below doughnut */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: theme.spacing[2],
          }}
        >
          {budget.categories_data.map((cat) => (
            <CategoryTag key={cat.id} category={{ icon: cat.icon, name: cat.name }} />
          ))}
        </div>
      </div>

      {/* Right Section: Budget Information (70%) */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: theme.spacing[2],
        }}
      >
        {/* Budget Name */}
        <h3
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          {budget.name}
        </h3>

        {/* Period Display + Recurring Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            {budget.period_display}
          </span>
          {budget.reset && (
            <RefreshCw
              size={16}
              color={theme.colors.text.secondary}
              strokeWidth={2}
            />
          )}
        </div>

        {/* Spent Information */}
        <div
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.primary,
            marginTop: theme.spacing[1],
          }}
        >
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {formatAmount(budget.spent_amount, currency)}
          </span>
          {' spent of '}
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {formatAmount(budget.amount, currency)}
          </span>
        </div>

        {/* Remaining Information */}
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          {formatAmount(budget.remaining_amount, currency)} remaining
        </div>
      </div>
    </div>
  );
};

LargeBudgetCard.propTypes = {
  budget: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    categories_data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })
    ).isRequired,
    amount: PropTypes.number.isRequired,
    spent_amount: PropTypes.number.isRequired,
    remaining_amount: PropTypes.number.isRequired,
    percentage_spent: PropTypes.number.isRequired,
    period_display: PropTypes.string.isRequired,
    currency_symbol: PropTypes.string,
    reset: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default LargeBudgetCard;
