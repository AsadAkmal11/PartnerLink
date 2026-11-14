import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyMe = useCallback((data) => {
    setUser(data?.user ?? null);
    setStudent(data?.student ?? null);
    setProfessor(data?.professor ?? null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      applyMe(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.me();
      applyMe(data);
      return data;
    } catch {
      clearToken();
      applyMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyMe]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const { access_token } = await api.login(email, password);
      setToken(access_token);
      setLoading(true);
      return refresh();
    },
    [refresh],
  );

  const registerStudent = useCallback(
    async (payload) => {
      const { access_token } = await api.registerStudent(payload);
      setToken(access_token);
      setLoading(true);
      return refresh();
    },
    [refresh],
  );

  const registerProfessor = useCallback(
    async (payload) => {
      const { access_token } = await api.registerProfessor(payload);
      setToken(access_token);
      setLoading(true);
      return refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    clearToken();
    applyMe(null);
  }, [applyMe]);

  const value = useMemo(
    () => ({
      user,
      student,
      professor,
      loading,
      isAuthenticated: Boolean(user),
      login,
      registerStudent,
      registerProfessor,
      logout,
      refresh,
    }),
    [user, student, professor, loading, login, registerStudent, registerProfessor, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
