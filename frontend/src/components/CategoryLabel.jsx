import PropTypes from 'prop-types';

const CategoryLabel = ({ category, showIcon = true, className = '' }) => {
  if (!category) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showIcon && category.icon && (
        <span className="text-xl">{category.icon}</span>
      )}
      <span className="text-sm font-medium text-gray-900">{category.name}</span>
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
