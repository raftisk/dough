import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MoreVertical, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { theme } from '../styles/theme';

const CategoryListItem = ({ category, statusDot, menuOptions, onMenuAction, transactionCount, isAlreadyAdded }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Get status dot color based on status
  const getStatusDotColor = () => {
    switch (statusDot) {
      case 'active':
        return '#10b981'; // green
      case 'inactive':
        return '#ef4444'; // red
      case 'preset':
        return '#9ca3af'; // gray
      default:
        return '#9ca3af';
    }
  };

  // Get icon component for menu option
  const getMenuIcon = (iconName) => {
    const icons = {
      Edit,
      Trash2,
      Eye,
      EyeOff,
      CheckCircle,
      XCircle,
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={16} /> : null;
  };

  // Handle menu option click
  const handleOptionClick = (option) => {
    setMenuOpen(false);
    if (onMenuAction) {
      onMenuAction(option.action, category);
    }
  };

  // Determine card background color
  const backgroundColor = statusDot === 'preset'
    ? theme.colors.background.pageAlt
    : theme.colors.background.card;

  return (
    <div
      style={{
        backgroundColor,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.base,
        padding: theme.spacing[3],
        paddingLeft: theme.spacing[5], // Increased left padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing[3],
        minHeight: '68px', // Match height with TransactionListItem
        transition: theme.transitions.fast,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (statusDot !== 'preset') {
          e.currentTarget.style.boxShadow = theme.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Left section: Status dot + Icon + Category Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3], flex: 1 }}>
        {/* Status dot */}
        {statusDot && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: theme.border.radius.full,
              backgroundColor: getStatusDotColor(),
              flexShrink: 0,
            }}
          />
        )}

        {/* Category Icon */}
        <div
          style={{
            fontSize: theme.typography.fontSize.xl,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {category.icon || '📁'}
        </div>

        {/* Category Name and Transaction Count */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[1],
            }}
          >
            {category.name}
          </div>
          {/* Show transaction count for active/inactive, NOT for presets */}
          {statusDot !== 'preset' && (
            <div
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                marginTop: theme.spacing[1],
              }}
            >
              {transactionCount !== undefined ? `${transactionCount} transactions` : '0 transactions'}
            </div>
          )}
        </div>
      </div>

      {/* Right section: "Added" label or Menu button */}
      <div ref={menuRef} style={{ flexShrink: 0 }}>
        {isAlreadyAdded ? (
          <span
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.semantic.income,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Added
          </span>
        ) : (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              borderRadius: theme.border.radius.base,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: theme.transitions.fast,
              color: theme.colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            <MoreVertical size={18} />
          </button>
        )}

        {/* Dropdown Menu */}
        {menuOpen && menuOptions && menuOptions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: theme.spacing[1],
              backgroundColor: theme.colors.background.card,
              border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
              borderRadius: theme.border.radius.base,
              boxShadow: theme.shadows.lg,
              padding: theme.spacing[2],
              minWidth: '160px',
              zIndex: theme.zIndex.dropdown,
            }}
          >
            {menuOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.primary,
                  transition: theme.transitions.fast,
                  borderRadius: theme.border.radius.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {getMenuIcon(option.icon)}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

CategoryListItem.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
    is_active: PropTypes.bool,
  }).isRequired,
  statusDot: PropTypes.oneOf(['active', 'inactive', 'preset']),
  menuOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ),
  onMenuAction: PropTypes.func,
  transactionCount: PropTypes.number,
  isAlreadyAdded: PropTypes.bool,
};

export default CategoryListItem;
