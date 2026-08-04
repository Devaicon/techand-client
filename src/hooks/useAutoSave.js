"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// How long the editor waits after the last change before saving. Long enough
// that typing a word is one request rather than eight, short enough that the
// live preview beside the form still feels like it is keeping up.
export const AUTOSAVE_DELAY_MS = 1200;

// Two values are "the same" if they serialise the same. Page settings and block
// props are plain JSON — the exact shape that goes over the wire — so this is
// the same question the server would ask.
const snapshot = (value) => JSON.stringify(value ?? null);

/**
 * Debounced auto-save for a form whose value lives in React state.
 *
 * The blog editor polls on a timer instead, because its article body is
 * deliberately kept out of React state and there is no state change to debounce
 * on. Everything auto-saved here — page settings, block props — is ordinary
 * state, so the change itself is the signal, and a debounce is both simpler and
 * quieter: one request when the author stops, rather than one every 2.5s
 * mid-word.
 *
 * @param value     The form's current value. Compared by serialisation.
 * @param save      `async (value) => acceptedValue | undefined`. Must throw on
 *                  failure. Anything it returns becomes the new baseline, for
 *                  when the server normalises what it was sent.
 * @param onError   Called with the thrown error. The caller owns how a failure
 *                  is shown — a toast and an inline message are each right in a
 *                  different place.
 * @param enabled   The auto-save toggle. `flush()` still works while off.
 * @param canSave   Optional `(value) => boolean` gate. A save that would 400 on
 *                  a half-typed field stays quiet rather than flashing an error
 *                  the author did not ask for.
 * @param recordKey Identifies WHICH record is being edited. Changing it adopts
 *                  the new record's value as the baseline — and flushes
 *                  whatever the old one still had pending.
 *
 * @returns `{ status, flush, markSaved }`, where status is
 *          "idle" | "dirty" | "saving" | "saved" | "error".
 */
export default function useAutoSave({
  value,
  save,
  onError,
  enabled = true,
  canSave,
  recordKey = null,
  delay = AUTOSAVE_DELAY_MS,
}) {
  const [status, setStatus] = useState("idle");

  const current = snapshot(value);

  // The timer's inputs live in refs. The timer is created in an effect keyed on
  // the serialised value and fires `delay` ms later; reading `value` or `save`
  // out of that effect's closure would send whatever they were when the author
  // stopped typing, one render ago.
  const valueRef = useRef(value);
  valueRef.current = value;
  const saveRef = useRef(save);
  saveRef.current = save;
  const canSaveRef = useRef(canSave);
  canSaveRef.current = canSave;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // The last value the server accepted. Anything else is unsaved.
  const savedRef = useRef(current);
  const savedOnceRef = useRef(false);
  const savingRef = useRef(false);

  // The value whose save failed. Without it, a server that keeps rejecting the
  // same input would be asked again every `delay` ms for as long as the editor
  // stays open. It is cleared the moment the author edits — both a new value
  // worth trying and the moment they are actually looking at the screen.
  const failedRef = useRef(null);

  // Everything as of the last COMMITTED render. Read only from the effect
  // cleanup below, where the current render's scope already describes the
  // record being switched to rather than the one being left.
  const lastRef = useRef(null);

  const run = useCallback(async () => {
    if (savingRef.current) return;

    // Read before the await, and baseline on this rather than on whatever is
    // current when the response lands: an edit made while the request was in
    // flight has to leave the form dirty so that it saves again.
    const pending = valueRef.current;
    const sent = snapshot(pending);

    if (sent === savedRef.current) return;
    if (canSaveRef.current && !canSaveRef.current(pending)) return;

    savingRef.current = true;
    setStatus("saving");
    try {
      const accepted = await saveRef.current(pending);
      savedRef.current = accepted === undefined ? sent : snapshot(accepted);
      savedOnceRef.current = true;
      failedRef.current = null;
      setStatus(
        snapshot(valueRef.current) === savedRef.current ? "saved" : "dirty",
      );
    } catch (err) {
      failedRef.current = sent;
      setStatus("error");
      onErrorRef.current?.(err);
    } finally {
      savingRef.current = false;
    }
  }, []);

  // Adopt a new record's value as the baseline, and flush the old one's pending
  // edit on the way out.
  //
  // Declared first on purpose. React runs every effect cleanup in a commit
  // before it runs any effect body, so this rebaseline lands before the
  // debounce below can look at the new value — otherwise merely opening a
  // record would read as an unsaved change and save it straight back.
  useEffect(() => {
    savedRef.current = snapshot(valueRef.current);
    savedOnceRef.current = false;
    failedRef.current = null;
    setStatus("idle");

    return () => {
      // `lastRef` was written after the previous commit, so here — before any
      // effect body of the switching render — it is the only remaining handle
      // on what the author was typing into the record being left.
      const last = lastRef.current;
      if (!last?.enabled) return;
      if (snapshot(last.value) === savedRef.current) return;
      if (last.canSave && !last.canSave(last.value)) return;

      // Fire and forget: the form has already moved on, so there is no status
      // left to report into. The error still goes to the caller, whose toast
      // stack outlives the field that caused it.
      Promise.resolve(last.save(last.value)).catch((err) =>
        onErrorRef.current?.(err),
      );
    };
  }, [recordKey]);

  useEffect(() => {
    lastRef.current = { value, save, enabled, canSave };
  });

  // Track dirtiness as the value moves — including back to what was saved, since
  // an author who undoes their own edit by hand has nothing left to send.
  useEffect(() => {
    if (current !== failedRef.current) failedRef.current = null;
    if (savingRef.current) return;
    if (current !== savedRef.current) setStatus("dirty");
    else setStatus(savedOnceRef.current ? "saved" : "idle");
  }, [current]);

  // The debounce itself.
  useEffect(() => {
    if (!enabled || savingRef.current) return;
    if (current === savedRef.current || current === failedRef.current) return;

    const timer = setTimeout(run, delay);
    return () => clearTimeout(timer);
    // `status` is a dependency so that a save which lands with the form still
    // dirty — the author kept typing through the request — schedules its own
    // follow-up. Nothing else would: the value has not changed since the timer
    // that fired.
  }, [current, status, enabled, delay, run]);

  // Save now, debounce or no debounce, toggle on or off: the explicit Save
  // button, and any other moment the author expects the wait to be over.
  const flush = useCallback(() => run(), [run]);

  // Adopt a value saved by some other path — the settings button, which sends a
  // slug that auto-save leaves alone on a live page. Without it the difference
  // reads as unsaved and gets sent straight back on the next tick.
  const markSaved = useCallback((next) => {
    savedRef.current = snapshot(next);
    savedOnceRef.current = true;
    failedRef.current = null;
    setStatus("saved");
  }, []);

  return { status, flush, markSaved };
}
