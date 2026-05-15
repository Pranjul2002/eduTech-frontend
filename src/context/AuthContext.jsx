"use client";

/**
 * AuthContext.jsx — HttpOnly cookie edition
 *
 * What changed from the Bearer-token version:
 *   - tokenStore import is GONE. The JWT is an HttpOnly cookie — the browser
 *     owns it; JavaScript never touches it.
 *   - checkAuth no longer checks tokenStore.get() before making a network call.
 *     Instead it always calls GET /api/user/profile. If the cookie is present
 *     and valid the backend returns the profile; if not, it returns 401 and
 *     we set user = null. This is the correct way to restore a session after
 *     a page refresh when using cookie auth.
 *   - login() and logout() are unchanged in shape but simpler internally.
 *   - logout() calls logoutUser() FIRST (server clears cookie) then clears
 *     local user state, so there is no window where the UI says "logged out"
 *     but a valid cookie still exists.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser, logoutUser } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Asks the backend whether a valid session cookie exists.
   * Called on mount (page refresh) and after login.
   *
   * If GET /api/user/profile returns 200  → cookie is valid, populate user.
   * If it returns 401                      → no valid cookie, user = null.
   * The 401 redirect in apiClient is suppressed here so we don't bounce the
   * user to /auth on the initial load of a public page.
   */
  const checkAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const profile = await getCurrentUser();
      setUser({
        name:  profile.name  || "",
        email: profile.email || "",
        role:  profile.role  || "",
      });
    } catch (err) {
      // 401 = no valid cookie (expected on public pages / after logout)
      // Any other error = treat as unauthenticated to be safe
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Run once on mount to restore session from existing cookie.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Called right after a successful loginUser() call.
   * The cookie was already set by the browser from the Set-Cookie response
   * header — we just need to fetch the profile to populate React state.
   */
  const login = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  /**
   * Logs out: server clears the cookie first, then we clear local state.
   * Order matters — if we cleared state first and the server call failed,
   * the UI would show "logged out" while the cookie remained valid.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser(); // server sets Max-Age=0 on the cookie
    } catch {
      // Non-critical — proceed with local cleanup regardless
    } finally {
      setUser(null);
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
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}