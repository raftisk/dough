import { Link, useLocation } from 'react-router-dom';
import { Donut, Settings } from 'lucide-react';
import { theme } from '../styles/theme';

const NavigationBar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/wallets', label: 'Wallets' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/categories', label: 'Categories' },
    { path: '/budgets', label: 'Budgets' },
    { path: '/wishlist', label: 'Wishlist' },
    { path: '/insights', label: 'Insights' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        backgroundColor: theme.colors.background.card,
        borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${theme.spacing[6]}`,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.sticky,
      }}
    >
      {/* Left: Logo + Navigation Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            marginRight: theme.spacing[8],
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.text.primary,
          }}
        >
          <Donut size={28} strokeWidth={2.25} />
          <span>Dough</span>
        </Link>

        {/* Navigation Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[1],
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                backgroundColor: isActive(link.path)
                  ? theme.colors.background.cardHover
                  : 'transparent',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.path)) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: User Settings Icon */}
      <Link
        to="/settings"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: theme.spacing[2],
          borderRadius: theme.border.radius.base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: theme.transitions.fast,
          color: theme.colors.text.secondary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
          e.currentTarget.style.color = theme.colors.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme.colors.text.secondary;
        }}
      >
        <Settings size={20} />
      </Link>
    </nav>
  );
};

export default NavigationBar;
