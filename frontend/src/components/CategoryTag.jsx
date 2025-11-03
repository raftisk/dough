import PropTypes from 'prop-types';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';

const CategoryTag = ({ category }) => {
  const CategoryIcon = getIconComponent(category.icon);

  return (
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
      <CategoryIcon size={18} color={theme.colors.text.primary} />
      <span
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}
      >
        {category.name}
      </span>
    </div>
  );
};

CategoryTag.propTypes = {
  category: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default CategoryTag;
