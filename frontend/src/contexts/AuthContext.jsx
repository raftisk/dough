import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthProvider(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, userData) => {
    setIsLoggedIn(true);
    setToken(jwtToken);
    setUser(userData);

    // Persist to localStorage
    localStorage.setItem('authToken', jwtToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value = {
    isLoggedIn,
    token,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value} {...props} />;
}

export { AuthContext, AuthProvider };
