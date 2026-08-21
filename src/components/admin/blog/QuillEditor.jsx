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
  registerFigureBlot(Quill);
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

// A body image and its caption as ONE block.
//
// Quill's stock image is an INLINE embed, so it lives inside a paragraph — and
// a <figure> inside a <p> is not legal HTML, which leaves nowhere valid to hang
// a <figcaption>. Making the whole figure the blot solves that, and has the
// side benefit that the editor shows the caption exactly where the reader will
// see it instead of hiding it behind a dialog.
//
// contenteditable="false" for the same reason CtaSlotBlot sets it: everything
// inside is owned by the blot, so there is no place in here to type. The caption
// is edited through the dialog, which is also where the alt text is set.
//
// The AltableImage blot above stays registered: posts written before this
// existed have plain inline images in their saved Delta, and those must keep
// loading. An old image becomes a figure the moment someone gives it a caption.
function registerFigureBlot(Quill) {
  const BlockEmbed = Quill.import("blots/block/embed");

  class FigureBlot extends BlockEmbed {
    static create(value) {
      const node = super.create();
      node.setAttribute("contenteditable", "false");

      const img = document.createElement("img");
      img.setAttribute("src", value?.src || "");
      // A string — including "" — means the author has decided; null means the
      // image has no alt attribute yet, which is what the counter below looks
      // for. Setting alt="" unconditionally would hide that gap.
      if (typeof value?.alt === "string") img.setAttribute("alt", value.alt);
      node.appendChild(img);

      // No caption, no empty <figcaption> in the published markup.
      if (value?.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = value.caption;
        node.appendChild(caption);
      }

      return node;
    }

    static value(node) {
      const img = node.querySelector("img");
      return {
        src: img?.getAttribute("src") || "",
        alt: img?.hasAttribute("alt") ? img.getAttribute("alt") : null,
        caption: node.querySelector("figcaption")?.textContent || "",
      };
    }
  }

  FigureBlot.blotName = "figureImage";
  FigureBlot.tagName = "figure";

  Quill.register(FigureBlot);
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
  // Prefixes the uploaded file's name so a body image lands at a readable
  // Cloudinary path (…/my-post-slug-agent-dashboard_ab12cd.png) rather than the
  // random public id Cloudinary hands out by default. See uploadToCloudinary.
  filenamePrefix = "",
  placeholder = "Write the article…",
}) {
  const hostRef = useRef(null);
  const quillRef = useRef(null);
  // Held in a ref so the Quill callbacks always see the current handler
  // without needing to be torn down and rebound on every parent render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Same reason: the editor is mounted once, but the post's slug is typed after
  // that, so the upload handler has to read the current value rather than the
  // one that existed at mount.
  const filenamePrefixRef = useRef(filenamePrefix);
  filenamePrefixRef.current = filenamePrefix;

  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");
  // The image whose alt text and caption are being edited:
  // { index, src, alt, caption, isFigure }, where `alt` is null for an image
  // that carries no alt attribute yet and `isFigure` marks the newer
  // figure+figcaption blot apart from a legacy inline image. Null = closed.
  const [imageTarget, setImageTarget] = useState(null);
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
    if (!zen || imageTarget) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setZen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zen, imageTarget]);

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
                    const { url } = await uploadToCloudinary(file, {
                      filename: filenamePrefixRef.current
                        ? filenamePrefixRef.current + "-" + file.name
                        : file.name,
                    });
                    const range = quill.getSelection(true);
                    quill.insertEmbed(
                      range.index,
                      "figureImage",
                      { src: url, alt: null, caption: "" },
                      "user",
                    );
                    quill.setSelection(range.index + 1, 0, "user");
                    // Ask for the description and caption while the author
                    // still has the picture in mind. Dismissing the dialog
                    // leaves the image in place with no alt, which the counter
                    // below then flags.
                    //
                    // Found by src rather than by index: inserting a BLOCK
                    // embed mid-paragraph splits that paragraph, and the blot
                    // sitting at `range.index` afterwards is then the first
                    // half of the split, not the figure. Last match wins, so
                    // re-using a picture already in the article still opens the
                    // copy just inserted.
                    const figures = Array.from(
                      quill.root.querySelectorAll("figure"),
                    ).filter(
                      (f) => f.querySelector("img")?.getAttribute("src") === url,
                    );
                    openImageDialog(figures[figures.length - 1]);
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

      // Turns an image node in the editor into the dialog's payload. Quill.find
      // maps the node back to its blot, which is the only way to learn the
      // document index the edit has to be applied at. `true` makes it bubble:
      // a click lands on the <img> or the <figcaption>, but the blot that owns
      // them is the <figure> around them.
      function openImageDialog(node) {
        if (!node) return;
        const blot = Quill.find(node, true);
        const el = blot?.domNode;
        if (!el || (el.tagName !== "FIGURE" && el.tagName !== "IMG")) return;

        const isFigure = el.tagName === "FIGURE";
        const img = isFigure ? el.querySelector("img") : el;

        setImageTarget({
          index: quill.getIndex(blot),
          isFigure,
          src: img?.getAttribute("src") || "",
          // null and "" are distinct: no alt attribute at all vs. one
          // deliberately left empty to mark the image decorative.
          alt: img?.hasAttribute("alt") ? img.getAttribute("alt") : null,
          caption: el.querySelector("figcaption")?.textContent || "",
        });
      }

      // Clicking an image reopens its description. Bound on the editor root
      // rather than per-image so it keeps working for images that arrive later,
      // whether typed, pasted, or restored from a saved Delta.
      quill.root.addEventListener("click", (e) => {
        const node =
          e.target instanceof Element ? e.target.closest("figure, img") : null;
        if (node) openImageDialog(node);
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

  // Writes the description and caption onto the image the dialog was opened
  // for. An empty alt is a real value here — it marks the image decorative — so
  // it is passed through rather than treated as "no change".
  //
  // A legacy inline image is swapped for a figure the moment it is given a
  // caption, because <figcaption> has nowhere to live otherwise. One left
  // without a caption stays as it is: rewriting every old image on a stray
  // click would churn the saved Delta for nothing.
  const saveImage = ({ alt, caption }) => {
    const quill = quillRef.current;
    if (quill && imageTarget) {
      const { index, isFigure, src } = imageTarget;
      if (isFigure || caption) {
        quill.deleteText(index, 1, "user");
        quill.insertEmbed(index, "figureImage", { src, alt, caption }, "user");
        quill.setSelection(index + 1, 0, "user");
      } else {
        quill.formatText(index, 1, "alt", alt, "user");
      }
    }
    setImageTarget(null);
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
      {imageTarget && (
        <ImageAltDialog
          key={`${imageTarget.index}:${imageTarget.src}`}
          src={imageTarget.src}
          initialAlt={imageTarget.alt}
          initialCaption={imageTarget.caption}
          onSave={saveImage}
          onCancel={() => setImageTarget(null)}
        />
      )}
    </div>
  );
}
