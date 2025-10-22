import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

const WalletLabel = ({ wallet, showBalance = false, layout = 'horizontal', className = '' }) => {
  if (!wallet) return null;

  // Format currency amount
  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance || 0);
  };

  const isVertical = layout === 'vertical';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        gap: theme.spacing[2],
      }}
    >
      <span
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        }}
      >
        {wallet.name}
      </span>
      <span
        style={{
          backgroundColor: theme.colors.background.cardHover,
          color: theme.colors.text.secondary,
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
          borderRadius: theme.border.radius.full,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {wallet.type}
      </span>
      {showBalance && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}
        >
          {wallet.currency_symbol || '$'}
          {formatBalance(wallet.current_balance)}
        </span>
      )}
    </div>
  );
};

WalletLabel.propTypes = {
  wallet: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    currency_symbol: PropTypes.string,
    current_balance: PropTypes.number,
  }).isRequired,
  showBalance: PropTypes.bool,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

export default WalletLabel;
