import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Trash2, MoreVertical } from 'lucide-react';
import { theme } from '../styles/theme';
import { formatAmount } from '../utils/format';
import { FALLBACK_CURRENCY } from '../constants';
import CategoryTag from './CategoryTag';

const WishlistItem = ({ item, onClick, onDelete }) => {
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

  // Format target month from "YYYY-MM" to "MMM YYYY"
  const formatTargetMonth = (target) => {
    if (!target) return '';
    const [year, month] = target.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  // Get priority badge styling
  const getPriorityStyle = (priority) => {
    const styles = {
      urgent: {
        backgroundColor: '#fee2e2', // red-100
        color: '#991b1b', // red-800
      },
      high: {
        backgroundColor: '#fed7aa', // orange-100
        color: '#9a3412', // orange-800
      },
      medium: {
        backgroundColor: '#dbeafe', // blue-100
        color: '#1e40af', // blue-800
      },
      low: {
        backgroundColor: '#f3f4f6', // gray-100
        color: '#374151', // gray-800
      },
    };
    return styles[priority?.toLowerCase()] || styles.medium;
  };

  const priorityStyle = getPriorityStyle(item.priority);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.base,
        padding: theme.spacing[4],
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        transition: theme.transitions.fast,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Row: Priority Badge + Action Menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Priority Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
            borderRadius: theme.border.radius.full,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.semibold,
            textTransform: 'capitalize',
            ...priorityStyle,
          }}
        >
          {item.priority}
        </div>

        {/* Menu Button */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            style={{
              ...theme.components.button.iconHover,
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

          {/* Dropdown Menu */}
          {menuOpen && (
            <div style={theme.components.dropdown.menu}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(item.id);
                }}
                style={{
                  ...theme.components.dropdown.menuItem,
                  color: theme.colors.semantic.expense,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Description */}
      <div
        style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.description}
      </div>

      {/* Amount Row */}
      <div
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}
      >
        {formatAmount(item.amount, FALLBACK_CURRENCY)}
      </div>

      {/* Bottom Row: Target Month + Category Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing[2],
          flexWrap: 'wrap',
        }}
      >
        {/* Target Month */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          <Calendar size={14} color={theme.colors.text.secondary} />
          <span> {formatTargetMonth(item.target)}</span>
        </div>

        {/* Category Tag (if exists) */}
        {item.category_name && (
          <CategoryTag
            category={{
              icon: item.category_icon,
              name: item.category_name,
            }}
          />
        )}
      </div>
    </div>
  );
};

WishlistItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    category_name: PropTypes.string,
    category_icon: PropTypes.string,
    priority: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    is_completed: PropTypes.bool,
    use_savings: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default WishlistItem;
