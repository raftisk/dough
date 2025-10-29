import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { theme } from '../styles/theme';
import { ICON_MAP } from '../constants';

// Convert ICON_MAP to array format for the picker with search keywords
const ICON_CATALOG = Object.entries(ICON_MAP).map(([name, component]) => {
  // Generate keywords based on icon name
  const keywords = name.toLowerCase().split(/(?=[A-Z])/).join(' ').split(' ');
  return { name, component, keywords };
});

const IconPicker = ({ isOpen, onClose, onSelectIcon, selectedIcon }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIcons, setFilteredIcons] = useState(ICON_CATALOG);
  const pickerRef = useRef(null);

  // Filter icons based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIcons(ICON_CATALOG);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ICON_CATALOG.filter(
        (icon) =>
          icon.name.toLowerCase().includes(query) ||
          icon.keywords.some((keyword) => keyword.includes(query))
      );
      setFilteredIcons(filtered);
    }
  }, [searchQuery]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle icon selection - return icon name string
  const handleIconClick = (iconName) => {
    onSelectIcon(iconName);
    onClose();
  };

  // Check if an icon is selected
  const isIconSelected = (iconName) => {
    return selectedIcon === iconName;
  };

  if (!isOpen) return null;

  return (
    // Overlay
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
        zIndex: theme.zIndex.modal + 1,
        padding: theme.spacing[4],
      }}
    >
      {/* Picker Content */}
      <div
        ref={pickerRef}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.xl,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '600px',
          boxShadow: theme.shadows.xl,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
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
              marginBottom: theme.spacing[4],
            }}
          >
            Select Icon
          </h2>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                paddingRight: theme.spacing[10],
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.card,
              }}
            />
            <Search
              size={20}
              style={{
                position: 'absolute',
                right: theme.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.text.secondary,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div
          style={{
            padding: theme.spacing[6],
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {filteredIcons.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: theme.spacing[2],
              }}
            >
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component;
                const selected = isIconSelected(icon.name);
                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconClick(icon.name)}
                    style={{
                      padding: theme.spacing[3],
                      borderRadius: theme.border.radius.base,
                      backgroundColor: selected
                        ? theme.colors.background.cardHover
                        : 'transparent',
                      border: selected
                        ? `${theme.border.width.medium} ${theme.border.style.solid} ${theme.colors.text.primary}`
                        : `${theme.border.width.thin} ${theme.border.style.solid} transparent`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.fast,
                      aspectRatio: '1',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={icon.name}
                  >
                    <IconComponent size={22} color={theme.colors.text.primary} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing[8],
                color: theme.colors.text.secondary,
              }}
            >
              <p style={{ margin: 0 }}>No icons found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

IconPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectIcon: PropTypes.func.isRequired,
  selectedIcon: PropTypes.any,
};

export default IconPicker;
