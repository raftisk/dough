import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { theme } from '../styles/theme';

function Settings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/user/');
      setUserData(response.data);
    } catch (err) {
      setError('Failed to load user data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await api.post('/auth/logout/');
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with logout even if API call fails
    } finally {
      // Clear local auth state and redirect
      logout();
      navigate('/login');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <PageHeader title="User Settings" />
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

  if (error || !userData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.page }}>
        <NavigationBar />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `${theme.spacing[6]} ${theme.spacing[4]}`
        }}>
          <PageHeader title="User Settings" />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: theme.colors.semantic.expense,
          }}>
            {error || 'Failed to load user data'}
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
        padding: `${theme.spacing[6]} ${theme.spacing[4]}`
      }}>
        <PageHeader title="User Settings" />

        {/* User Information Card */}
        <div style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.lg,
          padding: theme.spacing[6],
          marginTop: theme.spacing[6],
          border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[6],
          }}>
            User Information
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing[4],
          }}>
            {/* Email */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
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
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
              }}>
                Username
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
              }}>
                {userData.username}
              </div>
            </div>

            {/* Date Joined */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
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

            {/* Account Status */}
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[2],
              }}>
                Account Status
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.base,
                color: userData.is_active ? theme.colors.semantic.income : theme.colors.semantic.expense,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                {userData.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div style={{
            marginTop: theme.spacing[8],
            paddingTop: theme.spacing[6],
            borderTop: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          }}>
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
                borderRadius: theme.border.radius.md,
                cursor: 'pointer',
                transition: `background-color ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.action.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.action.primary;
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
