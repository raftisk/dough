import { useLocation } from 'react-router-dom';
import { Donut } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { theme } from '../styles/theme';

// To customize the title font, change this constant to any font family:
// Examples: "'Caveat', cursive" | "'Pacifico', cursive" | "'Dancing Script', cursive"
// Make sure to import the font in index.html first
const TITLE_FONT = 'inherit'; // Uses default system font

function Auth() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={styles.container}>
      {/* Left Side - Branding Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <Donut size={81} strokeWidth={2.25} style={styles.logoIcon} />
          </div>
          <h1 style={styles.brandTitle}>Dough</h1>
          <p style={styles.brandSubtitle}>Minimal expense tracking</p>
        </div>

        {/* Signature */}
        <div style={styles.signature}>
          <span style={styles.signatureText}>by raftisk</span>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div style={styles.rightPanel}>
        {isLoginPage ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.colors.background.page,
  },

  // Left Panel - Dark branding section (40% width)
  leftPanel: {
    flex: '0 0 40%',
    backgroundColor: theme.colors.text.primary,
    color: theme.colors.text.inverse,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[16],
  },

  brandingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  logoContainer: {
    marginBottom: theme.spacing[3],
  },

  logoIcon: {
    color: theme.colors.text.inverse,
  },

  brandTitle: {
    fontFamily: TITLE_FONT,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    color: theme.colors.text.inverse,
  },

  brandSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.border.medium,
  },

  signature: {
    alignSelf: 'center',
  },

  signatureText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.border.dark,
    fontWeight: theme.typography.fontWeight.normal,
  },

  // Right Panel - Form section (60% width)
  rightPanel: {
    flex: '0 0 60%',
    display: 'flex',
    backgroundColor: theme.colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
};

export default Auth;
