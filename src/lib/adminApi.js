import axios from "axios";

// Base URL and token storage live in lib/adminSession.js so that public
// components can reach them without pulling axios into the public bundle.
// Re-exported here so every existing `from "@/lib/adminApi"` import still
// resolves — admin code should not have to care about the split.
import {
  ADMIN_API_BASE,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/adminSession";

export {
  ADMIN_API_BASE,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};

const baseURL = ADMIN_API_BASE;

const adminApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request.
adminApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try one silent refresh with the stored refresh token, then retry
// the original request once. Auth calls (/auth/*) are excluded so a failed
// refresh/login/mfa doesn't loop.
let refreshing = null;
adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response && error.response.status;
    const isAuthCall =
      original && original.url && original.url.includes("/auth/");

    if (status === 401 && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing =
          refreshing ||
          adminApi.post("/auth/refresh", { refreshToken: getRefreshToken() });
        const { data } = await refreshing;
        refreshing = null;
        setTokens(data.data.tokens);
        return adminApi(original);
      } catch (e) {
        refreshing = null;
        clearTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default adminApi;
