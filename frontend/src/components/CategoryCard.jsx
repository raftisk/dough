import PropTypes from 'prop-types';
import { theme, getTypeBackgroundColor } from '../styles/theme';

const CategoryCard = ({ category, onClick, onEdit }) => {
  // Get badge color based on category type
  const getTypeBadgeStyle = (type) => {
    let backgroundColor, color;

    switch (type?.toLowerCase()) {
      case 'income':
        backgroundColor = theme.colors.semantic.incomeLight;
        color = theme.colors.semantic.income;
        break;
      case 'expense':
        backgroundColor = theme.colors.semantic.expenseLight;
        color = theme.colors.semantic.expense;
        break;
      default:
        backgroundColor = theme.colors.background.cardHover;
        color = theme.colors.text.secondary;
    }

    return {
      backgroundColor,
      color,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.border.radius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'capitalize',
    };
  };

  return (
    <div
      onClick={() => onClick && onClick(category)}
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.base,
        padding: theme.spacing[4],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing[3],
        cursor: onClick ? 'pointer' : 'default',
        transition: theme.transitions.base,
        position: 'relative',
        minWidth: '150px',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.md;
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.backgroundColor = theme.colors.background.card;
        }
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: theme.typography.fontSize['4xl'],
          lineHeight: 1,
        }}
      >
        {category.icon || '📁'}
      </div>

      {/* Category name */}
      <h4
        style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {category.name}
      </h4>

      {/* Type badge */}
      <span style={getTypeBadgeStyle(category.type)}>
        {category.type}
      </span>

      {/* Optional: aggregate amount if provided */}
      {category.total_amount !== undefined && (
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing[1],
          }}
        >
          ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(category.total_amount)}
        </div>
      )}
    </div>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string.isRequired,
    total_amount: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
};

export default CategoryCard;
