import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

function safeUser(user) {
  if (!user) return null;
  return {
    ...user,
    skills: Array.isArray(user.skills) ? user.skills : [],
    interests: Array.isArray(user.interests) ? user.interests : [],
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    savedPosts: Array.isArray(user.savedPosts) ? user.savedPosts : [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(r => setUser(safeUser(r.data)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    setUser(safeUser(r.data));
    return r.data;
  };

  const signup = async (data) => {
    const r = await api.post('/auth/signup', data);
    setUser(safeUser(r.data));
    return r.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => safeUser({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);