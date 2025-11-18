import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

function AuthProvider(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    const storedPreferences = localStorage.getItem('userPreferences');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);

      // Load cached preferences
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }

      // Fetch fresh preferences in background
      api.get('/auth/preferences/')
        .then(response => {
          setPreferences(response.data);
          localStorage.setItem('userPreferences', JSON.stringify(response.data));
        })
        .catch(error => {
          console.error('Failed to fetch preferences:', error);
        });
    }
    setLoading(false);
  }, []);

  const login = async (jwtToken, userData) => {
    setIsLoggedIn(true);
    setToken(jwtToken);
    setUser(userData);

    // Persist to localStorage
    localStorage.setItem('authToken', jwtToken);
    localStorage.setItem('authUser', JSON.stringify(userData));

    // Fetch preferences after login
    try {
      const response = await api.get('/auth/preferences/');
      setPreferences(response.data);
      localStorage.setItem('userPreferences', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch preferences after login:', error);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setPreferences(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('userPreferences');
  };

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const value = {
    isLoggedIn,
    token,
    user,
    preferences,
    loading,
    login,
    logout,
    updatePreferences,
  };

  return <AuthContext.Provider value={value} {...props} />;
}

export { AuthContext, AuthProvider };
