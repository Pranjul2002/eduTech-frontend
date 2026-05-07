/**
 * apiClient.js — Production-ready HTTP client
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from dev version:
 *  1. Base URL driven by NEXT_PUBLIC_API_URL env var — never hardcoded
 *  2. Structured error object with `code` field to handle token_expired vs other
 *  3. Automatic redirect to /auth on 401 token_expired (works in browser only)
 *  4. Request timeout via AbortController (prevents hung requests)
 *  5. Retries are intentionally NOT added here — use React Query / SWR for that
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

if (!API_BASE_URL && typeof window !== "undefined") {
  console.error(
    "[apiClient] NEXT_PUBLIC_API_URL is not set. " +
    "Add it to .env.local for dev or your Vercel environment variables for prod."
  );
}

const DEFAULT_TIMEOUT_MS = 15_000; // 15 seconds

/**
 * @typedef {Object} ApiError
 * @property {string} message   - Human-readable error message
 * @property {string} [code]    - Machine-readable error code (e.g. "token_expired")
 * @property {number} status    - HTTP status code
 * @property {object} [data]    - Full response body if available
 */

/**
 * Core fetch wrapper.
 *
 * @param {string} endpoint   - Path e.g. "/api/auth/login"
 * @param {object} [options]  - Fetch options + `timeout` in ms
 * @returns {Promise<any>}    - Parsed JSON response body
 * @throws {ApiError}
 */
export const apiClient = async (endpoint, options = {}) => {
  const {
    method = "GET",
    headers = {},
    body,
    credentials = "include",
    timeout = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials,
      body: body ? JSON.stringify(body) : undefined,
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

    // Auto-redirect on expired session — but not during SSR
    if (
      typeof window !== "undefined" &&
      response.status === 401 &&
      err.code === "token_expired"
    ) {
      window.location.href = "/auth?reason=session_expired";
      return; // prevent further error propagation
    }

    throw err;
  }

  return data;
};