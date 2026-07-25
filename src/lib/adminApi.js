import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_ADMIN_API || "https://vita-api-fd66c5fd8ec3.herokuapp.com/api/v1/admin";

// Exposed so public-site components (e.g. the admin ribbon) can probe
// /auth/me with a plain fetch, bypassing the refresh interceptor below.
export const ADMIN_API_BASE = baseURL;

const adminApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// On a 401, try one silent refresh, then retry the original request once.
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
        refreshing = refreshing || adminApi.post("/auth/refresh");
        await refreshing;
        refreshing = null;
        return adminApi(original);
      } catch (e) {
        refreshing = null;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default adminApi;
