import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Edit2, Check, X, Download } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import CurrencyPicker from '../components/CurrencyPicker';
import Toggle from '../components/Toggle';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { theme } from '../styles/theme';

function Settings() {
  const [userData, setUserData] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  // Currency picker state
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { logout, updatePreferences: updatePreferencesContext } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, preferencesResponse, walletsResponse] = await Promise.all([
        api.get('/auth/user/'),
        api.get('/auth/preferences/'),
        api.get('/wallets/')
      ]);

      setUserData(userResponse.data);
      setPreferences(preferencesResponse.data);
      setWallets(walletsResponse.data);
      setEditedUsername(userResponse.data.username);
    } catch (err) {
      setError('Failed to load settings data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/user/');
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      alert('Username cannot be empty');
      return;
    }

    setSavingUsername(true);
    try {
      const response = await api.patch('/auth/user/', { username: editedUsername });
      setUserData(response.data);
      setIsEditingUsername(false);
    } catch (err) {
      console.error('Update username error:', err);
      alert('Failed to update username. Please try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleCancelEditUsername = () => {
    setEditedUsername(userData.username);
    setIsEditingUsername(false);
  };

  const handleUpdatePreference = async (field, value) => {
    try {
      const response = await api.patch('/auth/preferences/', { [field]: value });
      setPreferences(response.data);
      // Update preferences in AuthContext so all components get the new values
      updatePreferencesContext(response.data);
    } catch (err) {
      console.error('Update preference error:', err);
      alert('Failed to update preference. Please try again.');
    }
  };

  const handleExportData = () => {
    // Placeholder for export data functionality
    alert('Export data functionality coming soon!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.page }}>
        <NavigationBar />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `${theme.spacing[6]} ${theme.spacing[4]}`
        }}>
          <PageHeader title="Settings" />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: theme.colors.text.secondary,
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData || !preferences) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.page }}>
        <NavigationBar />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `${theme.spacing[6]} ${theme.spacing[4]}`
        }}>
          <PageHeader title="Settings" />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: theme.colors.semantic.expense,
          }}>
            {error || 'Failed to load settings data'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.page }}>
      <NavigationBar />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
        paddingBottom: theme.spacing[12],
      }}>
        <PageHeader title="Settings" />

        {/* Account Information Section */}
        <section style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          padding: theme.spacing[6],
          marginTop: theme.spacing[6],
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[6],
          }}>
            Account Information
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing[5],
          }}>
            {/* Email */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Email
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
              }}>
                {userData.email}
              </div>
            </div>

            {/* Username */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Username
              </div>
              {isEditingUsername ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    disabled={savingUsername}
                    style={{
                      flex: 1,
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      fontSize: theme.typography.fontSize.base,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                      borderRadius: theme.border.radius.base,
                      outline: 'none',
                      transition: theme.transitions.fast,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.action.primary;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border.medium;
                    }}
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={savingUsername}
                    style={{
                      padding: theme.spacing[2],
                      backgroundColor: theme.colors.action.primary,
                      color: theme.colors.text.inverse,
                      border: 'none',
                      borderRadius: theme.border.radius.base,
                      cursor: savingUsername ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.fast,
                      opacity: savingUsername ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!savingUsername) {
                        e.target.style.backgroundColor = theme.colors.action.primaryHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors.action.primary;
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEditUsername}
                    disabled={savingUsername}
                    style={{
                      padding: theme.spacing[2],
                      backgroundColor: theme.colors.background.page,
                      color: theme.colors.text.primary,
                      border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                      borderRadius: theme.border.radius.base,
                      cursor: savingUsername ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.fast,
                      opacity: savingUsername ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!savingUsername) {
                        e.target.style.backgroundColor = theme.colors.background.cardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors.background.page;
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                  }}>
                    {userData.username}
                  </div>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    style={{
                      padding: theme.spacing[1],
                      backgroundColor: 'transparent',
                      color: theme.colors.text.secondary,
                      border: 'none',
                      borderRadius: theme.border.radius.base,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.fast,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.colors.background.cardHover;
                      e.target.style.color = theme.colors.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = theme.colors.text.secondary;
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Date Joined */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Date Joined
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
              }}>
                {formatDate(userData.date_joined)}
              </div>
            </div>
          </div>
        </section>

        {/* User Preferences Section */}
        <section style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          padding: theme.spacing[6],
          marginTop: theme.spacing[4],
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[6],
          }}>
            User Preferences
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing[5],
          }}>
            {/* Default Currency */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Default Currency
              </div>
              <button
                onClick={() => setShowCurrencyPicker(true)}
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.page,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                  borderRadius: theme.border.radius.base,
                  cursor: 'pointer',
                  transition: theme.transitions.fast,
                  textAlign: 'left',
                  width: '250px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.background.cardHover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.background.page;
                }}
              >
                {preferences.default_currency}
              </button>
            </div>

            {/* Amount Format */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Amount Format
              </div>
              <select
                value={preferences.amount_format || ''}
                onChange={(e) => handleUpdatePreference('amount_format', e.target.value || null)}
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.page,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                  borderRadius: theme.border.radius.base,
                  cursor: 'pointer',
                  outline: 'none',
                  width: '250px',
                }}
              >
                <option value="">Use currency default</option>
                <option value="en-US">United States (1,234.56)</option>
                <option value="de-DE">Germany (1.234,56)</option>
                <option value="en-GB">United Kingdom (1,234.56)</option>
                <option value="fr-FR">France (1 234,56)</option>
                <option value="es-ES">Spain (1.234,56)</option>
                <option value="it-IT">Italy (1.234,56)</option>
              </select>
            </div>

            {/* Default Wallet */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Default Wallet
              </div>
              <select
                value={preferences.default_wallet || ''}
                onChange={(e) => handleUpdatePreference('default_wallet', e.target.value || null)}
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.page,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                  borderRadius: theme.border.radius.base,
                  cursor: 'pointer',
                  outline: 'none',
                  width: '250px',
                }}
              >
                <option value="">Select a wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Allocation Toggle */}
            <div>
              <Toggle
                checked={preferences.smart_allocation}
                onChange={() => handleUpdatePreference('smart_allocation', !preferences.smart_allocation)}
                label="Smart Allocation (Beta)"
                description="Enable smart budget allocation algorithm"
              />
            </div>

            {/* Multi-Currency Toggle */}
            <div>
              <Toggle
                checked={preferences.multi_currency}
                onChange={() => handleUpdatePreference('multi_currency', !preferences.multi_currency)}
                label="Multi-Currency (Beta)"
                description="Enable multi-currency support"
              />
            </div>
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          padding: theme.spacing[6],
          marginTop: theme.spacing[4],
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[6],
          }}>
            Data & Privacy
          </h2>

          <button
            onClick={handleExportData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
              padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.page,
              border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
              borderRadius: theme.border.radius.base,
              cursor: 'pointer',
              transition: theme.transitions.fast,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.background.cardHover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.background.page;
            }}
          >
            <Download size={16} />
            Export Data
          </button>
        </section>

        {/* Account Actions Section */}
        <section style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          padding: theme.spacing[6],
          marginTop: theme.spacing[4],
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[6],
          }}>
            Account Actions
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing[3],
          }}>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.inverse,
                backgroundColor: theme.colors.action.primary,
                border: 'none',
                borderRadius: theme.border.radius.base,
                cursor: 'pointer',
                transition: theme.transitions.fast,
                width: 'fit-content',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.action.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.action.primary;
              }}
            >
              <LogOut size={16} />
              Log Out
            </button>

            {/* Delete Account Button */}
            <div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.inverse,
                    backgroundColor: theme.colors.semantic.expense,
                    border: 'none',
                    borderRadius: theme.border.radius.base,
                    cursor: 'pointer',
                    transition: theme.transitions.fast,
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              ) : (
                <div style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.semantic.expenseLight,
                  border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.semantic.expense}`,
                  borderRadius: theme.border.radius.base,
                }}>
                  <p style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[3],
                    fontWeight: theme.typography.fontWeight.medium,
                  }}>
                    Warning: This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: theme.spacing[2],
                  }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      style={{
                        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.inverse,
                        backgroundColor: theme.colors.semantic.expense,
                        border: 'none',
                        borderRadius: theme.border.radius.base,
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        opacity: deleting ? 0.5 : 1,
                      }}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      style={{
                        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.primary,
                        backgroundColor: theme.colors.background.page,
                        border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                        borderRadius: theme.border.radius.base,
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        opacity: deleting ? 0.5 : 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <CurrencyPicker
          isOpen={showCurrencyPicker}
          onClose={() => setShowCurrencyPicker(false)}
          onSelectCurrency={(currency) => {
            handleUpdatePreference('default_currency', currency.code);
            setShowCurrencyPicker(false);
          }}
          selectedCurrency={preferences.default_currency}
        />
      )}
    </div>
  );
}

export default Settings;
