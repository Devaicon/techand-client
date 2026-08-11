// The four states an insight can hold, in one place.
//
// A blog's status is rendered as a badge in the list, in the editor header and
// in the approval queue. Keeping the label and the palette here is what stops
// the same post reading "PENDING" in one view and "IN REVIEW" in another — and
// it is the reason `draft` moved off amber: amber now means "someone is waiting
// on you", which a draft nobody has submitted is not.

export const BLOG_STATUS = {
  draft: {
    label: "Draft",
    badge: "bg-gray-100 text-gray-600",
  },
  pending_approval: {
    label: "In review",
    badge: "bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700",
  },
  published: {
    label: "Published",
    badge: "bg-emerald-50 text-emerald-700",
  },
};

// Unknown statuses fall back to draft rather than rendering an empty pill —
// a post saved before this flow existed still has to look like something.
export const statusMeta = (status) => BLOG_STATUS[status] || BLOG_STATUS.draft;

export const statusLabel = (status) => statusMeta(status).label;

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// "3 days ago" reads better than a date on a queue whose whole point is how
// long something has been waiting. Falls back to the absolute date past a
// week, where "23 days ago" stops being easier to parse than "14 Jul 2026".
export function timeAgo(iso) {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return `on ${formatDate(iso)}`;
}
