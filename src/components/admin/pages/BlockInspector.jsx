"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import AutoSaveStatus from "../AutoSaveStatus";
import useAutoSave from "@/hooks/useAutoSave";
import ControlField from "./controls/ControlField";

/**
 * The block editor, as a right-hand drawer.
 *
 * A drawer rather than the centred modal it started as: with the live preview
 * beside it, an author needs to see the block change as they type a heading. A
 * modal covers exactly the thing they are editing.
 *
 * Every field it renders comes from the server's descriptor list, so there is no
 * per-block form to write — which is the whole reason the registry exists, and
 * why Cycle 3's fifteen blocks needed no work here.
 *
 * Editing an existing block auto-saves, which is what makes the preview beside
 * the drawer worth having: the point of typing a heading against the live page
 * is watching it land there. Adding a block does not. Creation is a deliberate
 * act, and a half-filled block should not appear on a live page while its fields
 * are still being typed — so the Add drawer keeps its button.
 */

// A new block starts from the registry's defaults; an existing one from what is
// stored, with defaults filling any field added to the block since.
const seedProps = (definition, section) => ({
  ...definition.defaults,
  ...(section?.props || {}),
});

export default function BlockInspector({
  definition,
  section,
  autoSave = false,
  onSave,
  onClose,
}) {
  const [props, setProps] = useState(() => seedProps(definition, section));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // What the drawer is bound to. Selecting another block in the preview swaps
  // these props rather than remounting the drawer, so this is what tells the
  // form — and auto-save — that the record underneath them changed.
  const blockKey = section?.id || `new:${definition.type}`;
  const [seededFor, setSeededFor] = useState(blockKey);

  const auto = autoSave && Boolean(section);

  // Re-seed during render rather than in an effect.
  //
  // An effect would commit one render in which the drawer is bound to the new
  // block but still holds the previous one's fields — and auto-save, which runs
  // off exactly that pair, would read the difference as an edit and write the
  // old block's values over the new one. Adjusting here means that render never
  // exists: React throws it away and re-runs this function with seeded props.
  if (seededFor !== blockKey) {
    setSeededFor(blockKey);
    setProps(seedProps(definition, section));
    setError("");
  }

  // The one path to the server, shared by the Save button and the auto-save
  // timer. The section id is passed explicitly rather than read from `editing`
  // on the other side: an auto-save flushed on the way out of a block resolves
  // after the editor has already moved to the next one.
  const commit = async (next, { auto: isAuto = false } = {}) => {
    setError("");
    await onSave(next, { sectionId: section?.id || null, auto: isAuto });
  };

  const autoSaver = useAutoSave({
    value: props,
    recordKey: blockKey,
    enabled: auto,
    save: (next) => commit(next, { auto: true }),
    // The server's message is the useful one — it names the field and the rule
    // ("A link needs both a label and a destination").
    onError: (err) =>
      setError(err.response?.data?.message || "Failed to save this block."),
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();

    // On an existing block the button is a "don't wait for the timer" — routing
    // it through the hook keeps one notion of what has been saved, so pressing
    // it does not leave the status line claiming there is still work pending.
    if (auto) {
      autoSaver.flush();
      return;
    }

    setSaving(true);
    setError("");
    try {
      await commit(props);
      // Auto-save is off, so this went around the hook. Tell it what landed, or
      // switching the toggle back on would re-send fields already on the server.
      autoSaver.markSaved(props);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save this block.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-gray-900">
            {section ? "Edit" : "Add"} {definition.label.toLowerCase()}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-500">
            {definition.blurb}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </header>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        {error && (
          <p className="mx-5 mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {definition.fields.map((field) => (
            <ControlField
              key={field.name}
              field={field}
              value={props[field.name]}
              onChange={(next) =>
                setProps((current) => ({ ...current, [field.name]: next }))
              }
            />
          ))}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          {/* Empty when auto-save is off, so the buttons keep their place. */}
          <AutoSaveStatus status={auto ? autoSaver.status : undefined} />

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {/* "Cancel" would be a lie once edits are saving as they are made
                  — there is nothing left for it to undo. */}
              {auto ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={saving || autoSaver.status === "saving"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {section ? "Save block" : "Add block"}
            </button>
          </div>
        </footer>
      </form>
    </aside>
  );
}
