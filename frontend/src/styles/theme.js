// Centralized theme configuration for Dough expense tracker
// Import and use these values throughout components for consistency

export const theme = {
  // Color system
  colors: {
    // Background colors
    background: {
      page: '#ffffff',
      pageAlt: '#f9fafb', // gray-50
      card: '#ffffff',
      cardHover: '#f9fafb',
    },

    // Text colors
    text: {
      primary: '#111827', // gray-900, near black
      secondary: '#4b5563', // gray-600
      muted: '#9ca3af', // gray-400
      inverse: '#ffffff',
    },

    // Border colors
    border: {
      light: '#e5e7eb', // gray-200
      medium: '#d1d5db', // gray-300
      dark: '#9ca3af', // gray-400
    },

    // Semantic colors for financial data
    semantic: {
      income: '#10b981', // green-500
      incomeLight: '#d1fae5', // green-100
      expense: '#ef4444', // red-500
      expenseLight: '#fee2e2', // red-100
      transfer: '#6b7280', // gray-500
      transferLight: '#f3f4f6', // gray-100
    },

    // Warning/alert colors
    alert: {
      warning: '#f59e0b', // amber-500
      warningLight: '#fef3c7', // amber-100
      info: '#3b82f6', // blue-500
      infoLight: '#dbeafe', // blue-100
    },

    // Action colors (buttons, links)
    action: {
      primary: '#111827', // black
      primaryHover: '#1f2937', // gray-800
      secondary: '#6b7280', // gray-500
      secondaryHover: '#4b5563', // gray-600
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },

    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing scale (in pixels)
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },

  // Border configuration
  border: {
    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },

    radius: {
      none: '0',
      sm: '0.25rem',   // 4px
      base: '0.5rem',  // 8px
      lg: '0.75rem',   // 12px
      xl: '1rem',      // 16px
      full: '9999px',
    },

    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
    },
  },

  // Shadow system
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    focus: '0 0 0 3px rgba(17, 24, 39, 0.1)', // black with opacity
  },

  // Breakpoints for responsive design
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
  },
};

// Utility function to get color by transaction type
export const getTypeColor = (type) => {
  const typeMap = {
    income: theme.colors.semantic.income,
    expense: theme.colors.semantic.expense,
    transfer: theme.colors.semantic.transfer,
  };
  return typeMap[type?.toLowerCase()] || theme.colors.text.secondary;
};

// Utility function to get type background color
export const getTypeBackgroundColor = (type) => {
  const typeMap = {
    income: theme.colors.semantic.incomeLight,
    expense: theme.colors.semantic.expenseLight,
    transfer: theme.colors.semantic.transferLight,
  };
  return typeMap[type?.toLowerCase()] || theme.colors.background.cardHover;
};

export default theme;
