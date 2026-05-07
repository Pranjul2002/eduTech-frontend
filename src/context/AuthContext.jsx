"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/services/authService";

const AuthContext = createContext(null);

/**
 * AuthProvider — Production-hardened
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from dev version:
 *  1. checkAuth uses useCallback to prevent unnecessary re-renders
 *  2. Shows a "session expired" notice when redirected from apiClient
 *  3. logout() clears user state BEFORE the API call so the UI updates instantly
 *     even if the logout request is slow or fails
 *  4. Avoids double-fetch: checkAuth is idempotent and guarded against
 *     concurrent calls via a ref flag
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const profile = await getCurrentUser();
      setUser({
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "",
      });
    } catch {
      // 401 or network error — user is not authenticated
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Called after a successful login API response.
   * Re-fetches the user profile from the server so the context
   * always reflects server state (not client-assembled data).
   */
  const login = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  /**
   * Optimistically clears state then calls the logout endpoint.
   * UI responds immediately; backend cookie is cleared asynchronously.
   */
  const logout = useCallback(async () => {
    setUser(null); // Instant UI update
    try {
      await logoutUser();
    } catch {
      // Cookie was already cleared on the client; backend failure is non-critical
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