import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const MonthPicker = ({ value, onChange, placeholder = 'Select month' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const containerRef = useRef(null);

  // Parse value (YYYY-MM format) to get selected month and year
  const selectedMonth = value ? parseInt(value.split('-')[1], 10) - 1 : null; // 0-indexed
  const selectedYear = value ? parseInt(value.split('-')[0], 10) : null;

  // Set viewYear to selectedYear when picker opens
  useEffect(() => {
    if (isOpen && selectedYear) {
      setViewYear(selectedYear);
    }
  }, [isOpen, selectedYear]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format month for display (e.g., "Mar 2025")
  const formatMonth = (monthValue) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    const formattedValue = `${viewYear}-${month}`;
    onChange(formattedValue);
    setIsOpen(false);
  };

  // Navigate years
  const goToPreviousYear = () => {
    setViewYear(viewYear - 1);
  };

  const goToNextYear = () => {
    setViewYear(viewYear + 1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing[2],
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          paddingRight: theme.spacing[3],
          backgroundColor: theme.colors.background.card,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
          borderRadius: theme.border.radius.base,
          fontSize: theme.typography.fontSize.base,
          color: value ? theme.colors.text.primary : theme.colors.text.muted,
          cursor: 'pointer',
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.card;
        }}
      >
        <span>{value ? formatMonth(value) : placeholder}</span>
        <Calendar size={16} color={theme.colors.text.secondary} />
      </button>

      {/* Month Picker Popup */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: theme.zIndex.popover,
            backgroundColor: theme.colors.background.card,
            border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
            borderRadius: theme.border.radius.lg,
            boxShadow: theme.shadows.lg,
            padding: theme.spacing[4],
            minWidth: '280px',
          }}
        >
          {/* Year Navigation Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing[4],
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousYear();
              }}
              style={{
                padding: theme.spacing[1],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
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
              <ChevronLeft size={20} color={theme.colors.text.primary} />
            </button>

            <div
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              {viewYear}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextYear();
              }}
              style={{
                padding: theme.spacing[1],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
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
              <ChevronRight size={20} color={theme.colors.text.primary} />
            </button>
          </div>

          {/* Month Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: theme.spacing[2],
            }}
          >
            {monthNames.map((month, index) => {
              const isSelected = selectedMonth === index && selectedYear === viewYear;
              const isCurrentMonth =
                index === new Date().getMonth() &&
                viewYear === new Date().getFullYear();

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  style={{
                    padding: `${theme.spacing[3]} ${theme.spacing[2]}`,
                    backgroundColor: isSelected
                      ? theme.colors.action.primary
                      : 'transparent',
                    border: isCurrentMonth && !isSelected
                      ? `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`
                      : 'none',
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: isSelected
                      ? theme.typography.fontWeight.semibold
                      : theme.typography.fontWeight.medium,
                    color: isSelected
                      ? theme.colors.text.inverse
                      : theme.colors.text.primary,
                    cursor: 'pointer',
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {/* This Month Button */}
          <div
            style={{
              marginTop: theme.spacing[3],
              paddingTop: theme.spacing[3],
              borderTop: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`
            }}
          >
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
                const currentYear = today.getFullYear();
                const formattedValue = `${currentYear}-${currentMonth}`;
                onChange(formattedValue);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                backgroundColor: 'transparent',
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
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
              This Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

MonthPicker.propTypes = {
  value: PropTypes.string, // Expected format: "YYYY-MM"
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default MonthPicker;
