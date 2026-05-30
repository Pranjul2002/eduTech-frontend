// import { apiClient } from "./apiClient";

// export const getMentorTests = async () => {
//   return apiClient("/api/tests/my-tests");
// };

// export const createTest = async (payload) => {
//   return apiClient("/api/tests/create", {
//     method: "POST",
//     body: payload,
//   });
// };

// export const createQuestion = async (payload) => {
//   return apiClient("/api/questions/create", {
//     method: "POST",
//     body: payload,
//   });
// };



import { apiClient } from "./apiClient";

// ── Tests ─────────────────────────────────────────────────────────────────────

export const getMentorTests = () => apiClient("/api/tests/my-tests");

export const createTest = (payload) =>
  apiClient("/api/tests/create", { method: "POST", body: payload });

export const publishTest = (testId) =>
  apiClient(`/api/tests/${testId}/publish`, { method: "POST" });

// ── Questions ─────────────────────────────────────────────────────────────────

export const getTestQuestions = (testId) =>
  apiClient(`/api/tests/${testId}/questions`);

export const createQuestion = (payload) =>
  apiClient("/api/questions/create", { method: "POST", body: payload });

export const updateQuestion = (questionId, payload) =>
  apiClient(`/api/questions/${questionId}`, { method: "PUT", body: payload });

export const deleteQuestion = (questionId) =>
  apiClient(`/api/questions/${questionId}`, { method: "DELETE" });

export const deleteTest = (testId) =>
  apiClient(`/api/tests/${testId}`, { method: "DELETE" });