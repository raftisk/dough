# Dough Frontend Components

This document describes the foundational React components created for the Dough expense tracker frontend.

## Style System

### Theme Configuration (`src/styles/theme.js`)

Centralized theme configuration exporting:

- **Colors**: Background, text, border, semantic (income/expense/transfer), alert, and action colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent padding/margin scale (4px to 64px)
- **Borders**: Width, radius, and style configurations
- **Shadows**: Card, hover, and focus shadow definitions
- **Breakpoints**: Responsive design breakpoints
- **Transitions**: Animation timing configurations

**Utility Functions:**
- `getTypeColor(type)` - Returns color for transaction type
- `getTypeBackgroundColor(type)` - Returns background color for transaction type

**Usage:**
```javascript
import { theme, getTypeColor } from '../styles/theme';

// Use in inline styles
<div style={{ color: theme.colors.text.primary }} />

// Use utility functions
const color = getTypeColor('income'); // Returns green
```

### Global Styles (`src/styles/global.css`)

Basic CSS reset and global styles:
- Box-sizing reset
- Font smoothing
- Focus states
- Smooth scrolling

### Tailwind Configuration (`src/index.css`)

Tailwind 4 custom theme values integrated via CSS custom properties:
- Custom colors for income/expense/transfer
- Custom shadows for cards
- Extends default Tailwind utilities

## Utility Functions

### Date Utilities (`src/utils/date.js`)

Date formatting and helper functions:

- `getCurrentMonthYear()` - Returns current month and year (e.g., "October 2025")
- `getCurrentMonth()` - Returns current month name
- `getCurrentYear()` - Returns current year
- `formatDateShort(date)` - Format date to short format (e.g., "Oct 15, 2025")
- `formatDateLong(date)` - Format date to long format (e.g., "October 15, 2025")

**Usage:**
```javascript
import { getCurrentMonthYear } from '../utils/date';

const title = getCurrentMonthYear(); // "October 2025"
```

## Core Components

### 1. NavigationBar (`src/components/NavigationBar.jsx`)

Horizontal navigation bar with logo and links.

**Props:** None (reads route from `useLocation`)

**Features:**
- App logo with icon
- Navigation links: Dashboard, Wallets, Transactions, Categories, Budgets, Wishlist, Insights
- Active link highlighting
- Hover states
- Sticky positioning

**Usage:**
```javascript
import NavigationBar from '../components/NavigationBar';

<NavigationBar />
```

---

### 2. PageHeader (`src/components/PageHeader.jsx`)

Page title with optional subtitle and action button.

**Props:**
- `title` (string, required) - Page title
- `subtitle` (string, optional) - Subtitle text
- `actionLabel` (string, optional) - Button label
- `onAction` (function, optional) - Button click handler

**Usage:**
```javascript
import PageHeader from '../components/PageHeader';

<PageHeader
  title="Dashboard"
  subtitle="Overview of your finances"
  actionLabel="+ Add Transaction"
  onAction={() => console.log('Add clicked')}
/>
```

---

### 3. TransactionListItem (`src/components/TransactionListItem.jsx`)

Displays a single transaction with type icon, description, category, and amount.

**Props:**
- `transaction` (object, required) - Transaction data:
  - `id` (number) - Transaction ID
  - `description` (string) - Transaction description
  - `amount` (number) - Transaction amount
  - `type` (string) - 'income', 'expense', or 'transfer'
  - `date` (string) - ISO date string
  - `category` (string) - Category name
  - `category_icon` (string, optional) - Category emoji/icon
  - `wallet` (string) - Wallet name
  - `currency_symbol` (string, optional) - Currency symbol
  - `recurrence` (string, optional) - Recurrence pattern
- `onEdit` (function, optional) - Edit handler
- `onDelete` (function, optional) - Delete handler

**Features:**
- Type-specific icons and colors (+ for income, - for expense, ↔ for transfer)
- Category badge with icon
- Formatted date and amount
- Recurrence indicator
- Edit and delete buttons
- Hover effects

**Usage:**
```javascript
import TransactionListItem from '../components/TransactionListItem';

const transaction = {
  id: 1,
  description: 'Grocery shopping',
  amount: 127.50,
  type: 'expense',
  date: '2025-10-15',
  category: 'Groceries',
  category_icon: '🛒',
  wallet: 'Chase Checking',
  currency_symbol: '$',
};

<TransactionListItem
  transaction={transaction}
  onEdit={(t) => console.log('Edit', t)}
  onDelete={(t) => console.log('Delete', t)}
/>
```

---

### 4. WalletCard (`src/components/WalletCard.jsx`)

Card displaying wallet information and balance.

**Props:**
- `wallet` (object, required) - Wallet data:
  - `id` (number) - Wallet ID
  - `name` (string) - Wallet name
  - `type` (string) - Wallet type (e.g., 'Checking', 'Savings')
  - `currency` (string) - Currency code (e.g., 'USD')
  - `currency_symbol` (string, optional) - Currency symbol
  - `current_balance` (number, optional) - Current balance
- `onClick` (function, optional) - Card click handler
- `onEdit` (function, optional) - Edit button handler

**Features:**
- Wallet name and type badge
- Large formatted balance display
- Currency code
- Edit button
- Hover animation (shadow + scale)
- Responsive grid layout

**Usage:**
```javascript
import WalletCard from '../components/WalletCard';

const wallet = {
  id: 1,
  name: 'Chase Checking',
  type: 'Checking',
  currency: 'USD',
  currency_symbol: '$',
  current_balance: 4532.75,
};

<WalletCard
  wallet={wallet}
  onClick={(w) => console.log('Clicked', w)}
  onEdit={(w) => console.log('Edit', w)}
/>
```

---

### 5. CategoryCard (`src/components/CategoryCard.jsx`)

Compact card showing category information.

**Props:**
- `category` (object, required) - Category data:
  - `id` (number) - Category ID
  - `name` (string) - Category name
  - `icon` (string, optional) - Category emoji/icon
  - `type` (string) - 'income' or 'expense'
  - `total_amount` (number, optional) - Aggregate amount
- `onClick` (function, optional) - Card click handler
- `onEdit` (function, optional) - Edit button handler

**Features:**
- Category icon (large emoji)
- Category name
- Type badge (colored: green for income, purple for expense)
- Optional total amount display
- Edit button
- Hover effects
- Responsive grid layout

**Usage:**
```javascript
import CategoryCard from '../components/CategoryCard';

const category = {
  id: 1,
  name: 'Groceries',
  icon: '🛒',
  type: 'expense',
  total_amount: 450.00,
};

<CategoryCard
  category={category}
  onClick={(c) => console.log('Clicked', c)}
  onEdit={(c) => console.log('Edit', c)}
/>
```

---

### 6. MetricCard (`src/components/MetricCard.jsx`)

Display key financial metrics with optional value masking.

**Props:**
- `label` (string, required) - Metric label (e.g., "Total Income")
- `value` (string/number, required) - Metric value (e.g., "€3,450.00")
- `icon` (Lucide icon component, required) - Icon component (e.g., TrendingUp)
- `iconColor` (string, optional) - Icon color (defaults to gray)
- `valueColor` (string, optional) - Value text color (defaults to black)
- `subtitle` (string, optional) - Additional context text
- `masked` (boolean, optional) - Whether to mask value initially (default: false)

**Features:**
- Large, scannable values
- Icon visual anchoring (32px size)
- Value masking with Eye/EyeOff toggle
- Subtitle for additional context
- Hover lift effect
- Responsive layout

**Usage:**
```javascript
import { TrendingUp } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { theme } from '../styles/theme';

<MetricCard
  label="Total Income"
  value="€3,450.00"
  icon={TrendingUp}
  iconColor={theme.colors.semantic.income}
  subtitle="+15% from last month"
/>

// With masking
<MetricCard
  label="Total Wealth"
  value="€24,567.89"
  icon={Wallet}
  masked={true}
  subtitle="Across 3 wallets"
/>
```

**Value Masking:**
- When `masked={true}`, value displays as "€•,•••.••"
- Click Eye icon to toggle visibility
- Icon changes: Eye ↔ EyeOff
- State managed internally with useState

---

### 7. BudgetCard (`src/components/BudgetCard.jsx`)

Show budget status with visual progress indicator and color-coded status.

**Props:**
- `budget` (object, required) - Budget data:
  - `category` (object) - Category with `name` and `icon`
  - `amount` (number) - Budget limit
  - `spent_amount` (number) - Amount spent
  - `remaining_amount` (number) - Amount remaining
  - `percentage_used` (number) - Percentage of budget used
  - `period` (string) - Budget period ("monthly", "quarterly", etc.)
  - `is_active` (boolean, optional) - Whether budget is currently active
- `onEdit` (function, optional) - Edit handler
- `onDelete` (function, optional) - Delete handler

**Features:**
- Visual progress bar with color coding:
  - Green (0-74%): On track
  - Orange/Yellow (75-99%): Warning
  - Red (100%+): Over budget
- Period badge (Monthly, Quarterly, etc.)
- Inactive state styling (grayed out, 60% opacity)
- Spent/Total and Remaining amounts
- Menu icon for actions
- Animated progress bar

**Usage:**
```javascript
import BudgetCard from '../components/BudgetCard';

const budget = {
  category: { name: 'Food & Dining', icon: '🍔' },
  amount: 1000,
  spent_amount: 650,
  remaining_amount: 350,
  percentage_used: 65,
  period: 'monthly',
  is_active: true,
};

<BudgetCard
  budget={budget}
  onEdit={(b) => console.log('Edit', b)}
  onDelete={(b) => console.log('Delete', b)}
/>
```

**Inactive Budget:**
- When `is_active={false}`:
  - 60% opacity
  - "INACTIVE" badge displayed
  - Gray progress bar
  - No hover effects

---

## Design System

### Color Philosophy

**Black & White Base:**
- Background: White (`#ffffff`) or gray-50 (`#f9fafb`)
- Text: Black (`#111827`) or gray variants
- Cards: White with gray-200 borders
- All icons/buttons: Black

**Accent Colors (Financial Data Only):**
- Income: Green (`#10b981`)
- Expense: Red (`#ef4444`)
- Transfer: Gray (`#6b7280`)

### Typography

- **Font Stack**: System fonts (Inter, -apple-system, sans-serif)
- **Sizes**: xs (12px) to 4xl (36px)
- **Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)

### Spacing

Consistent 4px-based scale:
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 5 = 20px
- 6 = 24px
- 8 = 32px
- 10 = 40px
- 12 = 48px
- 16 = 64px

### Interactions

- Subtle hover states (shadow, background change)
- Smooth transitions (150-300ms)
- Clear focus states for accessibility

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NavigationBar.jsx
│   │   ├── PageHeader.jsx
│   │   ├── MetricCard.jsx           ← NEW
│   │   ├── BudgetCard.jsx           ← NEW
│   │   ├── TransactionListItem.jsx
│   │   ├── WalletCard.jsx
│   │   ├── CategoryCard.jsx
│   │   └── index.js
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── styles/
│   │   ├── theme.js
│   │   └── global.css
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── format.js
│   │   └── date.js                  ← NEW
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

## Testing

The Dashboard page (`src/pages/Dashboard.jsx`) currently displays all components with mock data for visual testing:

1. **NavigationBar** - At the top with navigation links
2. **PageHeader** - Shows current month/year (e.g., "October 2025") with "+ Add Transaction" button
3. **Metric Cards** section - 4 metric cards displaying:
   - Total Income (with green icon)
   - Total Expenses (with red icon)
   - Net Savings (with gray icon)
   - Total Wealth (with masking enabled)
4. **Budget Cards** section - 4 budget cards with progress bars:
   - Food & Dining (65% - green)
   - Transportation (93% - orange)
   - Entertainment (122% - red, over budget)
   - Travel (22% - inactive, grayed out)
5. **Recent Transactions** section - 4 sample transactions with EUR currency
6. **Wallet Cards** section - 3 sample wallets in grid with EUR balances
7. **Category Cards** section - 6 sample categories in grid

**All mock data uses EUR (€) currency.**

To view:
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173/dashboard`

## Backend Integration

### API Updates Made

**Added to `backend/transactions/constants.py`:**
- `CURRENCY_SYMBOLS` dictionary mapping currency codes to symbols
- `get_currency_symbol(currency_code)` helper function

**Updated `backend/transactions/serializers.py`:**

**WalletSerializer:**
- Added `currency_symbol` field (SerializerMethodField)

**TransactionSerializer:**
- Added `category_icon` field (from category.icon)
- Added `currency_symbol` field (from wallet.currency)

These changes ensure the frontend components receive all necessary data from the API.

## Next Steps

1. Replace Dashboard mock data with real API calls
2. Build full-page implementations (Wallets page, Transactions page, etc.)
3. Create form components for adding/editing data
4. Add modals/dialogs for user interactions
5. Implement responsive layouts for mobile
6. Add loading states and error handling
7. Create charts/visualizations for Insights page

## Style Philosophy

**Separation of Concerns:**
- All style values in `theme.js`
- Components import and use theme values
- Easy to maintain and customize

**Benefits:**
- Change entire color scheme by editing one file
- Consistent spacing/typography across app
- Type-safe styling (with TypeScript would get autocomplete)
- Components are "dumb" - just receive props and render

**Example of changing theme:**
```javascript
// In theme.js
colors: {
  text: {
    primary: '#1a1a1a', // Change this to change all primary text
  }
}
```

All components automatically update to use the new color.
