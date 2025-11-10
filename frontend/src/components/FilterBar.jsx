import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, X } from 'lucide-react';
import { theme } from '../styles/theme';
import { getIconComponent } from '../constants';
import { formatDateToLocal } from '../utils/format';

const FilterBar = ({
  selectedTypes,
  setSelectedTypes,
  selectedCategories,
  setSelectedCategories,
  selectedWallets,
  setSelectedWallets,
  dateRange,
  setDateRange,
  categories = [],
  wallets = [],
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = {
    type: useRef(null),
    categories: useRef(null),
    wallets: useRef(null),
    date: useRef(null),
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs[openDropdown].current) {
        if (!dropdownRefs[openDropdown].current.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Type filter handlers
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleTypeToggleAll = () => {
    const allTypes = ['expense', 'income', 'transfer'];
    if (selectedTypes.length === allTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(allTypes);
    }
  };

  // Category filter handlers
  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleCategoryToggleAll = (categoryType) => {
    const typeCategories = categories
      .filter((cat) => cat.type === categoryType)
      .map((cat) => cat.id);

    const allSelected = typeCategories.every((id) =>
      selectedCategories.includes(id)
    );

    if (allSelected) {
      setSelectedCategories(
        selectedCategories.filter((id) => !typeCategories.includes(id))
      );
    } else {
      const newSelected = [...selectedCategories];
      typeCategories.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedCategories(newSelected);
    }
  };

  // Wallet filter handlers
  const handleWalletToggle = (walletId) => {
    if (selectedWallets.includes(walletId)) {
      setSelectedWallets(selectedWallets.filter((w) => w !== walletId));
    } else {
      setSelectedWallets([...selectedWallets, walletId]);
    }
  };

  const handleWalletToggleAll = () => {
    if (selectedWallets.length === wallets.length) {
      setSelectedWallets([]);
    } else {
      setSelectedWallets(wallets.map((w) => w.id));
    }
  };


  // Date range presets
  const getDateRangePreset = (preset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (preset) {
      case 'thisMonth':
        return {
          start: formatDateToLocal(new Date(year, month, 1)),
          end: formatDateToLocal(new Date(year, month + 1, 0)),
        };
      case 'lastMonth':
        return {
          start: formatDateToLocal(new Date(year, month - 1, 1)),
          end: formatDateToLocal(new Date(year, month, 0)),
        };
      case 'last3Months':
        return {
          start: formatDateToLocal(new Date(year, month - 2, 1)),
          end: formatDateToLocal(new Date(year, month + 1, 0)),
        };
      case 'thisYear':
        return {
          start: formatDateToLocal(new Date(year, 0, 1)),
          end: formatDateToLocal(new Date(year, 11, 31)),
        };
      default:
        return dateRange;
    }
  };

  // Format date range for display
  const formatDateRangeDisplay = () => {
    if (!dateRange.start || !dateRange.end) return 'Date Range';

    // Parse dates in local timezone by adding 'T00:00:00' to ensure local interpretation
    const start = new Date(dateRange.start + 'T00:00:00');
    const end = new Date(dateRange.end + 'T00:00:00');

    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', formatOptions);
    const endStr = end.toLocaleDateString('en-US', formatOptions);

    return `${startStr} - ${endStr}`;
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedTypes(['expense', 'income', 'transfer']);
    setSelectedCategories([]);
    setSelectedWallets([]);
    const today = new Date();
    setDateRange({
      start: formatDateToLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
      end: formatDateToLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      selectedTypes.length < 3 ||
      selectedCategories.length > 0 ||
      selectedWallets.length > 0
    );
  };

  // Filter button component
  const FilterButton = ({ label, count, isActive, dropdownKey, children }) => (
    <div style={{ position: 'relative' }} ref={dropdownRefs[dropdownKey]}>
      <button
        onClick={() => {
          setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          backgroundColor: theme.colors.background.card,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${
            isActive ? theme.colors.action.primary : theme.colors.border.medium
          }`,
          borderRadius: theme.border.radius.base,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.primary,
          cursor: 'pointer',
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.card;
        }}
      >
        <span>
          {label}
          {count > 0 && ` (${count})`}
        </span>
        <ChevronDown size={16} />
      </button>
      {children}
    </div>
  );

  // Checkbox component
  const Checkbox = ({ checked, onChange, label }) => (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[2],
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        cursor: 'pointer',
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
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer',
          accentColor: theme.colors.action.primary,
        }}
      />
      <span style={{ fontSize: theme.typography.fontSize.sm }}>{label}</span>
    </label>
  );

  // Dropdown menu component
  const DropdownMenu = ({ children, isOpen }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          backgroundColor: theme.colors.background.card,
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          borderRadius: theme.border.radius.lg,
          boxShadow: theme.shadows.lg,
          padding: theme.spacing[2],
          minWidth: '280px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: theme.zIndex.popover,
        }}
      >
        {children}
      </div>
    );
  };

  // Get filtered categories based on selected types
  const getFilteredCategories = () => {
    const incomeCategories = categories.filter((cat) => cat.type === 'income');
    const expenseCategories = categories.filter((cat) => cat.type === 'expense');

    return {
      income: selectedTypes.includes('income') ? incomeCategories : [],
      expense: selectedTypes.includes('expense') ? expenseCategories : [],
    };
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.card,
        borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        padding: theme.spacing[4],
        borderRadius: theme.border.radius.base,
        boxShadow: theme.shadows.sm,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
          flexWrap: 'wrap',
        }}
      >
        {/* Type Filter */}
        <FilterButton
          label="Type"
          count={0}
          isActive={selectedTypes.length < 3}
          dropdownKey="type"
        >
          <DropdownMenu isOpen={openDropdown === 'type'}>
            <Checkbox
              checked={selectedTypes.length === 3}
              onChange={handleTypeToggleAll}
              label="All"
            />
            <div style={{ height: '1px', backgroundColor: theme.colors.border.light, margin: `${theme.spacing[1]} 0` }} />
            <Checkbox
              checked={selectedTypes.includes('expense')}
              onChange={() => handleTypeToggle('expense')}
              label="Expense"
            />
            <Checkbox
              checked={selectedTypes.includes('income')}
              onChange={() => handleTypeToggle('income')}
              label="Income"
            />
            <Checkbox
              checked={selectedTypes.includes('transfer')}
              onChange={() => handleTypeToggle('transfer')}
              label="Transfer"
            />
          </DropdownMenu>
        </FilterButton>

        {/* Categories Filter */}
        <FilterButton
          label="Categories"
          count={selectedCategories.length}
          isActive={selectedCategories.length > 0}
          dropdownKey="categories"
        >
          <DropdownMenu isOpen={openDropdown === 'categories'}>
            {filteredCategories.income.length > 0 && (
              <>
                <div style={{ padding: `${theme.spacing[2]} ${theme.spacing[3]}`, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.muted }}>
                  INCOME CATEGORIES
                </div>
                <Checkbox
                  checked={filteredCategories.income.every((cat) =>
                    selectedCategories.includes(cat.id)
                  )}
                  onChange={() => handleCategoryToggleAll('income')}
                  label="All Income"
                />
                {filteredCategories.income.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <label
                      key={category.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        cursor: 'pointer',
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
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: theme.colors.action.primary,
                        }}
                      />
                      <IconComponent size={16} color={theme.colors.text.primary} />
                      <span style={{ fontSize: theme.typography.fontSize.sm }}>{category.name}</span>
                    </label>
                  );
                })}
                {filteredCategories.expense.length > 0 && (
                  <div style={{ height: '1px', backgroundColor: theme.colors.border.light, margin: `${theme.spacing[2]} 0` }} />
                )}
              </>
            )}
            {filteredCategories.expense.length > 0 && (
              <>
                <div style={{ padding: `${theme.spacing[2]} ${theme.spacing[3]}`, fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.muted }}>
                  EXPENSE CATEGORIES
                </div>
                <Checkbox
                  checked={filteredCategories.expense.every((cat) =>
                    selectedCategories.includes(cat.id)
                  )}
                  onChange={() => handleCategoryToggleAll('expense')}
                  label="All Expenses"
                />
                {filteredCategories.expense.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <label
                      key={category.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        cursor: 'pointer',
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
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: theme.colors.action.primary,
                        }}
                      />
                      <IconComponent size={16} color={theme.colors.text.primary} />
                      <span style={{ fontSize: theme.typography.fontSize.sm }}>{category.name}</span>
                    </label>
                  );
                })}
              </>
            )}
            {filteredCategories.income.length === 0 && filteredCategories.expense.length === 0 && (
              <div style={{ padding: theme.spacing[3], fontSize: theme.typography.fontSize.sm, color: theme.colors.text.muted, textAlign: 'center' }}>
                No categories available
              </div>
            )}
          </DropdownMenu>
        </FilterButton>

        {/* Wallets Filter */}
        <FilterButton
          label="Wallets"
          count={selectedWallets.length}
          isActive={selectedWallets.length > 0 && selectedWallets.length < wallets.length}
          dropdownKey="wallets"
        >
          <DropdownMenu isOpen={openDropdown === 'wallets'}>
            <Checkbox
              checked={selectedWallets.length === wallets.length}
              onChange={handleWalletToggleAll}
              label="All"
            />
            <div style={{ height: '1px', backgroundColor: theme.colors.border.light, margin: `${theme.spacing[1]} 0` }} />
            {wallets.map((wallet) => (
              <label
                key={wallet.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  cursor: 'pointer',
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
                <input
                  type="checkbox"
                  checked={selectedWallets.includes(wallet.id)}
                  onChange={() => handleWalletToggle(wallet.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: theme.colors.action.primary,
                  }}
                />
                <span style={{ fontSize: theme.typography.fontSize.sm, flex: 1 }}>{wallet.name}</span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                    backgroundColor: theme.colors.background.cardHover,
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    borderRadius: theme.border.radius.full,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {wallet.type}
                </span>
              </label>
            ))}
          </DropdownMenu>
        </FilterButton>

        {/* Date Range Filter */}
        <FilterButton
          label={formatDateRangeDisplay()}
          count={0}
          isActive={false}
          dropdownKey="date"
        >
          <DropdownMenu isOpen={openDropdown === 'date'}>
          <div style={{ padding: theme.spacing[2] }}>
            <div style={{ marginBottom: theme.spacing[3] }}>
              <div style={{ fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.muted, marginBottom: theme.spacing[2] }}>
                QUICK SELECT
              </div>
              <button
                onClick={() => {
                  setDateRange(getDateRangePreset('thisMonth'));
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.sm,
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
              <button
                onClick={() => {
                  setDateRange(getDateRangePreset('lastMonth'));
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.sm,
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
                Last Month
              </button>
              <button
                onClick={() => {
                  setDateRange(getDateRangePreset('last3Months'));
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.sm,
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
                Last 3 Months
              </button>
              <button
                onClick={() => {
                  setDateRange(getDateRangePreset('thisYear'));
                  setOpenDropdown(null);
                }}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.border.radius.base,
                  fontSize: theme.typography.fontSize.sm,
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
                This Year
              </button>
            </div>
            <div style={{ height: '1px', backgroundColor: theme.colors.border.light, margin: `${theme.spacing[2]} 0` }} />
            <div>
              <div style={{ fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.muted, marginBottom: theme.spacing[2] }}>
                CURRENT RANGE
              </div>
              <div style={{ marginBottom: theme.spacing[2] }}>
                <label style={{ display: 'block', fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                  Start Date
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    backgroundColor: theme.colors.background.cardHover,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                  }}
                >
                  {dateRange.start ? new Date(dateRange.start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No start date'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                  End Date
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    backgroundColor: theme.colors.background.cardHover,
                    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
                    borderRadius: theme.border.radius.base,
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                  }}
                >
                  {dateRange.end ? new Date(dateRange.end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No end date'}
                </div>
              </div>
            </div>
          </div>
          </DropdownMenu>
        </FilterButton>

        {/* Clear All Filters Button */}
        {hasActiveFilters() && (
          <button
            onClick={handleClearAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: theme.border.radius.base,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              transition: theme.transitions.fast,
              marginLeft: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            <X size={16} />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  selectedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedTypes: PropTypes.func.isRequired,
  selectedCategories: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedCategories: PropTypes.func.isRequired,
  selectedWallets: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedWallets: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
  }).isRequired,
  setDateRange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
};

export default FilterBar;
