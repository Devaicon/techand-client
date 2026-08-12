"use client";

// A member's face, or their initials when they have not set one.
//
// Initials rather than a generic silhouette: in a list of ten people a row of
// identical placeholder icons carries no information, whereas "AH" still tells
// you which row is Ali Hassan.

// Derived from the admin-set name where there is one, since that is the value
// the rest of the team recognises; the username is the fallback.
export const initialsOf = (user) => {
  const source = (user?.name || user?.username || "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// The name to show for a member anywhere in the panel. The admin-set `name`
// wins; `username` is what exists before an admin has filled one in.
export const displayName = (user) => user?.name || user?.username || "";

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-20 w-20 text-xl",
};

export default function UserAvatar({ user, size = "md", className = "" }) {
  const url = user?.avatar?.url;
  const label = displayName(user);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF0FA] font-semibold text-[#37469E] ${SIZES[size] || SIZES.md} ${className}`}
      title={label}
    >
      {url ? (
        // Plain <img>: the URL is arbitrary user input on a non-indexed admin
        // screen, so next/image adds a remotePatterns constraint for no gain.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initialsOf(user)}</span>
      )}
    </span>
  );
}
