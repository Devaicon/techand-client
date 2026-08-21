// The name an image is uploaded to Cloudinary under.
//
// Cloudinary builds the public id from this (the signed `use_filename`
// parameter), and the public id is the path in the delivery URL — which is the
// `src` of every image on a published article. So this string is read by search
// engines, and `agentic-ai-dashboard` is worth having where `IMG_4471 (1)` is
// not.
//
// Its own module rather than a helper inside uploadToCloudinary.js so it can be
// unit-tested without pulling in the axios client that file imports.
//
// Extension is dropped because Cloudinary appends its own, from the format it
// detects in the bytes. Everything outside [a-z0-9] collapses to a single
// hyphen, so the result never needs URL-escaping. 80 characters is room enough
// for a post slug plus a descriptive name and keeps the whole path well inside
// Cloudinary's 255-character public-id limit.
export function seoFilename(name) {
  const slug = String(name || "")
    .normalize("NFKD")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    // The slice can land mid-separator; trimming again keeps the tail clean.
    .replace(/-+$/, "");

  // A name made entirely of characters that do not survive the pass above —
  // "©.png", or a purely non-Latin filename — would otherwise upload as an
  // empty public id, which Cloudinary rejects.
  return slug || "image";
}
