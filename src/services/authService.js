import { apiClient, tokenStore } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export const loginUser = async (payload) => {
  const data = await apiClient(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: payload,
  });
  // Store token in memory immediately after login
  if (data.token) {
    tokenStore.set(data.token);
  }
  return data;
};

export const registerUser = async (payload) => {
  return apiClient(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: payload,
  });
};

export const logoutUser = async () => {
  tokenStore.clear();
  return apiClient(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" });
};

export const getCurrentUser = async () => {
  return apiClient(API_ENDPOINTS.USER.PROFILE);
};