import adminApi from "./adminApi";

// Signed direct-to-Cloudinary upload.
//
// Two hops on purpose: our API signs a short-lived set of upload parameters,
// then the file goes straight from the browser to Cloudinary. The API secret
// stays on the server, and image bytes never pass through our Express process.
//
// Requires the `media:upload` permission — the signature endpoint enforces it,
// so a user without it gets a 403 here rather than a silent failure later.

const MAX_BYTES = 10 * 1024 * 1024; // Cloudinary's free-tier per-image ceiling
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file selected.");
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WebP, AVIF or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is larger than 10 MB. Compress it and try again.");
  }

  const { data } = await adminApi.post("/media/signature");
  const { cloudName, apiKey, timestamp, signature, folder, uploadUrl } = data.data;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);

  // Plain fetch, not adminApi: this request goes to Cloudinary, and adminApi
  // would attach our cookies and JSON content-type to a third-party origin.
  const res = await fetch(uploadUrl, { method: "POST", body: form });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error?.message || "";
    } catch {
      /* Cloudinary returned a non-JSON error body; the status is enough. */
    }
    throw new Error(detail || `Upload failed (${res.status}).`);
  }

  const json = await res.json();
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    cloudName,
  };
}

export { ACCEPTED as ACCEPTED_IMAGE_TYPES };
