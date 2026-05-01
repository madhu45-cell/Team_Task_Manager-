import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// Direct backend URL – includes the /api prefix
const API_BASE = 'https://team-task-manager-3-i7i1.onrender.com/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        await fetchUser();
        toast.success('Logged in');
        return true;
      } else {
        toast.error(data.detail || 'Login failed');
        return false;
      }
    } catch (err) {
      toast.error('Network error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
        toast.success('Registered! Please login.');
        return true;
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Signup failed');
        return false;
      }
    } catch (err) {
      toast.error('Network error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};