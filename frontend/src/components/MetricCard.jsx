import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { theme } from '../styles/theme';

const MetricCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  subtitle,
  masked = false
}) => {
  const [isVisible, setIsVisible] = useState(!masked);

  const getMaskedValue = (val) => {
    return val.replace(/[0-9A-Za-z]/g, '*');
  };

  const displayValue = masked && !isVisible ? getMaskedValue(value) : value;

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.lg,
        padding: theme.spacing[5],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        transition: theme.transitions.base,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Left side - Label and Value */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[2],
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: valueColor || theme.colors.text.primary,
            marginBottom: subtitle ? theme.spacing[1] : 0,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          {displayValue}
          {masked && (
            <button
              onClick={() => setIsVisible(!isVisible)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: theme.spacing[1],
                display: 'flex',
                alignItems: 'center',
                borderRadius: theme.border.radius.base,
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={isVisible ? 'Hide value' : 'Show value'}
            >
              {isVisible ? (
                <EyeOff size={20} color={theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={theme.colors.text.secondary} />
              )}
            </button>
          )}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.muted,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right side - Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={32}
          color={iconColor || theme.colors.text.secondary}
          strokeWidth={2}
        />
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  valueColor: PropTypes.string,
  subtitle: PropTypes.string,
  masked: PropTypes.bool,
};

export default MetricCard;
