export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:    "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT:   "/api/auth/logout",
  },

  DASHBOARD: {
    GET: "/api/dashboard",
  },

  USER: {
    PROFILE:  "/api/user/profile",
    SETTINGS: "/api/user/settings",
    MY_BOOKS: "/api/user/my-books",   // ← NEW: free + purchased books for the logged-in user
  },

  // ── Catalog (public — no JWT needed) ──────────────────────────────────────
  CATALOG: {
    CHAPTERS: (bookSlug) => `/api/catalog/chapters/${bookSlug}`,
    CHAPTER:  (bookSlug, chapterId) => `/api/catalog/chapters/${bookSlug}/${chapterId}`,
  },

  // ── Questions (JWT required — mentor only) ────────────────────────────────
  QUESTIONS: {
    CREATE: "/api/questions/create",
  },

  // ── Tests (JWT required) ──────────────────────────────────────────────────
  TESTS: {
    LIST:        "/api/tests",
    QUESTIONS:   (testId) => `/api/tests/${testId}/questions`,
    SUBMIT:      (testId) => `/api/tests/${testId}/submit`,
    MY_ATTEMPTS: "/api/tests/my-attempts",
    REVIEW:      (testId) => `/api/tests/${testId}/review`,
  },
};