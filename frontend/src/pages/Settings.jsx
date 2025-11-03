import { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import { theme } from '../styles/theme';

function Settings() {
  // Temporary hardcoded user data for testing
  const [userData] = useState({
    email: 'user@example.com',
    username: 'Demo User',
    date_joined: '2025-10-30T19:47:00Z',
    is_active: true,
  });

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.primary }}>
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
                color: userData.is_active ? theme.colors.success : theme.colors.error,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                {userData.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
