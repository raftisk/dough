import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const EmptyState = ({ message, icon }) => {
  return (
    <div
      style={{
        padding: `${theme.spacing[8]} ${theme.spacing[4]}`,
        textAlign: 'center',
        color: theme.colors.text.secondary,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: theme.typography.fontSize['4xl'],
            marginBottom: theme.spacing[3],
          }}
        >
          {icon}
        </div>
      )}
      <p
        style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.muted,
        }}
      >
        {message}
      </p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

export default EmptyState;
