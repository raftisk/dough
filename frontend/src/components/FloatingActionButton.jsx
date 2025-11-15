import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus, ArrowRightLeft } from 'lucide-react';
import { theme } from '../styles/theme';

const FloatingActionButton = ({ onSelectType, templates = [] }) => {
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

  const handleTypeSelect = (type, templateData = null) => {
    setIsMenuOpen(false);
    onSelectType(type, templateData);
  };

  // Group templates by type
  const incomeTemplates = templates.filter(t => t.type === 'income');
  const expenseTemplates = templates.filter(t => t.type === 'expense');

  const menuOptions = [
    {
      type: 'income',
      label: 'Income',
      icon: Plus,
      color: theme.colors.semantic.income,
      isDefault: true,
    },
    {
      type: 'expense',
      label: 'Expense',
      icon: Minus,
      color: theme.colors.semantic.expense,
      isDefault: true,
    },
    {
      type: 'transfer',
      label: 'Transfer',
      icon: ArrowRightLeft,
      color: theme.colors.semantic.transfer,
      isDefault: true,
    },
  ];

  // Build complete menu with templates
  const completeMenu = [
    ...menuOptions,
    ...(templates.length > 0 ? [{ type: 'separator' }] : []),
    ...(templates.length > 0 ? [{ type: 'header', label: 'TEMPLATES' }] : []),
    ...incomeTemplates.map(template => ({
      type: 'template',
      templateData: template,
      label: template.description || 'Untitled',
      icon: Plus,
      color: theme.colors.semantic.income,
      isTemplate: true,
    })),
    ...expenseTemplates.map(template => ({
      type: 'template',
      templateData: template,
      label: template.description || 'Untitled',
      icon: Minus,
      color: theme.colors.semantic.expense,
      isTemplate: true,
    })),
    ...(templates.length > 0 ? [{ type: 'separator' }] : []),
    {
      type: 'add-template',
      label: 'Add Template',
      color: theme.colors.text.secondary,
      isAddTemplate: true,
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
            minWidth: '240px',
            overflow: 'hidden',
          }}
        >
          {completeMenu.map((option, index) => {
            // Render separator
            if (option.type === 'separator') {
              return (
                <div
                  key={`separator-${index}`}
                  style={{
                    borderTop: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                    margin: `${theme.spacing[1]} 0`,
                  }}
                />
              );
            }

            // Render header
            if (option.type === 'header') {
              return (
                <div
                  key={`header-${index}`}
                  style={{
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.muted,
                    letterSpacing: '0.05em',
                  }}
                >
                  {option.label}
                </div>
              );
            }

            const Icon = option.icon;
            const truncatedLabel = option.label.length > 25 ? option.label.substring(0, 25) + '...' : option.label;

            return (
              <button
                key={option.isTemplate ? `template-${option.templateData.id}` : option.type}
                onClick={() => {
                  if (option.isTemplate) {
                    handleTypeSelect('template', option.templateData);
                  } else if (option.isAddTemplate) {
                    handleTypeSelect('add-template');
                  } else {
                    handleTypeSelect(option.type);
                  }
                }}
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
                  fontWeight: option.isAddTemplate ? theme.typography.fontWeight.normal : theme.typography.fontWeight.medium,
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
                {Icon && <Icon size={20} color={option.color} />}
                <span>{truncatedLabel}</span>
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
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      description: PropTypes.string,
      type: PropTypes.string,
      category: PropTypes.number,
      amount: PropTypes.string,
      wallet: PropTypes.number,
    })
  ),
};

export default FloatingActionButton;
