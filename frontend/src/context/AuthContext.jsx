import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, getToken, setToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    if (!getToken()) {
      setLoading(false);
      return null;
    }

    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const register = async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }

    return data.user;
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updatedData) => {
    const data = await apiRequest('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updatedData)
    });

    setUser(data.user);
    return data.user;
  };

  const refreshUser = async () => {
    if (!getToken()) return null;
    const data = await apiRequest('/auth/me');
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    setUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
