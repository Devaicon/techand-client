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

// Icons are the one place SVG is allowed: brand and product marks (Dynamics
// 365, Power Platform) only exist as vectors, and an icon rasterised to PNG
// looks wrong at the sizes the cards render it. Photographs keep the raster-only
// list above.
//
// An SVG can carry script, so this is deliberately opt-in per field rather than
// added to ACCEPTED. Uploaded icons are only ever rendered through `<img>` /
// next/image pointed at res.cloudinary.com, where browsers do not execute
// embedded script — they are never inlined into the document.
const ACCEPTED_ICONS = [...ACCEPTED, "image/svg+xml"];

// Which signature endpoint to ask. `media` is the site image library and needs
// `media:upload`; `avatar` is open to any signed-in member and can only ever
// write to the avatars folder, because the folder is part of what the server
// signs. A viewer has no media:upload and must still be able to set a face to
// their name.
const SIGNATURE_ENDPOINT = {
  media: "/media/signature",
  avatar: "/profile/avatar-signature",
};

/**
 * @param {File} file
 * @param {{accept?: string[], target?: "media" | "avatar"}} [options]
 */
export async function uploadToCloudinary(
  file,
  { accept = ACCEPTED, target = "media" } = {},
) {
  if (!file) throw new Error("No file selected.");
  if (!accept.includes(file.type)) {
    const label = accept
      .map((t) => t.replace("image/", "").replace("+xml", "").toUpperCase())
      .join(", ");
    throw new Error(`Unsupported image type. Use ${label}.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is larger than 10 MB. Compress it and try again.");
  }

  const { data } = await adminApi.post(
    SIGNATURE_ENDPOINT[target] || SIGNATURE_ENDPOINT.media,
  );
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

export { ACCEPTED as ACCEPTED_IMAGE_TYPES, ACCEPTED_ICONS as ACCEPTED_ICON_TYPES };
