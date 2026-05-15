/**
 * authService.js — HttpOnly cookie edition
 *
 * What changed:
 *   - loginUser no longer reads or stores a token from the response.
 *     The backend sets the HttpOnly cookie in the Set-Cookie response header,
 *     and the browser stores it automatically.
 *   - logoutUser no longer calls tokenStore.clear() — there is no token store.
 *     The backend clears the cookie server-side (Max-Age=0) on POST /api/auth/logout.
 *   - getCurrentUser is unchanged — it hits /api/user/profile which the
 *     browser authenticates automatically via the cookie.
 */

import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Sends login credentials to the backend.
 * On success, the backend's Set-Cookie header stores the HttpOnly JWT cookie
 * in the browser — no token handling needed here.
 */
export const loginUser = async (payload) => {
  return apiClient(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: payload,
  });
};

/**
 * Registers a new account.
 * Does not log the user in — they must call loginUser separately.
 */
export const registerUser = async (payload) => {
  return apiClient(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: payload,
  });
};

/**
 * Logs out the current user.
 * The backend sets Max-Age=0 on the auth cookie, which instructs the
 * browser to delete it immediately. No client-side cleanup needed.
 */
export const logoutUser = async () => {
  return apiClient(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" });
};

/**
 * Fetches the currently authenticated user's profile.
 * Works because the browser automatically sends the HttpOnly cookie.
 * Returns the user profile object, or throws a 401 if not authenticated.
 */
export const getCurrentUser = async () => {
  return apiClient(API_ENDPOINTS.USER.PROFILE);
};