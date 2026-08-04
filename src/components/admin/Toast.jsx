"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

/**
 * Transient messages for the admin panel.
 *
 * One provider near the root owns the stack; any component calls `useToast()`
 * and gets `success` / `error` / `warning` / `info` / `promise`. The same shape
 * as `useContextMenu` for the same reason: the alternative is a `notice` and an
 * `error` string threaded through every page's state, re-rendered into a banner
 * that pushes the layout down when it appears.
 *
 *   const toast = useToast();
 *   toast.success("Block saved.");
 *   toast.error(err.response?.data?.message || "Failed to save.");
 *   toast.warning("Add a visible block before publishing.", { duration: 0 });
 *
 * `duration: 0` pins a toast until it is dismissed. Errors default to that:
 * a failure that vanishes before it is read is a failure nobody knows about,
 * whereas a confirmation nobody reads has already done its job.
 */

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    ring: "border-emerald-200",
    accent: "bg-emerald-500",
    glyph: "text-emerald-600",
    duration: 3500,
  },
  error: {
    icon: XCircle,
    ring: "border-rose-200",
    accent: "bg-rose-500",
    glyph: "text-rose-600",
    // Sticky. See the note above.
    duration: 0,
  },
  warning: {
    icon: AlertTriangle,
    ring: "border-amber-200",
    accent: "bg-amber-500",
    glyph: "text-amber-600",
    duration: 6000,
  },
  info: {
    icon: Info,
    ring: "border-gray-200",
    accent: "bg-[#37469E]",
    glyph: "text-[#37469E]",
    duration: 4000,
  },
  loading: {
    icon: Loader2,
    ring: "border-gray-200",
    accent: "bg-gray-400",
    glyph: "text-gray-500",
    duration: 0,
  },
};

let seq = 0;

function ToastRow({ toast, onDismiss }) {
  const variant = VARIANTS[toast.variant] || VARIANTS.info;
  const Glyph = variant.icon;

  const [paused, setPaused] = useState(false);
  // Time is tracked rather than the timer restarted on hover, so a toast the
  // author brushed past at 3.4 of 3.5 seconds does not get a full new life.
  // Both refs are seeded inside the effect — `Date.now()` in an initialiser is
  // a side effect during render.
  const remaining = useRef(variant.duration);
  const since = useRef(0);

  useEffect(() => {
    if (!variant.duration || paused) return undefined;
    since.current = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - since.current;
    };
  }, [paused, variant.duration, toast.id, onDismiss]);

  return (
    <li
      // `alert` interrupts a screen reader; `status` waits for a pause. A
      // failure is worth interrupting for, a confirmation is not.
      role={toast.variant === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto flex w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-white shadow-lg ${variant.ring} animate-[toast-in_160ms_ease-out]`}
    >
      <span aria-hidden="true" className={`w-1 shrink-0 ${variant.accent}`} />

      <div className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-2.5">
        <Glyph
          size={16}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${variant.glyph} ${
            toast.variant === "loading" ? "animate-spin" : ""
          }`}
        />

        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          )}
          <p
            className={`break-words text-sm ${
              toast.title ? "mt-0.5 text-gray-600" : "text-gray-800"
            }`}
          >
            {toast.message}
          </p>

          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.onSelect();
                onDismiss(toast.id);
              }}
              className="mt-1.5 text-xs font-semibold text-[#37469E] hover:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
          className="-mr-1 shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={13} />
        </button>
      </div>
    </li>
  );
}

export function ToastProvider({ children }) {
  // Portalled to `document.body` so a toast is never clipped by an admin page's
  // own scroll container or stacking context.
  //
  // No `mounted` flag is needed to keep the portal off the server render: the
  // list is empty until something calls into this API, and nothing does that
  // during SSR. `createPortal` is unreachable there by construction rather than
  // by a guard — the same argument `ContextMenuProvider` makes.
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, message, options = {}) => {
    const id = `toast-${(seq += 1)}`;
    setToasts((list) => {
      const next = [...list, { id, variant, message, ...options }];
      // A queue that grows without limit is a wall the author cannot see past.
      // The oldest go first: the newest message is the one about what they just
      // did.
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
    return id;
  }, []);

  const api = useMemo(() => {
    const of = (variant) => (message, options) => push(variant, message, options);

    return {
      success: of("success"),
      error: of("error"),
      warning: of("warning"),
      info: of("info"),
      dismiss,
      /**
       * Ties one toast to a promise: a spinner while it runs, then the
       * success or the failure in its place. Saves every call site writing the
       * same try/catch around a pair of toasts.
       */
      promise: async (work, { loading, success, error }) => {
        const id = push("loading", loading);
        try {
          const result = await work;
          dismiss(id);
          if (success) push("success", success);
          return result;
        } catch (err) {
          dismiss(id);
          push(
            "error",
            typeof error === "function"
              ? error(err)
              : error || err?.message || "Something went wrong.",
          );
          throw err;
        }
      },
    };
  }, [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <>
            <style>{`
              @keyframes toast-in {
                from { opacity: 0; transform: translateY(6px) scale(0.98); }
                to   { opacity: 1; transform: none; }
              }
            `}</style>
            <ul
              aria-live="polite"
              aria-label="Notifications"
              className="pointer-events-none fixed bottom-4 right-4 z-[110] flex flex-col gap-2"
            >
              {toasts.map((toast) => (
                <ToastRow key={toast.id} toast={toast} onDismiss={dismiss} />
              ))}
            </ul>
          </>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
