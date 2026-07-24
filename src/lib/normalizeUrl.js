// Forgiving URL cleanup for the admin editors. A user who types "example.com"
// means "https://example.com" — so we add the scheme for them rather than
// bouncing the whole save with a validation error.
//
// Mirrors the server's httpUrl rule (server/src/validators/blog.validator.js):
// http(s) URLs and site-relative "/paths" pass untouched. Bare hosts get an
// https:// prefix. Anything carrying a different scheme (javascript:, mailto:…)
// is left exactly as typed so the server still rejects it — we never turn a
// javascript: string into a valid-looking https one.
export function normalizeUrl(value) {
  const v = (value ?? "").trim();
  if (v === "") return "";
  if (/^https?:\/\//i.test(v)) return v; // already has http(s)
  if (v.startsWith("/")) return v; // site-relative path
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v; // some other scheme — leave it
  return `https://${v}`;
}
