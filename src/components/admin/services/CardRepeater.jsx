"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import CloudinaryImageField from "@/components/admin/blog/CloudinaryImageField";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import IconField from "./IconField";
import LinkField from "./LinkField";

// Cards are edited inline, expanding in place, rather than in their own modal.
// A modal over a modal traps focus twice and gives the author no way to see the
// section they are editing while they work on one of its cards.
//
// Nothing here talks to the API. The whole array is handed back to the section
// form and committed by its single Save, which is what keeps a card edit and the
// heading change beside it in one atomic write.

const blankCard = () => ({
  // A client-only key so a brand-new row has something stable to render by
  // before the server has given it a real subdocument id.
  _key: `new-${Math.random().toString(36).slice(2)}`,
  title: "",
  eyebrow: "",
  tagline: "",
  description: "",
  icon: { kind: "lucide", name: "Sparkles", alt: "" },
  image: {},
  link: { label: "", href: "" },
  status: "active",
});

function CardSummaryIcon({ card }) {
  const Glyph =
    card.icon?.kind === "lucide" && card.icon?.name
      ? ICON_REGISTRY[card.icon.name] || null
      : null;

  if (card.image?.url) {
    return (
      // Plain <img>: arbitrary user URL in a non-indexed admin preview.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.image.url}
        alt=""
        className="h-8 w-8 shrink-0 rounded object-cover"
      />
    );
  }

  if (Glyph) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#EEF0FA] text-[#37469E]">
        <Glyph size={16} />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
      <ImageIcon size={14} />
    </span>
  );
}

export default function CardRepeater({ cards, onChange, showImage = true }) {
  const [openKey, setOpenKey] = useState(null);

  const keyOf = (card, index) => card.id || card._key || `i${index}`;

  const patchCard = (index, fields) =>
    onChange(cards.map((c, i) => (i === index ? { ...c, ...fields } : c)));

  const add = () => {
    const card = blankCard();
    onChange([...cards, card]);
    setOpenKey(card._key);
  };

  const remove = (index) => {
    if (!confirm(`Remove "${cards[index].title || "this card"}"?`)) return;
    onChange(cards.filter((_, i) => i !== index));
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Cards ({cards.length})
        </span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-[#37469E] hover:bg-gray-50"
        >
          <Plus size={14} /> Add card
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          No cards yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {cards.map((card, index) => {
            const key = keyOf(card, index);
            const open = openKey === key;
            const hidden = card.status === "inactive";

            return (
              <li
                key={key}
                className={`overflow-hidden rounded-xl border ${
                  open ? "border-[#37469E]" : "border-gray-200"
                } bg-white`}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {open ? (
                      <ChevronDown size={15} className="shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight size={15} className="shrink-0 text-gray-400" />
                    )}
                    <CardSummaryIcon card={card} />
                    <span
                      className={`truncate text-sm font-medium ${
                        hidden ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {card.title || "Untitled card"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      patchCard(index, {
                        status: hidden ? "active" : "inactive",
                      })
                    }
                    title={hidden ? "Show on the page" : "Hide from the page"}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
                  >
                    {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>

                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                      className="rounded p-0.5 text-gray-300 hover:text-[#37469E] disabled:opacity-30"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === cards.length - 1}
                      title="Move down"
                      className="rounded p-0.5 text-gray-300 hover:text-[#37469E] disabled:opacity-30"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    title="Remove card"
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {open && (
                  <div className="space-y-4 border-t border-gray-100 bg-gray-50/60 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">
                          Title
                        </span>
                        <input
                          type="text"
                          value={card.title || ""}
                          onChange={(e) =>
                            patchCard(index, { title: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">
                          Eyebrow
                        </span>
                        <input
                          type="text"
                          value={card.eyebrow || ""}
                          onChange={(e) =>
                            patchCard(index, { eyebrow: e.target.value })
                          }
                          placeholder="Small label above the title"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">
                        Tagline
                      </span>
                      <input
                        type="text"
                        value={card.tagline || ""}
                        onChange={(e) =>
                          patchCard(index, { tagline: e.target.value })
                        }
                        placeholder="Optional — e.g. UAE E-Invoicing"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">
                        Description
                      </span>
                      <textarea
                        rows={3}
                        value={card.description || ""}
                        onChange={(e) =>
                          patchCard(index, { description: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>

                    <IconField
                      value={card.icon}
                      onChange={(icon) => patchCard(index, { icon })}
                    />

                    {showImage && (
                      <CloudinaryImageField
                        label="Card image"
                        hint="Shown at the top of the card. Leave empty to fall back to the icon."
                        value={card.image}
                        onChange={(image) => patchCard(index, { image })}
                      />
                    )}

                    <LinkField
                      label="Card link"
                      value={card.link}
                      onChange={(link) => patchCard(index, { link })}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
