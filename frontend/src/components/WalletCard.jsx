import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const WalletCard = ({ wallet, onClick, onEdit }) => {
  // Format currency amount
  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  // Get wallet type badge color
  const getTypeBadgeStyle = () => {
    return {
      backgroundColor: theme.colors.background.cardHover,
      color: theme.colors.text.secondary,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.border.radius.full,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      style={{
        backgroundColor: theme.colors.background.card,
        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        borderRadius: theme.border.radius.lg,
        padding: theme.spacing[4],
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        cursor: onClick ? 'pointer' : 'default',
        transition: theme.transitions.base,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.md;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Wallet name */}
      <h3
        style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}
      >
        {wallet.name}
      </h3>

      {/* Wallet type badge */}
      <div>
        <span style={getTypeBadgeStyle()}>
          {wallet.type}
        </span>
      </div>

      {/* Balance */}
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[1],
          }}
        >
          {wallet.currency_symbol || '$'}
          {formatBalance(wallet.current_balance || 0)}
        </div>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          {wallet.currency || 'USD'}
        </div>
      </div>
    </div>
  );
};

WalletCard.propTypes = {
  wallet: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    currency_symbol: PropTypes.string,
    current_balance: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
};

export default WalletCard;
