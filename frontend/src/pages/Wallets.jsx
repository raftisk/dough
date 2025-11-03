import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  NavigationBar,
  PageHeader,
  WalletCard,
  EmptyState,
  ErrorState,
  WalletForm,
} from '../components';
import { theme } from '../styles/theme';
import { getWallets, createWallet, updateWallet, deleteWallet } from '../services/api';

const Wallets = () => {
  // State management
  const [showMenu, setShowMenu] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const fabRef = useRef(null);

  // Fetch wallets from API on mount
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setError(null);
      const data = await getWallets();
      setWallets(data);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
      setError(err.message || 'Failed to load wallets');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        fabRef.current &&
        !fabRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Wallet types for filtering
  const walletTypes = ['Spending', 'Saving', 'Cash', 'Investment'];

  // Filter wallets based on selected type
  const getFilteredWallets = () => {
    if (selectedType === 'all') {
      return wallets;
    }
    return wallets.filter((wallet) => wallet.type === selectedType);
  };

  // Handle wallet type filter click
  const handleTypeFilterClick = (type) => {
    const typeValue = type.toLowerCase();
    // Toggle filter: if already selected, deselect it
    setSelectedType(selectedType === typeValue ? 'all' : typeValue);
  };

  // Handle FloatingActionButton menu actions
  const handleFabMenuAction = (action) => {
    if (action === 'wallet') {
      setSelectedWallet(null); // Clear for new wallet
      setShowWalletForm(true);
    } else if (action === 'type') {
      // Placeholder - do nothing or show message
      console.log('Add wallet type - coming soon');
    }
    setShowMenu(false);
  };

  // Handle wallet card click (edit)
  const handleEditWallet = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletForm(true);
  };

  // Handle wallet form submission
  const handleWalletSubmit = async (walletData) => {
    try {
      if (selectedWallet) {
        // Edit existing wallet via API
        await updateWallet(selectedWallet.id, {
          name: walletData.name,
          type: walletData.type,
          initial_balance: walletData.initial_balance,
          currency: walletData.currency,
        });
      } else {
        // Create new wallet via API
        await createWallet({
          name: walletData.name,
          type: walletData.type,
          initial_balance: walletData.initial_balance,
          currency: walletData.currency,
        });
      }

      // Refresh wallets list
      await fetchWallets();

      // Close form
      setShowWalletForm(false);
      setSelectedWallet(null);
    } catch (err) {
      console.error('Failed to save wallet:', err);
      alert(err.message || 'Failed to save wallet');
    }
  };

  const filteredWallets = getFilteredWallets();

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors.background.pageAlt,
        }}
      >
        <NavigationBar />
        <main
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: theme.spacing[6],
          }}
        >
          <PageHeader title="Wallets" subtitle="Manage your wallets and wallet types"/>
          <ErrorState error={error} onRetry={fetchWallets} />
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.pageAlt,
      }}
    >
      <NavigationBar />

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing[6],
        }}
      >
        {/* Page Header */}
        <PageHeader title="Wallets" subtitle="Manage your wallets and wallet types"/>

        {/* Wallet Type Filters */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing[2],
            marginBottom: theme.spacing[6],
            flexWrap: 'wrap',
          }}
        >
          {walletTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeFilterClick(type)}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                borderRadius: theme.border.radius.sm,
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                transition: theme.transitions.fast,
                backgroundColor:
                  selectedType === type.toLowerCase()
                    ? theme.colors.text.primary
                    : theme.colors.background.cardHover,
                color:
                  selectedType === type.toLowerCase()
                    ? theme.colors.text.inverse
                    : theme.colors.text.secondary,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Wallet Grid */}
        {filteredWallets.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))',
              gap: theme.spacing[4],
            }}
            className="wallet-grid"
          >
            {filteredWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} onClick={() => handleEditWallet(wallet)} />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              selectedType === 'all'
                ? 'No wallets found'
                : `No ${selectedType} wallets`
            }
          />
        )}
      </main>

      {/* Floating Action Button with Menu */}
      <div
        style={{
          position: 'fixed',
          bottom: theme.spacing[6],
          right: theme.spacing[6],
          zIndex: theme.zIndex.popover,
        }}
      >
        {/* Menu */}
        {showMenu && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              bottom: '70px',
              right: 0,
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.border.radius.lg,
              boxShadow: theme.shadows.lg,
              border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
              minWidth: '180px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => handleFabMenuAction('wallet')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[3],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                transition: theme.transitions.fast,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Add Wallet</span>
            </button>
            <button
              onClick={() => handleFabMenuAction('type')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[3],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                transition: theme.transitions.fast,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Add Wallet Type</span>
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          ref={fabRef}
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: theme.border.radius.full,
            backgroundColor: theme.colors.action.primary,
            color: theme.colors.text.inverse,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows.lg,
            transition: theme.transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = theme.shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.action.primary;
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Wallet Form Modal */}
      {showWalletForm && (
        <WalletForm
          isOpen={showWalletForm}
          onClose={() => {
            setShowWalletForm(false);
            setSelectedWallet(null);
          }}
          onSubmit={handleWalletSubmit}
          initialData={selectedWallet}
          mode={selectedWallet ? 'edit' : 'create'}
        />
      )}

      <style jsx>{`
        @media (min-width: 640px) {
          .wallet-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 768px) {
          .wallet-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .wallet-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Wallets;
