"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import ImageAltDialog from "./ImageAltDialog";
import "quill/dist/quill.snow.css";

// A thin wrapper over Quill 2 rather than react-quill, which is unmaintained
// and calls findDOMNode — removed in React 19.
//
// Quill is imperative and owns its DOM subtree, so this component deliberately
// does NOT re-render on every keystroke. It mounts Quill once, pushes the
// initial Delta in, and reports changes upward. React never re-renders the
// editor body, which is what keeps the caret from jumping.

const TOOLBAR = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

// Ctrl+Alt+<n> heading shortcuts (Cmd+Alt on a Mac, which is where that
// combination is conventional).
//
// The numbers are not heading levels — they are the levels this pipeline
// actually has. An article body starts at h2: h1 is the post title in the hero,
// and the server sanitizer drops h5/h6 entirely, so the toolbar offers 2/3/4 and
// nothing else. "1" is therefore an alias for the top level available rather
// than a dead key, and "5" is the way back to body text.
const HEADING_SHORTCUTS = { 1: 2, 2: 2, 3: 3, 4: 4, 5: false };

// Each digit is registered twice. `event.key` covers the normal case; the legacy
// `which` code covers layouts where Ctrl+Alt is AltGr and the event reports the
// character it would have typed ("@", "²", …) instead of the digit.
const DIGIT_WHICH = { 1: 49, 2: 50, 3: 51, 4: 52, 5: 53 };

function headingBindings() {
  return Object.fromEntries(
    Object.entries(HEADING_SHORTCUTS).map(([digit, level]) => [
      `techand-header-${digit}`,
      {
        key: [digit, DIGIT_WHICH[digit]],
        // Maps to ctrlKey on Windows/Linux and metaKey on macOS.
        shortKey: true,
        altKey: true,
        handler() {
          // Pressing the level a line already has takes it back to body text,
          // the same toggle the toolbar's header picker performs.
          const current = this.quill.getFormat().header;
          this.quill.format("header", current === level ? false : level, "user");
          // Falsy tells Quill to preventDefault, so the browser never sees the
          // combination.
          return false;
        },
      },
    ]),
  );
}

// Registers the custom blots exactly once per page load. Quill's registry is
// global, so re-registering on every mount logs an override warning.
let blotsRegistered = false;

function registerBlots(Quill) {
  if (blotsRegistered) return;
  registerCtaBlot(Quill);
  registerImageBlot(Quill);
  blotsRegistered = true;
}

// Quill's stock Image blot drops any attribute set to a falsy value, which makes
// `alt=""` impossible to express — it becomes no alt attribute at all. Those two
// states mean different things to a screen reader: an empty alt says "decorative,
// skip this", while a missing one makes it announce the image URL. This subclass
// keeps the empty string.
function registerImageBlot(Quill) {
  const Image = Quill.import("formats/image");

  class AltableImage extends Image {
    format(name, value) {
      if (name === "alt" && value === "") {
        this.domNode.setAttribute("alt", "");
        return;
      }
      super.format(name, value);
    }
  }

  // `true` suppresses the "overwriting modules/formats" console warning — the
  // override is the entire point here.
  Quill.register(AltableImage, true);
}

function registerCtaBlot(Quill) {
  const BlockEmbed = Quill.import("blots/block/embed");

  // The node is deliberately EMPTY. Its in-editor appearance comes entirely
  // from a CSS ::after rule keyed off the data attribute — any text placed
  // inside would survive into the saved HTML and appear in the published
  // article.
  class CtaSlotBlot extends BlockEmbed {
    static create(value) {
      const node = super.create();
      node.setAttribute("data-cta-slot", value?.key ?? "");
      node.setAttribute("contenteditable", "false");
      return node;
    }

    static value(node) {
      return { key: node.getAttribute("data-cta-slot") };
    }
  }

  CtaSlotBlot.blotName = "ctaSlot";
  CtaSlotBlot.tagName = "div";

  Quill.register(CtaSlotBlot);
}

export default function QuillEditor({
  initialDelta,
  onChange,
  onReady,
  placeholder = "Write the article…",
}) {
  const hostRef = useRef(null);
  const quillRef = useRef(null);
  // Held in a ref so the Quill callbacks always see the current handler
  // without needing to be torn down and rebound on every parent render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");
  // The image whose alt text is being edited: { index, src, alt }, where `alt`
  // is null for an image that carries no alt attribute yet. Null = closed.
  const [altTarget, setAltTarget] = useState(null);
  // How many body images still have no alt attribute, surfaced under the editor
  // so an author is told rather than having to remember.
  const [missingAlt, setMissingAlt] = useState(0);
  // Zen mode: the editor takes over the viewport. Only the wrapper's classes
  // change, so Quill's own DOM subtree is never unmounted and the caret,
  // selection and undo stack all survive the toggle.
  const [zen, setZen] = useState(false);

  // The page behind a full-viewport panel must not scroll underneath it.
  useEffect(() => {
    if (!zen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [zen]);

  // A panel with no page chrome around it needs a way out that isn't the button.
  // Bound only while the alt-text dialog is closed: Escape is that dialog's
  // cancel key, and one press should not dismiss both it and the editor around
  // it.
  useEffect(() => {
    if (!zen || altTarget) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setZen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zen, altTarget]);

  useEffect(() => {
    let cancelled = false;

    // Dynamic import: Quill touches `document` at module scope, so it cannot be
    // evaluated during SSR.
    import("quill").then(({ default: Quill }) => {
      if (cancelled || !hostRef.current || quillRef.current) return;

      registerBlots(Quill);

      const quill = new Quill(hostRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          // Merged into Quill's stock bindings rather than replacing them —
          // expandConfig deep-merges module options over Keyboard.DEFAULTS.
          keyboard: { bindings: headingBindings() },
          toolbar: {
            container: TOOLBAR,
            handlers: {
              // Replace the default handler, which base64-inlines the file
              // straight into the Delta — that would push multi-megabyte data
              // URIs into Mongo and the sanitizer would strip them anyway.
              image() {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  setUploadError("");
                  try {
                    const { url } = await uploadToCloudinary(file);
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", url, "user");
                    quill.setSelection(range.index + 1, 0, "user");
                    // Ask for the description while the author still has the
                    // picture in mind. Dismissing the dialog leaves the image
                    // in place with no alt, which the counter below then flags.
                    //
                    // getLeaf(range.index), not range.index + 1: a lookup lands
                    // on the blot that STARTS at the index, so +1 would return
                    // whatever follows the image — nothing at all when it is the
                    // last thing in its paragraph.
                    openAltDialog(quill.getLeaf(range.index)[0]?.domNode);
                  } catch (err) {
                    setUploadError(err.message || "Image upload failed.");
                  }
                };
                input.click();
              },
            },
          },
        },
      });

      const countMissingAlt = () =>
        setMissingAlt(quill.root.querySelectorAll("img:not([alt])").length);

      // Turns an <img> node in the editor into the dialog's payload. Quill.find
      // maps the node back to its blot, which is the only way to learn the
      // document index that formatting the alt has to be applied at.
      function openAltDialog(node) {
        if (!node || node.tagName !== "IMG") return;
        const blot = Quill.find(node);
        if (!blot) return;
        setAltTarget({
          index: quill.getIndex(blot),
          src: node.getAttribute("src") || "",
          // null and "" are distinct: no alt attribute at all vs. one
          // deliberately left empty to mark the image decorative.
          alt: node.hasAttribute("alt") ? node.getAttribute("alt") : null,
        });
      }

      // Clicking an image reopens its description. Bound on the editor root
      // rather than per-image so it keeps working for images that arrive later,
      // whether typed, pasted, or restored from a saved Delta.
      quill.root.addEventListener("click", (e) => {
        if (e.target instanceof HTMLImageElement) openAltDialog(e.target);
      });

      if (initialDelta && initialDelta.ops) {
        quill.setContents(initialDelta, "silent");
      }

      quill.on("text-change", () => {
        countMissingAlt();
        onChangeRef.current?.({
          delta: quill.getContents(),
          html: quill.root.innerHTML,
        });
      });

      // setContents above ran silently, so seed the count for a post that was
      // opened rather than typed.
      countMissingAlt();

      quillRef.current = quill;
      setLoading(false);
      onReady?.({
        // Lets the CTA panel drop a marker at the caret without reaching into
        // Quill internals from outside this file.
        insertCtaSlot(key) {
          const range = quill.getSelection(true) || { index: quill.getLength() };
          quill.insertEmbed(range.index, "ctaSlot", { key }, "user");
          quill.setSelection(range.index + 1, 0, "user");
        },
        getHtml: () => quill.root.innerHTML,
        getDelta: () => quill.getContents(),
      });
    });

    return () => {
      cancelled = true;
    };
    // Mount-only: `initialDelta` is the seed value, and re-seeding a live
    // editor would discard whatever the user has typed since.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Writes the description onto the image the dialog was opened for. An empty
  // string is a real value here — it marks the image decorative — so it is
  // passed through rather than treated as "no change".
  const saveAlt = (value) => {
    const quill = quillRef.current;
    if (quill && altTarget) {
      quill.formatText(altTarget.index, 1, "alt", value, "user");
    }
    setAltTarget(null);
  };

  const toggleZen = () => {
    setZen((v) => !v);
    // Keep the caret where it was — clicking the button moves focus to it, and
    // an editor that has taken over the screen should be ready to type in.
    requestAnimationFrame(() => quillRef.current?.focus());
  };

  return (
    // z-40, not z-50: the alt-text dialog and the mobile nav drawer both sit at
    // z-50 and have to stay reachable from inside zen mode.
    <div
      className={
        zen
          ? "fixed inset-0 z-40 flex flex-col bg-white"
          : "relative rounded-xl border border-gray-200 bg-white"
      }
    >
      {loading && (
        <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading editor…
        </div>
      )}

      {/* Sits over the sticky toolbar, which reserves room for it on the right
          (see .blog-editor .ql-toolbar in globals.css). */}
      {!loading && (
        <button
          type="button"
          onClick={toggleZen}
          aria-pressed={zen}
          aria-label={zen ? "Exit full screen" : "Edit full screen"}
          title={zen ? "Exit full screen (Esc)" : "Edit full screen"}
          className="absolute right-1.5 top-1.5 z-20 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          {zen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      )}

      <div
        className={
          loading ? "hidden" : `blog-editor${zen ? " blog-editor--zen" : ""}`
        }
      >
        <div ref={hostRef} />
      </div>
      {uploadError && (
        <p className="border-t border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          {uploadError}
        </p>
      )}
      {!loading && missingAlt > 0 && (
        <p className="flex items-center gap-1.5 border-t border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={15} className="shrink-0" />
          {missingAlt} {missingAlt === 1 ? "image has" : "images have"} no alt
          text. Click {missingAlt === 1 ? "it" : "each one"} to describe it.
        </p>
      )}

      {/* A keyboard shortcut nobody is told about is a shortcut nobody uses. */}
      {!loading && (
        <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
          <kbd className="font-sans font-medium text-gray-500">Ctrl</kbd>+
          <kbd className="font-sans font-medium text-gray-500">Alt</kbd>+
          <kbd className="font-sans font-medium text-gray-500">1</kbd>–
          <kbd className="font-sans font-medium text-gray-500">4</kbd> sets a
          heading,{" "}
          <kbd className="font-sans font-medium text-gray-500">5</kbd> returns to
          body text.
          {zen && " Esc leaves full screen."}
        </p>
      )}

      {/* Keyed and mounted per image so it seeds itself from that image's
          current alt rather than carrying the previous one's text over. */}
      {altTarget && (
        <ImageAltDialog
          key={`${altTarget.index}:${altTarget.src}`}
          src={altTarget.src}
          initialAlt={altTarget.alt}
          onSave={saveAlt}
          onCancel={() => setAltTarget(null)}
        />
      )}
    </div>
  );
}
