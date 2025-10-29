import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus, ArrowRightLeft } from 'lucide-react';
import { theme } from '../styles/theme';

const FloatingActionButton = ({ onSelectType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleTypeSelect = (type) => {
    setIsMenuOpen(false);
    onSelectType(type);
  };

  const menuOptions = [
    {
      type: 'income',
      label: 'Income',
      icon: Plus,
      color: theme.colors.semantic.income,
    },
    {
      type: 'expense',
      label: 'Expense',
      icon: Minus,
      color: theme.colors.semantic.expense,
    },
    {
      type: 'transfer',
      label: 'Transfer',
      icon: ArrowRightLeft,
      color: theme.colors.semantic.transfer,
    },
  ];

  return (
    <div style={{ position: 'fixed', bottom: theme.spacing[6], right: theme.spacing[6], zIndex: theme.zIndex.popover }}>
      {/* Type Selection Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.border.radius.lg,
            boxShadow: theme.shadows.lg,
            border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
            minWidth: '180px',
            overflow: 'hidden',
          }}
        >
          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => handleTypeSelect(option.type)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  transition: theme.transitions.fast,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={20} color={option.color} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Floating Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: theme.border.radius.full,
          backgroundColor: theme.colors.action.primary,
          color: theme.colors.text.inverse,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows.lg,
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme.shadows.xl;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.action.primary;
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme.shadows.lg;
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

FloatingActionButton.propTypes = {
  onSelectType: PropTypes.func.isRequired,
};

export default FloatingActionButton;
