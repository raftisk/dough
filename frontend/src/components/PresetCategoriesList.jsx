import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { theme } from '../styles/theme';
import CategoryListItem from './CategoryListItem';
import { PRESET_CATEGORIES } from '../constants';

const PresetCategoriesList = ({
  isOpen,
  onClose,
  categories,
  onActivate,
  onRefresh,
}) => {
  const [selectedType, setSelectedType] = useState('expense');

  if (!isOpen) return null;

  // Get preset categories for selected type
  const presetCategories = PRESET_CATEGORIES[selectedType] || [];

  // Check if a preset category is already activated
  const isPresetActivated = (preset) => {
    return categories.some(
      (cat) => cat.name === preset.name && cat.type === selectedType && cat.is_active
    );
  };

  // Handle preset activation
  const handleActivate = async (preset) => {
    try {
      await onActivate(preset, selectedType);
      onRefresh(); // Refresh categories list
      // Modal stays open - do not call onClose()
    } catch (err) {
      console.error('Failed to activate preset:', err);
      alert(err.message || 'Failed to activate preset');
    }
  };

  // Type Toggle Component
  const TypeToggle = ({ selectedType, onTypeChange }) => {
    return (
      <div style={{ display: 'flex', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
        <button
          onClick={() => onTypeChange('expense')}
          style={{
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            borderRadius: theme.border.radius.sm,
            border: 'none',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            transition: theme.transitions.fast,
            backgroundColor:
              selectedType === 'expense'
                ? theme.colors.text.primary
                : theme.colors.background.cardHover,
            color:
              selectedType === 'expense'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary,
          }}
        >
          Expense
        </button>
        <button
          onClick={() => onTypeChange('income')}
          style={{
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            borderRadius: theme.border.radius.sm,
            border: 'none',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            transition: theme.transitions.fast,
            backgroundColor:
              selectedType === 'income'
                ? theme.colors.text.primary
                : theme.colors.background.cardHover,
            color:
              selectedType === 'income'
                ? theme.colors.text.inverse
                : theme.colors.text.secondary,
          }}
        >
          Income
        </button>
      </div>
    );
  };

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
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.border.radius.xl,
            maxWidth: '700px',
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
              Preset Categories
            </h2>
            <button
              onClick={onClose}
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
          <div style={{ padding: theme.spacing[6] }}>
            {/* Type Toggle */}
            <TypeToggle selectedType={selectedType} onTypeChange={setSelectedType} />

            {/* Preset Categories List */}
            {presetCategories.length === 0 ? (
              <div
                style={{
                  padding: theme.spacing[8],
                  textAlign: 'center',
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.base,
                }}
              >
                No preset categories available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                {presetCategories.map((preset, index) => {
                  const isActivated = isPresetActivated(preset);
                  return (
                    <CategoryListItem
                      key={index}
                      category={{
                        name: preset.name,
                        icon: preset.iconName,
                        type: selectedType,
                      }}
                      statusDot="preset"
                      isActivated={isActivated}
                      menuOptions={
                        isActivated
                          ? []
                          : [{ label: 'Activate', action: 'add', icon: 'CheckCircle' }]
                      }
                      onMenuAction={(action) => {
                        if (action === 'add') {
                          handleActivate(preset);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

PresetCategoriesList.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string,
      is_active: PropTypes.bool,
    })
  ).isRequired,
  onActivate: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default PresetCategoriesList;
