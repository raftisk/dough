import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Minus, ChevronDown, Search } from 'lucide-react';
import { theme } from '../styles/theme';
import IconPicker from './IconPicker';
import { getIconComponent } from '../constants';

const CategoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) => {
  // Initialize form state
  const [type, setType] = useState('expense');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setName(initialData.name || '');
      setSelectedIcon(initialData.icon || null);
    } else {
      // Reset form for new category
      setType('expense');
      setName('');
      setSelectedIcon(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!selectedIcon) {
      newErrors.icon = 'Icon is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      type,
      name: name.trim(),
      icon: selectedIcon,
      is_active: true,
    };

    onSubmit(formData);
  };

  // Handle cancel
  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  // Handle icon selection - now receives icon name string
  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    setShowIconPicker(false);
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !showIconPicker) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showIconPicker]);

  if (!isOpen) return null;

  const TypeIcon = type === 'income' ? Plus : Minus;

  return (
    <>
      {/* Modal Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.modal,
          padding: theme.spacing[4],
        }}
        onClick={handleCancel}
      >
        {/* Modal Content */}
        <div
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.border.radius.xl,
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.xl,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: theme.spacing[6],
              borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
              }}
            >
              {mode === 'edit' ? 'Edit Category' : 'Create Category'}
            </h2>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: theme.spacing[2],
                borderRadius: theme.border.radius.base,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={24} color={theme.colors.text.secondary} />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} style={{ padding: theme.spacing[6] }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[5] }}>
              {/* Type */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  <TypeIcon
                    size={16}
                    color={
                      type === 'income'
                        ? theme.colors.semantic.income
                        : theme.colors.semantic.expense
                    }
                  />
                  Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      paddingRight: theme.spacing[8],
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                      borderRadius: theme.border.radius.base,
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.text.primary,
                      backgroundColor: theme.colors.background.card,
                      cursor: 'pointer',
                      appearance: 'none',
                      outline: 'none',
                      transition: theme.transitions.base,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.text.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.medium;
                    }}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <ChevronDown
                    size={20}
                    style={{
                      position: 'absolute',
                      right: theme.spacing[3],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: theme.colors.text.secondary,
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Groceries"
                  maxLength={50}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.name ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.card,
                    outline: 'none',
                    transition: theme.transitions.base,
                  }}
                  onFocus={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = theme.colors.text.primary;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = theme.colors.border.medium;
                  }
                }}
                />
                {errors.name && (
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.semantic.expense,
                      marginTop: theme.spacing[1],
                      margin: `${theme.spacing[1]} 0 0 0`,
                    }}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  Icon
                </label>
                <div
                  onClick={() => setShowIconPicker(true)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${
                      errors.icon ? theme.colors.semantic.expense : theme.colors.border.medium
                    }`,
                    borderRadius: theme.border.radius.base,
                    backgroundColor: theme.colors.background.card,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.card;
                  }}
                >
                  {/* Icon */}
                  {selectedIcon ? (
                    (() => {
                      const IconComponent = getIconComponent(selectedIcon);
                      return <IconComponent size={20} color={theme.colors.text.primary} />;
                    })()
                  ) : (
                    <Search size={20} color={theme.colors.text.secondary} />
                  )}
                  {/* Placeholder text */}
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      color: selectedIcon ? theme.colors.text.primary : theme.colors.text.muted,
                    }}
                  >
                    {selectedIcon ? 'Icon Selected' : 'Choose Icon'}
                  </span>
                </div>
                {errors.icon && (
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.semantic.expense,
                      marginTop: theme.spacing[1],
                      margin: `${theme.spacing[1]} 0 0 0`,
                    }}
                  >
                    {errors.icon}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing[3],
                marginTop: theme.spacing[6],
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  backgroundColor: 'transparent',
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                  cursor: 'pointer',
                  transition: theme.transitions.fast,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit} 
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.inverse,
                  backgroundColor: theme.colors.action.primary,
                  border: 'none',
                  cursor: 'pointer',
                  transition: theme.transitions.fast,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.action.primary;
                }}
              >
                {mode === 'edit' ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={handleIconSelect}
        selectedIcon={selectedIcon}
      />
    </>
  );
};

CategoryForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']),
};

export default CategoryForm;
