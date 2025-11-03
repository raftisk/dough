import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing[8],
        gap: theme.spacing[4],
      }}
    >
      <div style={{ color: theme.colors.semantic.expense }}>
        {error}
      </div>
      <button
        onClick={onRetry}
        style={{
          padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
          backgroundColor: theme.colors.action.primary,
          color: theme.colors.text.inverse,
          border: 'none',
          borderRadius: theme.border.radius.base,
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.action.primary;
        }}
      >
        Retry
      </button>
    </div>
  );
};

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default ErrorState;
