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

// The public site is cached, so a write here is not visible to visitors until
// that cache is purged. Every successful write therefore asks the site to purge
// it (app/api/revalidate) — debounced, because one editor action can be a burst
// of requests (a page save plus a block reorder, an upload plus a post update)
// and one purge after the burst covers all of them. Fire-and-forget: a failed
// purge only means the change waits out REVALIDATE_CONTENT, which must never
// fail the save that already succeeded.
const PURGE_DELAY_MS = 1500;
let purgeTimer = null;
const schedulePublicPurge = () => {
  if (typeof window === "undefined") return;
  clearTimeout(purgeTimer);
  purgeTimer = setTimeout(() => {
    const token = getAccessToken();
    if (!token) return;
    fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => {});
  }, PURGE_DELAY_MS);
};

const isPublicWrite = (config) => {
  const method = (config?.method || "get").toLowerCase();
  if (method === "get" || method === "head" || method === "options") return false;
  return !(config?.url || "").includes("/auth/");
};

// On a 401, try one silent refresh with the stored refresh token, then retry
// the original request once. Auth calls (/auth/*) are excluded so a failed
// refresh/login/mfa doesn't loop.
let refreshing = null;
adminApi.interceptors.response.use(
  (res) => {
    if (isPublicWrite(res.config)) schedulePublicPurge();
    return res;
  },
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
