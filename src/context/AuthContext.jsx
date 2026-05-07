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
  const [user, setUser] = useState(null);
  // Start as true — we only know auth state after the first profile fetch
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // If no token in memory, skip the network call — definitely logged out
    if (!tokenStore.get()) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const profile = await getCurrentUser();
      setUser({
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "",
      });
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // On mount — token won't survive a full page refresh (memory cleared),
  // so we skip the network call and show logged-out state immediately.
  useEffect(() => {
    setAuthLoading(false);
  }, []);

  /**
   * Called right after loginUser() succeeds (token is already in tokenStore).
   * Fetches the profile so AuthContext has the user's name/email/role.
   */
  const login = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    setUser(null);          // Instant UI update
    tokenStore.clear();
    try {
      await logoutUser();
    } catch {
      // Non-critical — token is already cleared client-side
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      logout,
      refreshAuth: checkAuth,
    }),
    [user, authLoading, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}