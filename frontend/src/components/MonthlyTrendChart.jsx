import PropTypes from 'prop-types';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { theme } from '../styles/theme';
import { formatAmount, getCurrencySymbol } from '../utils/format';
import { DEFAULT_CURRENCY } from '../constants';

/**
 * Custom tooltip component for the monthly trend chart
 * Shows detailed breakdown of income, expenses, and net savings
 */
const CustomTooltip = ({ active, payload, currency = DEFAULT_CURRENCY }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Get data from the first payload item
  const data = payload[0].payload;

  // Parse month string (YYYY-MM) to full month name
  const monthDate = new Date(data.month + '-01');
  const monthName = monthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Parse values
  const income = parseFloat(data.total_income) || 0;
  const expenses = parseFloat(data.total_expenses) || 0;
  const netSavings = parseFloat(data.net_savings) || 0;

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing[3],
        borderRadius: theme.border.radius.base,
        boxShadow: theme.shadows.md,
        border: `${theme.border.width.thin} solid ${theme.colors.border.light}`,
        minWidth: '200px',
      }}
    >
      {/* Month header */}
      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2],
        }}
      >
        {monthName}
      </p>

      {/* Income row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[1],
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Total Income:
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.semantic.income,
            marginLeft: theme.spacing[3],
          }}
        >
          {formatAmount(income, currency)}
        </span>
      </div>

      {/* Expenses row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[1],
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Total Expenses:
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.semantic.expense,
            marginLeft: theme.spacing[3],
          }}
        >
          {formatAmount(expenses, currency)}
        </span>
      </div>

      {/* Net savings row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: theme.spacing[2],
          borderTop: `${theme.border.width.thin} solid ${theme.colors.border.light}`,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
          }}
        >
          Net Savings:
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: netSavings >= 0 ? theme.colors.semantic.income : theme.colors.semantic.expense,
            marginLeft: theme.spacing[3],
          }}
        >
          {formatAmount(netSavings, currency)}
        </span>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  currency: PropTypes.string,
};

/**
 * MonthlyTrendChart Component
 *
 * Displays monthly financial trends as smooth line charts showing income and expenses.
 * Uses invisible bars to create hover zones for better UX.
 */
const MonthlyTrendChart = ({ data, currency = DEFAULT_CURRENCY, loading, error }) => {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    month: item.month,
    total_income: parseFloat(item.total_income) || 0,
    total_expenses: parseFloat(item.total_expenses) || 0,
    net_savings: parseFloat(item.net_savings) || 0,
  }));

  // Format tick for X-axis (month abbreviation)
  const formatXAxis = (monthStr) => {
    try {
      const date = new Date(monthStr + '-01');
      return date.toLocaleString('default', { month: 'short' });
    } catch {
      return monthStr;
    }
  };

  // Format tick for Y-axis (currency)
  const formatYAxis = (value) => {
    const currencySymbol = getCurrencySymbol(currency);
    if (Math.abs(value) >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
    }
    return formatAmount(value, currency);
  };

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          border: `${theme.border.width.thin} solid ${theme.colors.border.light}`,
        }}
      >
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
          }}
        >
          Loading chart data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          border: `${theme.border.width.thin} solid ${theme.colors.border.light}`,
        }}
      >
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.semantic.expense,
          }}
        >
          Error loading chart: {error}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.border.radius.lg,
        border: `${theme.border.width.thin} solid ${theme.colors.border.light}`,
        padding: theme.spacing[4],
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Grid lines for better readability */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.border.light}
            vertical={false}
          />

          {/* X-axis: Months */}
          <XAxis
            dataKey="month"
            tickFormatter={formatXAxis}
            stroke={theme.colors.text.secondary}
            style={{
              fontSize: theme.typography.fontSize.sm,
            }}
            tickLine={false}
            axisLine={{ stroke: theme.colors.border.medium }}
          />

          {/* Y-axis: Monetary amounts */}
          <YAxis
            tickFormatter={formatYAxis}
            stroke={theme.colors.text.secondary}
            style={{
              fontSize: theme.typography.fontSize.sm,
            }}
            tickLine={false}
            axisLine={{ stroke: theme.colors.border.medium }}
          />

          {/*
            Tooltip with custom content and vertical cursor highlight
            The cursor creates the "bar-like" hover effect over entire month width
          */}
          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{
              fill: '#f3f4f6',
              opacity: 0.6,
            }}
          />

          {/*
            Invisible bars to create hover zones
            This enables full-width month detection without visible bars
          */}
          <Bar
            dataKey="total_income"
            fill="transparent"
            barSize={40}
          />

          {/* Income line (green) */}
          <Line
            type="monotone"
            dataKey="total_income"
            stroke={theme.colors.semantic.income}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: theme.colors.semantic.income,
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />

          {/* Expenses line (red) */}
          <Line
            type="monotone"
            dataKey="total_expenses"
            stroke={theme.colors.semantic.expense}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: theme.colors.semantic.expense,
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

MonthlyTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total_income: PropTypes.string.isRequired,
      total_expenses: PropTypes.string.isRequired,
      net_savings: PropTypes.string.isRequired,
    })
  ).isRequired,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

MonthlyTrendChart.defaultProps = {
  currency: DEFAULT_CURRENCY,
  loading: false,
  error: null,
};

export default MonthlyTrendChart;
