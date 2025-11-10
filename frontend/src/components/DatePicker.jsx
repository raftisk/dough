import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const DatePicker = ({ date, onDateChange, placeholder = 'Select date' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef(null);

  // Convert string to Date if needed
  const selectedDate = date ? (typeof date === 'string' ? new Date(date) : date) : null;

  // Set viewDate to selectedDate when picker opens
  useEffect(() => {
    if (isOpen && selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

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

  // Format date for display
  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  };

  // Get calendar data
  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();

    const days = [];

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevLastDate - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevLastDate - i),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        // Create the date at noon to avoid timezone issues
        fullDate: new Date(year, month, i, 12, 0, 0, 0),
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Check if date is today
  const isToday = (dateObj) => {
    const today = new Date();
    return isSameDay(dateObj, today);
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    onDateChange(day.fullDate);
    setIsOpen(false);
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          backgroundColor: theme.colors.background.card,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
          borderRadius: theme.border.radius.base,
          fontSize: theme.typography.fontSize.sm,
          color: selectedDate ? theme.colors.text.primary : theme.colors.text.muted,
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
        <span>{selectedDate ? formatDate(selectedDate) : placeholder}</span>
        <CalendarDays size={16} color={theme.colors.text.secondary} />
      </button>

      {/* Calendar Popup */}
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
          {/* Calendar Header */}
          {<div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing[3],
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousMonth();
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
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextMonth();
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
          </div>}

          {/* Day Names */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: theme.spacing[1],
              marginBottom: theme.spacing[2],
            }}
          >
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.muted,
                  textAlign: 'center',
                  padding: theme.spacing[1],
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: theme.spacing[1],
            }}
          >
            {getCalendarDays().map((day, index) => {
              const isSelected = isSameDay(day.fullDate, selectedDate);
              const isTodayDate = isToday(day.fullDate);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  style={{
                    padding: theme.spacing[2],
                    backgroundColor: isSelected
                      ? theme.colors.action.primary
                      : 'transparent',
                    border: isTodayDate && !isSelected
                      ? `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.action.secondary}`
                      : 'none',
                    borderRadius: isSelected || isTodayDate ? '50%' : theme.border.radius.base,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: isSelected ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                    color: isSelected
                      ? theme.colors.text.inverse
                      : day.isCurrentMonth
                      ? theme.colors.text.primary
                      : theme.colors.text.muted,
                    cursor: 'pointer',
                    transition: theme.transitions.fast,
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                      e.currentTarget.style.borderRadius = '50%';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {day.date}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div style={{ marginTop: theme.spacing[3], paddingTop: theme.spacing[3], borderTop: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}` }}>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onDateChange(today);
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
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  onDateChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default DatePicker;
