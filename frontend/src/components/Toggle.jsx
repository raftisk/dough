import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

/**
 * Reusable Toggle component following Dough's design system
 * @param {boolean} checked - Current state of the toggle
 * @param {function} onChange - Callback function when toggle is clicked
 * @param {string} label - Main label text for the toggle
 * @param {string} description - Optional description text below the label
 * @param {boolean} disabled - Whether the toggle is disabled
 */
const Toggle = ({ checked, onChange, label, description, disabled = false }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing[2],
      }}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        style={{
          width: '36px',
          height: '20px',
          backgroundColor: checked ? theme.colors.action.primary : theme.colors.background.card,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${checked ? theme.colors.action.primary : theme.colors.border.medium}`,
          borderRadius: theme.border.radius.full,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: theme.transitions.base,
          flexShrink: 0,
          marginTop: '2px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            backgroundColor: theme.colors.text.inverse,
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            transition: theme.transitions.base,
          }}
        />
      </button>

      {/* Label and Description */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            marginBottom: description ? theme.spacing[1] : 0,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.muted,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Toggle;
