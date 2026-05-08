"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser, logoutUser } from "@/services/authService";
import { tokenStore } from "@/services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until first auth check completes

  /**
   * Checks if there is a valid token and fetches the user profile.
   * Called on mount (catches refresh) and after login.
   */
  const checkAuth = useCallback(async () => {
    // No token in memory/localStorage → definitely logged out, skip network call
    if (!tokenStore.get()) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const profile = await getCurrentUser();
      setUser({
        name:  profile.name  || "",
        email: profile.email || "",
        role:  profile.role  || "",
      });
    } catch {
      // Token is invalid or expired — clear it and treat as logged out
      tokenStore.clear();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Run on every mount (including page refresh).
   * If a token exists in localStorage, tokenStore already has it (initialised
   * at module load time), so checkAuth will validate it against the backend
   * and restore the user session silently.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /** Called right after a successful login — token already set in tokenStore. */
  const login = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    setUser(null);       // Instant UI update
    tokenStore.clear();  // Remove from memory + localStorage
    try {
      await logoutUser();
    } catch {
      // Non-critical — token already cleared client-side
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, authLoading, login, logout, refreshAuth: checkAuth }),
    [user, authLoading, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}