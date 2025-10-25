import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { theme } from '../styles/theme';
import { CURRENCIES } from '../constants';

const CurrencyPicker = ({ isOpen, onClose, onSelectCurrency, selectedCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(CURRENCIES);
  const pickerRef = useRef(null);

  // Filter currencies based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCurrencies(CURRENCIES);
    } else {
      const query = searchTerm.toLowerCase();
      const filtered = CURRENCIES.filter(
        (currency) =>
          currency.code.toLowerCase().includes(query) ||
          currency.name.toLowerCase().includes(query)
      );
      setFilteredCurrencies(filtered);
    }
  }, [searchTerm]);

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

  // Handle currency selection
  const handleCurrencyClick = (currency) => {
    onSelectCurrency(currency);
    onClose();
  };

  // Check if a currency is selected
  const isCurrencySelected = (currency) => {
    return selectedCurrency && selectedCurrency.code === currency.code;
  };

  if (!isOpen) return null;

  return (
    // Popover Container
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        zIndex: theme.zIndex.popover,
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.border.radius.lg,
        boxShadow: theme.shadows.xl,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        maxHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
        {/* Search Input */}
        <div
          style={{
            padding: theme.spacing[4],
            borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                paddingRight: theme.spacing[10],
                fontSize: theme.typography.fontSize.base,
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                borderRadius: theme.border.radius.base,
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                outline: 'none',
                transition: theme.transitions.base,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.text.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.light;
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                right: theme.spacing[3],
                color: theme.colors.text.secondary,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Currency List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: theme.spacing[2],
          }}
        >
          {filteredCurrencies.length > 0 ? (
            filteredCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyClick(currency)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: 'none',
                  backgroundColor: isCurrencySelected(currency)
                    ? theme.colors.background.cardHover
                    : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: theme.transitions.base,
                  borderRadius: theme.border.radius.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isCurrencySelected(currency)
                    ? theme.colors.background.cardHover
                    : 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                    flex: 1,
                  }}
                >
                  {currency.code} - {currency.name}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                    marginLeft: theme.spacing[3],
                  }}
                >
                  {currency.symbol}
                </span>
              </button>
            ))
          ) : (
            <div
              style={{
                padding: theme.spacing[8],
                textAlign: 'center',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              No currencies found
            </div>
          )}
        </div>
    </div>
  );
};

CurrencyPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectCurrency: PropTypes.func.isRequired,
  selectedCurrency: PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
  }),
};

export default CurrencyPicker;
