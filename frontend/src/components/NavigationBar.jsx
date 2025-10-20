import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';
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
        padding: `0 ${theme.spacing[6]}`,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.sticky,
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
        <Wallet size={28} />
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
    </nav>
  );
};

export default NavigationBar;
