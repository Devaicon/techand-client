"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import CloudinaryImageField from "@/components/admin/blog/CloudinaryImageField";
import CardRepeater from "./CardRepeater";
import LinkField from "./LinkField";

export const SECTION_TYPES = [
  {
    value: "platform",
    label: "Platform block",
    blurb:
      "Heading, blurb and brand logo on one side; a stack of small cards on the other.",
  },
  {
    value: "collection",
    label: "Card collection",
    blurb:
      "A heading and a set of cards, shown as a grid, a scrolling rail or a coloured panel.",
  },
  {
    value: "cta",
    label: "CTA band",
    blurb: "A closing call to action with up to two buttons.",
  },
];

const LAYOUTS = [
  { value: "grid", label: "Grid", blurb: "Wraps and centres. Best for 3–6 cards." },
  { value: "rail", label: "Rail", blurb: "Scrolls sideways. Best for 5+ cards." },
  { value: "panel", label: "Panel", blurb: "Boxed on brand blue. Best for 3 cards." },
];

const blank = {
  heading: "",
  subtitle: "",
  body: "",
  link: { label: "", href: "" },
  secondaryLink: { label: "", href: "" },
  media: {},
  align: "left",
  layout: "grid",
  cards: [],
  status: "active",
};

// Create/edit form for one section, in a modal over the list. Writes are
// explicit rather than autosaved, matching BlogEditor — a half-typed heading
// should never reach a published page.
//
// The section's cards are edited here and saved with it in one request. That is
// what makes a card edit and the heading change beside it a single atomic write
// instead of two that can half-fail.
export default function SectionEditor({ section, type, onSave, onClose }) {
  // `section` is null when creating. Spread over `blank` so a document saved
  // before a field existed still populates the form.
  const [form, setForm] = useState(() => ({ ...blank, ...(section || {}) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Type is fixed at creation, so it comes from the section being edited or from
  // the palette choice that opened this form — never from a field in it.
  const sectionType = section?.type || type;
  const meta = SECTION_TYPES.find((t) => t.value === sectionType);

  const set = (fields) => setForm((f) => ({ ...f, ...fields }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.heading.trim()) {
      setError("Give the section a heading.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = {
        heading: form.heading,
        subtitle: form.subtitle,
        link: form.link,
        status: form.status,
        // `_key` is a client-only React key for rows the server has never seen.
        // Mongoose would ignore it, but sending it puts a field on the wire that
        // means nothing to the API.
        cards: form.cards.map(({ _key, ...card }) => card),
      };

      if (sectionType === "platform") {
        body.body = form.body;
        body.media = form.media;
        body.align = form.align;
      }
      if (sectionType === "collection") {
        body.layout = form.layout;
      }
      if (sectionType === "cta") {
        body.secondaryLink = form.secondaryLink;
        body.cards = [];
      }

      await onSave(body, sectionType);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save the section.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {section ? "Edit section" : `New ${meta?.label.toLowerCase()}`}
            </h2>
            {meta && <p className="text-xs text-gray-500">{meta.blurb}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Heading
            </span>
            <input
              type="text"
              value={form.heading}
              onChange={(e) => set({ heading: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>

          {sectionType === "platform" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Body
              </span>
              <textarea
                rows={3}
                value={form.body}
                onChange={(e) => set({ body: e.target.value })}
                placeholder="The paragraph under the heading."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Subtitle
              </span>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => set({ subtitle: e.target.value })}
                placeholder="One supporting line under the heading."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          )}

          {sectionType === "collection" && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">
                Layout
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {LAYOUTS.map((l) => (
                  <label
                    key={l.value}
                    className={`cursor-pointer rounded-xl border p-3 text-left ${
                      form.layout === l.value
                        ? "border-[#37469E] bg-[#EEF0FA]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="layout"
                        checked={form.layout === l.value}
                        onChange={() => set({ layout: l.value })}
                        className="accent-[#37469E]"
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {l.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {l.blurb}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {sectionType === "platform" && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700">
                  Copy sits on
                </legend>
                <div className="flex gap-4">
                  {[
                    ["left", "Left"],
                    ["right", "Right"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="align"
                        checked={form.align === value}
                        onChange={() => set({ align: value })}
                        className="accent-[#37469E]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Alternate this between consecutive blocks so they mirror each
                  other.
                </p>
              </fieldset>

              <CloudinaryImageField
                label="Brand lockup"
                hint="The product logo shown under the copy. Optional."
                value={form.media}
                onChange={(media) => set({ media })}
                showCrop={false}
              />
            </>
          )}

          <LinkField
            label={sectionType === "cta" ? "Primary button" : "Section link"}
            value={form.link}
            onChange={(link) => set({ link })}
          />

          {sectionType === "cta" && (
            <LinkField
              label="Secondary button"
              hint="Optional — leave both fields empty for a single-button band."
              value={form.secondaryLink}
              onChange={(secondaryLink) => set({ secondaryLink })}
            />
          )}

          {sectionType !== "cta" && (
            <CardRepeater
              cards={form.cards}
              onChange={(cards) => set({ cards })}
              // Platform sub-cards are icon rows in the reference — they have no
              // room for a photograph, so the field is not offered.
              showImage={sectionType !== "platform"}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Save section
          </button>
        </div>
      </form>
    </div>
  );
}
