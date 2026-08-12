"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import UserAvatar from "./UserAvatar";

// Avatar picker for the profile page.
//
// Deliberately not CloudinaryImageField: that one carries alt text, focus and
// zoom controls, all of which exist for badly-framed article stock photos and
// none of which mean anything for a round 80px portrait.
//
// Uploads through the `avatar` target, whose signature any signed-in member can
// obtain — a viewer has no `media:upload` and still needs a face.
export default function AvatarField({ user, value, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url, publicId } = await uploadToCloudinary(file, {
        target: "avatar",
      });
      onChange({ url, publicId });
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
      // Cleared so re-picking the same file still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <UserAvatar user={{ ...user, avatar: value }} size="lg" />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <Loader2 size={18} className="animate-spin text-[#37469E]" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#37469E] px-3 py-2 text-sm font-semibold text-[#37469E] hover:bg-[#EEF0FA] disabled:opacity-60"
          >
            <Upload size={14} />
            {value?.url ? "Replace" : "Upload photo"}
          </button>
          {value?.url && (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={() => onChange({ url: "", publicId: "" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:text-rose-600 disabled:opacity-60"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG or WebP, up to 10 MB. Square images look best.
        </p>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="hidden"
      />
    </div>
  );
}
