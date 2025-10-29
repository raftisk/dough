import { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import { theme } from '../styles/theme';
import { getCurrentYear } from '../utils/date';
import { getMonthlySummary } from '../services/api';

/**
 * Insights Page Component
 *
 * Main page for financial insights and analytics.
 * Currently displays a monthly trend chart showing income vs expenses.
 * Designed to be extensible for future widgets and visualizations.
 *
 * Features:
 * - Monthly trend visualization
 * - Year selector (future enhancement placeholder)
 * - Clean, minimalist layout matching Dough aesthetic
 *
 * Assumptions:
 * - Single-user app (no authentication)
 * - Default year is current year
 * - Backend provides data for all 12 months
 * - All monetary values are in EUR
 */
function Insights() {
  // State management
  const [monthlySummaryData, setMonthlySummaryData] = useState([]);
  const [selectedYear] = useState(getCurrentYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch monthly summary data on mount
  useEffect(() => {
    /**
     * Fetch monthly summary data from API
     */
    const fetchMonthlySummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlySummary(selectedYear);
        setMonthlySummaryData(data);
      } catch (err) {
        console.error('Failed to fetch monthly summary:', err);
        setError(err.message || 'Failed to load insights data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySummary();
  }, [selectedYear]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.page,
      }}
    >
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing[6],
        }}
      >
        {/* Page Header */}
        <PageHeader
          title="Insights"
          subtitle="Visualize your financial trends and patterns"
        />

        {/* Monthly Trend Chart Section */}
        <section
          style={{
            marginBottom: theme.spacing[8],
          }}
        >
          {/* Section Header */}
          <div
            style={{
              marginBottom: theme.spacing[4],
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[1],
              }}
            >
              Monthly Trends
            </h2>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Track your income and expenses throughout {selectedYear}
            </p>
          </div>

          {/* Chart Container */}
          <MonthlyTrendChart
            data={monthlySummaryData}
            loading={loading}
            error={error}
          />

          {/* Chart Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing[6],
              marginTop: theme.spacing[4],
            }}
          >
            {/* Income Legend Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: '#4ade80',
                }}
              />
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                Income
              </span>
            </div>

            {/* Expenses Legend Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor: '#f87171',
                }}
              />
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                Expenses
              </span>
            </div>
          </div>
        </section>

        {/* Placeholder for Future Widgets */}
        {/*
          Additional insights widgets can be added here:
          - Category breakdown pie chart
          - Budget progress indicators
          - Savings rate trends
          - Spending patterns by day of week
          - etc.
        */}
      </div>
    </div>
  );
}

export default Insights;
