import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { theme } from '../styles/theme';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>Welcome back</h2>
        <p style={styles.formSubtitle}>Sign in to your account</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} style={styles.errorIcon} />
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              disabled={loading}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.text.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.light;
              }}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
              disabled={loading}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.text.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.light;
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            ...(loading ? styles.submitButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = theme.colors.action.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = theme.colors.action.primary;
            }
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div style={styles.footer}>
        <span style={styles.footerText}>Don't have an account?</span>
        <Link to="/signup" style={styles.footerLink}>
          Sign up
        </Link>
      </div>
    </div>
  );
}

const styles = {
  formContainer: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing[8],
    borderRadius: theme.border.radius.xl,
    boxShadow: theme.shadows.base,
  },

  formHeader: {
    marginBottom: theme.spacing[8],
  },

  formTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },

  formSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.semantic.expenseLight,
    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.semantic.expense}`,
    borderRadius: theme.border.radius.base,
    marginBottom: theme.spacing[6],
  },

  errorIcon: {
    color: theme.colors.semantic.expense,
    flexShrink: 0,
  },

  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.expense,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[5],
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  inputIcon: {
    position: 'absolute',
    left: theme.spacing[3],
    color: theme.colors.text.muted,
    pointerEvents: 'none',
  },

  input: {
    width: '100%',
    padding: `${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[2]} ${theme.spacing[10]}`,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.page,
    border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
    borderRadius: theme.border.radius.base,
    outline: 'none',
    transition: theme.transitions.base,
  },

  submitButton: {
    marginTop: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.inverse,
    backgroundColor: theme.colors.action.primary,
    border: 'none',
    borderRadius: theme.border.radius.base,
    cursor: 'pointer',
    transition: theme.transitions.base,
  },

  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  footer: {
    marginTop: theme.spacing[6],
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },

  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  footerLink: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textDecoration: 'none',
  },
};

export default LoginForm;
