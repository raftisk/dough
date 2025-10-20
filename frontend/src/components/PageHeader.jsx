import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';
import { theme } from '../styles/theme';

const PageHeader = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing[6],
      }}
    >
      {/* Title and subtitle section */}
      <div>
        <h1
          style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: subtitle ? theme.spacing[1] : 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Action button section */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: theme.colors.action.primary,
            color: theme.colors.text.inverse,
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            borderRadius: theme.border.radius.base,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: theme.transitions.fast,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primary;
          }}
        >
          <Plus size={20} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};

export default PageHeader;
