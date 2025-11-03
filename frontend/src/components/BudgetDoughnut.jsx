import PropTypes from 'prop-types';

/**
 * BudgetDoughnut - SVG-based doughnut chart component
 * Displays budget percentage as a circular progress indicator
 */
const BudgetDoughnut = ({ percentage, size = 100, strokeWidth = 14, children }) => {
  // Calculate SVG dimensions and circle properties
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress offset (start from top, clockwise)
  const progress = Math.min(percentage, 100) / 100;
  const offset = circumference * (1 - progress);

  // Determine color based on percentage
  const getColor = (pct) => {
    if (pct >= 100) return '#ef4444'; // Red
    if (pct >= 75) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const color = getColor(percentage);

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SVG Doughnut Chart */}
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Background circle (light gray) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc (colored based on percentage) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Center content (children - can be icon, percentage, or custom content) */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

BudgetDoughnut.propTypes = {
  percentage: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  children: PropTypes.node,
};

export default BudgetDoughnut;
