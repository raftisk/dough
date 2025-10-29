import PropTypes from 'prop-types';
import { MoreVertical } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const {
    category,
    amount,
    spent_amount,
    remaining_amount,
    percentage_used,
    period,
    is_active = true,
  } = budget;

  // Determine progress bar color based on percentage
  const getProgressColor = () => {
    if (!is_active) return theme.colors.border.medium; // Gray for inactive
    if (percentage_used >= 100) return theme.colors.semantic.expense; // Red
    if (percentage_used >= 75) return theme.colors.alert.warning; // Orange/Yellow
    return theme.colors.semantic.income; // Green
  };

  // Format currency
  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  // Capitalize period
  const formatPeriod = (p) => {
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

  const cardOpacity = is_active ? 1 : 0.6;

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.lg,
        padding: theme.spacing[5],
        transition: theme.transitions.base,
        opacity: cardOpacity,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (is_active) {
          e.currentTarget.style.boxShadow = theme.shadows.md;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (is_active) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Header - Category Icon + Name + Period Badge + Menu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], flex: 1 }}>
          {/* Category Icon */}
          <div style={{ lineHeight: 1 }}>
            {(() => {
              const CategoryIcon = getIconComponent(category.icon);
              return <CategoryIcon size={24} color={theme.colors.text.primary} />;
            })()}
          </div>

          {/* Category Name */}
          <span
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}
          >
            {category.name}
          </span>

          {/* Period Badge */}
          <span
            style={{
              backgroundColor: theme.colors.background.cardHover,
              color: theme.colors.text.secondary,
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.border.radius.full,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {formatPeriod(period)}
          </span>

          {/* Inactive Badge */}
          {!is_active && (
            <span
              style={{
                backgroundColor: theme.colors.border.medium,
                color: theme.colors.text.secondary,
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.border.radius.full,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Inactive
            </span>
          )}
        </div>

        {/* Menu Icon */}
        {(onEdit || onDelete) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // For now just console log, can add dropdown menu later
              console.log('Menu clicked for budget:', budget);
            }}
            style={{
              padding: theme.spacing[1],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: theme.border.radius.base,
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
            <MoreVertical size={20} color={theme.colors.text.secondary} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginBottom: theme.spacing[3],
        }}
      >
        {/* Progress container */}
        <div
          style={{
            width: '100%',
            height: '12px',
            backgroundColor: theme.colors.border.light,
            borderRadius: theme.border.radius.full,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Progress fill */}
          <div
            style={{
              height: '100%',
              width: `${Math.min(percentage_used, 100)}%`,
              backgroundColor: getProgressColor(),
              borderRadius: theme.border.radius.full,
              transition: 'width 500ms ease-out',
            }}
          />
        </div>

        {/* Percentage text */}
        <div
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing[1],
            textAlign: 'right',
          }}
        >
          {percentage_used.toFixed(0)}%
        </div>
      </div>

      {/* Footer - Amounts */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Spent / Total */}
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
            €{formatAmount(spent_amount)}
          </span>
          {' / '}
          €{formatAmount(amount)}
        </div>

        {/* Remaining */}
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: remaining_amount >= 0 ? theme.colors.text.muted : theme.colors.semantic.expense,
          }}
        >
          {remaining_amount >= 0 ? (
            <>€{formatAmount(remaining_amount)} remaining</>
          ) : (
            <>€{formatAmount(remaining_amount)} over</>
          )}
        </div>
      </div>
    </div>
  );
};

BudgetCard.propTypes = {
  budget: PropTypes.shape({
    category: PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
    }).isRequired,
    amount: PropTypes.number.isRequired,
    spent_amount: PropTypes.number.isRequired,
    remaining_amount: PropTypes.number.isRequired,
    percentage_used: PropTypes.number.isRequired,
    period: PropTypes.string.isRequired,
    is_active: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default BudgetCard;
