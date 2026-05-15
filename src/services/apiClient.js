/**
 * apiClient.js — HttpOnly cookie edition
 *
 * What changed from the Bearer-token version:
 *   - tokenStore is GONE. The JWT lives in an HttpOnly cookie managed by the
 *     browser. JavaScript cannot read it, which is the whole security benefit.
 *   - Every fetch now sends `credentials: "include"` so the browser
 *     automatically attaches the auth cookie to every cross-origin request.
 *   - No Authorization header is set. The backend reads the cookie directly.
 *   - The 401 handler no longer clears a token — it just redirects to /auth.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DEFAULT_TIMEOUT_MS = 15_000;

export const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", headers = {}, body, timeout = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      // "include" tells the browser to send (and accept) cookies even on
      // cross-origin requests. Required for HttpOnly cookie auth.
      credentials: "include",
      signal: controller.signal,
    });
  } catch (fetchError) {
    if (fetchError.name === "AbortError") {
      const err = new Error("Request timed out. Please check your connection.");
      err.code = "timeout";
      err.status = 408;
      throw err;
    }
    const err = new Error("Network error. Please check your connection.");
    err.code = "network_error";
    err.status = 0;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse response body
  let data = {};
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json") || contentType.includes("problem+json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }
  } catch {
    data = {};
  }

  if (!response.ok) {
    const err = new Error(
      data?.detail || data?.message || "Something went wrong. Please try again."
    );
    err.code = data?.error || null;
    err.status = response.status;
    err.data = data;

    // Session expired or invalid cookie — redirect to login.
    // The browser will have already cleared the cookie if the server
    // returned it with Max-Age=0 on the logout endpoint.
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth";
    }

    throw err;
  }

  return data;
};