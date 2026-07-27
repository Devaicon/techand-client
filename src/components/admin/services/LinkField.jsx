"use client";

// A label/destination pair. The server rejects one without the other, because a
// button with no destination goes nowhere and a destination with no label has
// nothing to click — so the hint says so before the author hits Save.
export default function LinkField({ label, value, onChange, hint }) {
  const link = value || {};
  const halfFilled = Boolean(link.label) !== Boolean(link.href);

  const patch = (fields) => onChange({ ...link, ...fields });

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={link.label || ""}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder="Button text — e.g. Learn more"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={link.href || ""}
          onChange={(e) => patch({ href: e.target.value })}
          placeholder="/contact-us or https://…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      {halfFilled && (
        <p className="mt-1.5 text-xs text-amber-700">
          Fill in both fields, or clear both to hide this link.
        </p>
      )}
    </div>
  );
}
