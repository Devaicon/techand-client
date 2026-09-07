// Admin session state — the API's base URL and the stored token pair.
//
// Split out of lib/adminApi.js, which creates an axios instance at module
// scope. SiteChrome is a public, client-side component and needs exactly two
// things from that file: the base URL, and the access token, so it can probe
// /auth/me with a plain fetch. Importing them from adminApi pulled axios into
// every public page's bundle — ~58 KB of parser and adapter code for a request
// the comment there already said should bypass axios entirely.
//
// Nothing here may import axios, or the split is undone.

const baseURL =
  process.env.NEXT_PUBLIC_ADMIN_API ||
  "https://vita-api-fd66c5fd8ec3.herokuapp.com/api/v1/admin";

// Exposed so public-site components (e.g. the admin ribbon) can probe
// /auth/me with a plain fetch, bypassing adminApi's refresh interceptor.
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
  if (tokens.refreshToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
