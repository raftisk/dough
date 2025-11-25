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
      cardHover: '#f2f3f4',
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

// ============================================================================
// COMPONENT STYLES
// Standardized component styles to reduce inline style duplication
// Defined after theme object to allow referencing theme properties
// ============================================================================

theme.components = {
  // MODALS
  modal: {
    // Full-screen overlay backdrop for modals
    overlay: {
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
    },

    // Modal content container
    content: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.border.radius.xl,
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: theme.shadows.xl,
    },

    // Modal header container
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing[6],
      paddingBottom: 0,
      marginBottom: theme.spacing[6],
    },

    // Modal title (h2)
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      margin: 0,
    },

    // Close button (X icon)
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: theme.spacing[1],
      borderRadius: theme.border.radius.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: theme.transitions.fast,
      // Hover state: backgroundColor = theme.colors.background.cardHover
    },
  },

  // BUTTONS
  button: {
    // Primary action button (Save, Submit, Create, etc.)
    primary: {
      padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.inverse,
      backgroundColor: theme.colors.action.primary,
      border: 'none',
      cursor: 'pointer',
      transition: theme.transitions.fast,
      // Hover state: backgroundColor = theme.colors.action.primaryHover
    },

    // Secondary/Cancel button
    secondary: {
      padding: `${theme.spacing[2]} ${theme.spacing[5]}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      backgroundColor: 'transparent',
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
      cursor: 'pointer',
      transition: theme.transitions.fast,
      // Hover state: backgroundColor = theme.colors.background.cardHover
    },

    // Icon-only hover button (used for edit, delete, menu triggers, etc.)
    // This is a small button that only shows hover state when interacted with
    // Common use case: Edit/delete icons on cards, menu buttons, close buttons
    iconHover: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: theme.spacing[2],
      borderRadius: theme.border.radius.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: theme.transitions.fast,
      // Hover state: backgroundColor = theme.colors.background.cardHover
    },

    // Navigation link button (used in NavigationBar)
    navigationLink: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      backgroundColor: 'transparent',
      transition: theme.transitions.fast,
      // Active state: backgroundColor = theme.colors.background.cardHover
    },
  },

  // FORMS
  form: {
    // Form field label
    label: {
      display: 'block',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[1],
    },

    // Text input field
    input: {
      width: '100%',
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.card,
      outline: 'none',
      transition: theme.transitions.base,
      // Focus state: borderColor = theme.colors.text.primary
      // Blur state: borderColor = theme.colors.border.medium
    },

    // Select dropdown (styled same as input)
    select: {
      width: '100%',
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      paddingRight: theme.spacing[8],
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.card,
      cursor: 'pointer',
      textAlign: 'left',
      appearance: 'none',
      outline: 'none',
      transition: theme.transitions.base,
      // Focus state: borderColor = theme.colors.text.primary
      // Blur state: borderColor = theme.colors.border.medium
    },

    // Error message text
    errorText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.semantic.expense,
      marginTop: theme.spacing[1],
      margin: 0,
    },

    // Checkbox input
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: theme.colors.action.primary,
    },

    // Currency symbol prefix (absolutely positioned in input)
    currencyPrefix: {
      position: 'absolute',
      left: theme.spacing[3],
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      pointerEvents: 'none',
    },
  },

  // CARDS
  card: {
    // Standard card container (MetricCard, CategoryCard, WalletCard, etc.)
    // Used for larger card components with more padding
    container: {
      backgroundColor: theme.colors.background.card,
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
      borderRadius: theme.border.radius.lg,
      padding: theme.spacing[6],
      transition: theme.transitions.fast,
      cursor: 'pointer',
      // Hover state: boxShadow = theme.shadows.md, transform = 'translateY(-2px)'
    },

    // List item container (TransactionListItem, CategoryListItem, etc.)
    // Used for list items with less padding and base border radius
    listItem: {
      backgroundColor: theme.colors.background.card,
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
      borderRadius: theme.border.radius.base,
      padding: theme.spacing[2],
      transition: theme.transitions.fast,
      cursor: 'pointer',
      // Hover state: boxShadow = theme.shadows.md
    },
  },

  // POPOVERS & DROPDOWNS
  popover: {
    // Dropdown menu / popover container
    menu: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      backgroundColor: theme.colors.background.card,
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
      borderRadius: theme.border.radius.lg,
      boxShadow: theme.shadows.lg,
      padding: theme.spacing[2],
      zIndex: theme.zIndex.popover,
      // Note: position (top, left, right) may vary by use case
    },

    // Chevron icon (absolutely positioned in select/dropdown)
    chevronIcon: {
      position: 'absolute',
      right: theme.spacing[3],
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: theme.colors.text.secondary,
    },
  },

  // DROPDOWN MENUS
  // Lower-priority menus attached to buttons (vs higher-priority popovers)
  dropdown: {
    // Dropdown menu container (right-aligned, lower z-index than popover)
    menu: {
      position: 'absolute',
      right: 0,
      top: '100%',
      marginTop: theme.spacing[1],
      backgroundColor: theme.colors.background.card,
      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
      borderRadius: theme.border.radius.base,
      boxShadow: theme.shadows.lg,
      padding: theme.spacing[2],
      minWidth: '160px',
      zIndex: theme.zIndex.dropdown,
    },

    // Menu item button (used inside dropdown menus)
    menuItem: {
      width: '100%',
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      transition: theme.transitions.fast,
      borderRadius: theme.border.radius.sm,
      textAlign: 'left',
      // Hover state: backgroundColor = theme.colors.background.cardHover
    },
  },

  // NAVIGATION
  navigation: {
    // Navigation link (active and inactive states)
    link: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderRadius: theme.border.radius.base,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      backgroundColor: 'transparent',
      transition: theme.transitions.fast,
      // Active state: backgroundColor = theme.colors.background.cardHover
    },
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
