import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';
import { formatCurrency } from '../utils/format';
import BudgetDoughnut from './BudgetDoughnut';

/**
 * LargeBudgetCard - Budget display card with doughnut visualization
 * Shows budget info with visual progress indicator
 */
const LargeBudgetCard = ({ budget, onClick }) => {
  const IconComponent = getIconComponent(budget.category_data.icon);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.lg,
        padding: theme.spacing[6],
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing[6],
        transition: theme.transitions.fast,
        boxShadow: theme.shadows.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
        e.currentTarget.style.borderColor = theme.colors.border.medium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.sm;
        e.currentTarget.style.borderColor = theme.colors.border.light;
      }}
    >
      {/* Left Section: Doughnut Chart (40%) */}
      <div
        style={{
          flex: '0 0 40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BudgetDoughnut percentage={budget.percentage_spent}>
          <IconComponent size={36} color="#000000" strokeWidth={1.5} />
        </BudgetDoughnut>
      </div>

      {/* Right Section: Budget Information (60%) */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: theme.spacing[2],
        }}
      >
        {/* Category Name */}
        <h3
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          {budget.category_data.name}
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
            {formatCurrency(budget.spent_amount)}
          </span>
          {' spent of '}
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {formatCurrency(budget.amount)}
          </span>
        </div>

        {/* Remaining Information */}
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          {formatCurrency(budget.remaining_amount)} remaining
        </div>
      </div>
    </div>
  );
};

LargeBudgetCard.propTypes = {
  budget: PropTypes.shape({
    id: PropTypes.number.isRequired,
    category_data: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }).isRequired,
    amount: PropTypes.number.isRequired,
    spent_amount: PropTypes.number.isRequired,
    remaining_amount: PropTypes.number.isRequired,
    percentage_spent: PropTypes.number.isRequired,
    period_display: PropTypes.string.isRequired,
    reset: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default LargeBudgetCard;
