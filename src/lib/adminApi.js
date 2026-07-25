import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_ADMIN_API || "https://vita-api-fd66c5fd8ec3.herokuapp.com/api/v1/admin";

// Exposed so public-site components (e.g. the admin ribbon) can probe
// /auth/me with a plain fetch, bypassing the refresh interceptor below.
export const ADMIN_API_BASE = baseURL;

// Bearer-token auth. Tokens live in localStorage and ride in the Authorization
// header, so there are no cross-site cookie rules (SameSite/Secure) to satisfy.
const ACCESS_KEY = "admin_access_token";
const REFRESH_KEY = "admin_refresh_token";

export const getAccessToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);

export const getRefreshToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);

// Store the { accessToken, refreshToken } pair returned by /auth/mfa and
// /auth/refresh. Missing fields are left untouched.
export const setTokens = (tokens) => {
  if (typeof window === "undefined" || !tokens) return;
  if (tokens.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

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
