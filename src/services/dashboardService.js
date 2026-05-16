import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

// ── Dashboard ─────────────────────────────────────────────────────────────────
/**
 * Fetches the full dashboard payload from GET /api/dashboard.
 * The backend now injects free tests into the `tests` field automatically,
 * so no separate test fetch is needed on the initial load.
 */
export const getDashboardData = async () => {
  return apiClient(API_ENDPOINTS.DASHBOARD.GET);
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async () => {
  return apiClient(API_ENDPOINTS.USER.PROFILE);
};

export const updateProfile = async (payload) => {
  return apiClient(API_ENDPOINTS.USER.PROFILE, {
    method: "PUT",
    body: payload,
  });
};

// ── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = async () => {
  return apiClient(API_ENDPOINTS.USER.SETTINGS);
};

export const updateSettings = async (payload) => {
  return apiClient(API_ENDPOINTS.USER.SETTINGS, {
    method: "PUT",
    body: payload,
  });
};

// ── My Books ──────────────────────────────────────────────────────────────────
/**
 * Fetches the logged-in user's full book library:
 *   - All free NCERT books (Physics, Chemistry, Maths — classes 10/11/12)
 *   - All books the user has purchased
 * Returns: BookDto[]  (see GET /api/user/my-books)
 */
export const getMyBooks = async () => {
  return apiClient(API_ENDPOINTS.USER.MY_BOOKS);
};

// ── Tests ─────────────────────────────────────────────────────────────────────
/**
 * Fetches tests visible to the logged-in user.
 * @param {"ALL"|"FREE"|"OWNED"|"PAID_ALL"} type - filter type (default: "ALL")
 *
 * Used by MyTest component to refresh the list after an attempt is submitted.
 * The initial load comes from getDashboardData (already embeds free tests).
 */
export const getMyTests = async (type = "FREE") => {
  return apiClient(`${API_ENDPOINTS.TESTS.LIST}?type=${type}`);
};

/**
 * Fetches the questions for a specific test.
 * @param {number} testId
 * Returns: StudentQuestionResponse[]
 */
export const getTestQuestions = async (testId) => {
  return apiClient(API_ENDPOINTS.TESTS.QUESTIONS(testId));
};

/**
 * Submits answers for a test.
 * @param {number} testId
 * @param {{ answers: { questionId: number, selectedAnswer: string }[] }} payload
 * Returns: SubmitTestResponse
 */
export const submitTest = async (testId, payload) => {
  return apiClient(API_ENDPOINTS.TESTS.SUBMIT(testId), {
    method: "POST",
    body: payload,
  });
};

/**
 * Fetches review data for a completed attempt:
 * questions WITH correct answers exposed, plus the attempt stats.
 * @param {number} testId
 * Returns: { attempt: TestAttemptResponse, questions: ReviewQuestionResponse[] }
 */
export const getTestReview = async (testId) => {
  return apiClient(API_ENDPOINTS.TESTS.REVIEW(testId));
};

/**
 * Fetches the logged-in user's past test attempts.
 * Returns: TestAttemptResponse[]
 */
export const getMyAttempts = async () => {
  return apiClient(API_ENDPOINTS.TESTS.MY_ATTEMPTS);
};