import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const WalletTypeLabel = ({ type, isActive = false, onClick, className = '' }) => {
  return (
    <button
      className={className}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? theme.colors.text.primary : theme.colors.background.cardHover,
        color: isActive ? theme.colors.background.card : theme.colors.text.secondary,
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        borderRadius: theme.border.radius.base,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
        textTransform: 'capitalize',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = theme.colors.border.light;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
        }
      }}
    >
      {type}
    </button>
  );
};

WalletTypeLabel.propTypes = {
  type: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default WalletTypeLabel;
