"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
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

// Registers the inline-CTA blot exactly once per page load. Quill's registry
// is global, so re-registering on every mount logs an override warning.
let ctaBlotRegistered = false;

function registerCtaBlot(Quill) {
  if (ctaBlotRegistered) return;

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
  ctaBlotRegistered = true;
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

  useEffect(() => {
    let cancelled = false;

    // Dynamic import: Quill touches `document` at module scope, so it cannot be
    // evaluated during SSR.
    import("quill").then(({ default: Quill }) => {
      if (cancelled || !hostRef.current || quillRef.current) return;

      registerCtaBlot(Quill);

      const quill = new Quill(hostRef.current, {
        theme: "snow",
        placeholder,
        modules: {
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

      if (initialDelta && initialDelta.ops) {
        quill.setContents(initialDelta, "silent");
      }

      quill.on("text-change", () => {
        onChangeRef.current?.({
          delta: quill.getContents(),
          html: quill.root.innerHTML,
        });
      });

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

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {loading && (
        <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading editor…
        </div>
      )}
      <div className={loading ? "hidden" : "blog-editor"}>
        <div ref={hostRef} />
      </div>
      {uploadError && (
        <p className="border-t border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          {uploadError}
        </p>
      )}
    </div>
  );
}
