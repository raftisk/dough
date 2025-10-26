import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Plus, Minus, ArrowLeftRight } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';
import { formatCurrency } from '../utils/format';

/**
 * CalendarView - Monthly calendar displaying transactions
 * Shows transactions in day tiles with click-to-edit functionality
 */
const CalendarView = ({ transactions, onTransactionClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format month/year for header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generate calendar days array
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday, adjust to Monday = 0)
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Sunday becomes 6

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Calculate total days needed (always 35 or 42 for complete grid)
    const daysInMonth = lastDay.getDate();
    const totalDays = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalDays - (daysFromPrevMonth + daysInMonth);

    const days = [];

    // Add previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const dayDate = new Date(year, month - 1, date);
      days.push({
        date,
        dateKey: formatDateKey(dayDate),
        dayName: getDayName(dayDate),
        isCurrentMonth: false,
      });
    }

    // Add current month days
    for (let date = 1; date <= daysInMonth; date++) {
      const dayDate = new Date(year, month, date);
      days.push({
        date,
        dateKey: formatDateKey(dayDate),
        dayName: getDayName(dayDate),
        isCurrentMonth: true,
      });
    }

    // Add next month days
    for (let date = 1; date <= daysFromNextMonth; date++) {
      const dayDate = new Date(year, month + 1, date);
      days.push({
        date,
        dateKey: formatDateKey(dayDate),
        dayName: getDayName(dayDate),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get day name (MON, TUE, etc.)
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped = {};

    // Only include transactions from current displayed month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    transactions.forEach((transaction) => {
      const transDate = new Date(transaction.date);
      if (transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear) {
        const dateKey = formatDateKey(transDate);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(transaction);
      }
    });

    // Sort transactions within each day
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        // Sort by type: income first, transfer second, expense last
        const typeOrder = { income: 1, transfer: 2, expense: 3 };
        const typeCompare = typeOrder[a.type] - typeOrder[b.type];
        if (typeCompare !== 0) return typeCompare;

        // Within same type, sort by amount descending
        return b.amount - a.amount;
      });
    });

    return grouped;
  };

  const calendarDays = generateCalendarDays();
  const groupedTransactions = groupTransactionsByDate();

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.lg,
        padding: theme.spacing[6],
        marginTop: theme.spacing[6],
      }}
    >
      {/* Calendar Header */}
      <CalendarHeader
        monthYear={formatMonthYear(currentDate)}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
      />

      {/* Day Headers */}
      <DayHeaders />

      {/* Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: theme.colors.border.light,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          borderRadius: theme.border.radius.base,
          overflow: 'hidden',
        }}
      >
        {calendarDays.map((day, index) => (
          <DayTile
            key={`${day.dateKey}-${index}`}
            day={day}
            transactions={groupedTransactions[day.dateKey] || []}
            onTransactionClick={onTransactionClick}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * CalendarHeader - Month/year display with navigation chevrons
 */
const CalendarHeader = ({ monthYear, onPrevious, onNext }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing[4],
      }}
    >
      <button
        onClick={onPrevious}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: theme.spacing[2],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.border.radius.base,
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ChevronLeft size={24} color={theme.colors.text.primary} />
      </button>

      <h3
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          margin: 0,
        }}
      >
        {monthYear}
      </h3>

      <button
        onClick={onNext}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: theme.spacing[2],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.border.radius.base,
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ChevronRight size={24} color={theme.colors.text.primary} />
      </button>
    </div>
  );
};

/**
 * DayHeaders - Row of day names (MON, TUE, WED, etc.)
 */
const DayHeaders = () => {
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
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
            textAlign: 'center',
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.secondary,
            textTransform: 'uppercase',
            padding: theme.spacing[2],
          }}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

/**
 * DayTile - Individual day cell with date and transactions
 */
const DayTile = ({ day, transactions, onTransactionClick }) => {
  const visibleTransactions = transactions.slice(0, 5);
  const hasOverflow = transactions.length > 5;
  const overflowCount = transactions.length - 5;

  return (
    <div
      style={{
        backgroundColor: day.isCurrentMonth ? theme.colors.background.card : theme.colors.background.pageAlt,
        minHeight: '140px',
        padding: theme.spacing[2],
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[1],
      }}
    >
      {day.isCurrentMonth && (
        <>
          {/* Date header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: theme.spacing[1],
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
              }}
            >
              {day.date}
            </span>
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.muted,
                textTransform: 'uppercase',
              }}
            >
              {day.dayName}
            </span>
          </div>

          {/* Transaction rows */}
          {visibleTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onClick={() => onTransactionClick(transaction)}
            />
          ))}

          {/* Overflow indicator */}
          {hasOverflow && (
            <div
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.muted,
                fontStyle: 'italic',
                marginTop: theme.spacing[1],
              }}
            >
              +{overflowCount} more...
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * TransactionRow - Single transaction display with hover tooltip
 */
const TransactionRow = ({ transaction, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Get type icon and color
  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <Plus size={16} color={theme.colors.semantic.income} />;
      case 'expense':
        return <Minus size={16} color={theme.colors.semantic.expense} />;
      case 'transfer':
        return <ArrowLeftRight size={16} color={theme.colors.semantic.transfer} />;
      default:
        return <Minus size={16} color={theme.colors.text.secondary} />;
    }
  };

  // Get category icon
  const CategoryIcon = getIconComponent(transaction.category_icon);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[1],
        padding: `${theme.spacing[1]} ${theme.spacing[1]}`,
        cursor: 'pointer',
        borderRadius: theme.border.radius.sm,
        transition: theme.transitions.fast,
        backgroundColor: 'transparent',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Type icon */}
      {getTypeIcon()}

      {/* Amount */}
      <span
        style={{
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.primary,
          fontWeight: theme.typography.fontWeight.medium,
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatCurrency(transaction.amount)}
      </span>

      {/* Category icon */}
      <CategoryIcon size={16} color="#000000" strokeWidth={2} />

      {/* Tooltip */}
      {showTooltip && transaction.description && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: theme.spacing[1],
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            borderRadius: theme.border.radius.sm,
            fontSize: theme.typography.fontSize.xs,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.description.length > 30
            ? `${transaction.description.substring(0, 30)}...`
            : transaction.description}
        </div>
      )}
    </div>
  );
};

// PropTypes
CalendarView.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
      amount: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      category_icon: PropTypes.string,
    })
  ).isRequired,
  onTransactionClick: PropTypes.func.isRequired,
};

CalendarHeader.propTypes = {
  monthYear: PropTypes.string.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

DayTile.propTypes = {
  day: PropTypes.shape({
    date: PropTypes.number.isRequired,
    dateKey: PropTypes.string.isRequired,
    dayName: PropTypes.string.isRequired,
    isCurrentMonth: PropTypes.bool.isRequired,
  }).isRequired,
  transactions: PropTypes.array.isRequired,
  onTransactionClick: PropTypes.func.isRequired,
};

TransactionRow.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string,
    amount: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    category_icon: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CalendarView;
