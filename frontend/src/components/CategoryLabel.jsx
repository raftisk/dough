import PropTypes from 'prop-types';
import { getIconComponent } from '../constants';
import { theme } from '../styles/theme';

const CategoryLabel = ({ category, showIcon = true, className = '' }) => {
  if (!category) return null;

  const IconComponent = getIconComponent(category.icon);

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing[2],
      }}
    >
      {showIcon && category.icon && (
        <IconComponent size={20} color={theme.colors.text.primary} />
      )}
      <span
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        }}
      >
        {category.name}
      </span>
    </div>
  );
};

CategoryLabel.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
  }).isRequired,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};

export default CategoryLabel;
