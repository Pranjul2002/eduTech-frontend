const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const TOKEN_KEY = "auth_token";

// ── Token store — persists to localStorage so refresh doesn't log the user out ─
let _token = null;

// Initialise from localStorage immediately (runs once when module loads).
// Safe to call during SSR — typeof window guard prevents crashes on the server.
if (typeof window !== "undefined") {
  _token = window.localStorage.getItem(TOKEN_KEY) || null;
}

export const tokenStore = {
  get: () => _token,

  set: (t) => {
    _token = t;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, t);
    }
  },

  clear: () => {
    _token = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
const DEFAULT_TIMEOUT_MS = 15_000;

export const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", headers = {}, body, timeout = DEFAULT_TIMEOUT_MS } = options;

  const authHeader = _token ? { Authorization: `Bearer ${_token}` } : {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json", ...authHeader, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (fetchError) {
    if (fetchError.name === "AbortError") {
      const err = new Error("Request timed out. Please check your connection.");
      err.code = "timeout"; err.status = 408; throw err;
    }
    const err = new Error("Network error. Please check your connection.");
    err.code = "network_error"; err.status = 0; throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  let data = {};
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json") || contentType.includes("problem+json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }
  } catch { data = {}; }

  if (!response.ok) {
    const err = new Error(data?.detail || data?.message || "Something went wrong. Please try again.");
    err.code = data?.error || null;
    err.status = response.status;
    err.data = data;

    if (response.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
      window.location.href = "/auth";
    }
    throw err;
  }

  return data;
};