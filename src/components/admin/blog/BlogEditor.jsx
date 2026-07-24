"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Loader2, Save, Send, Eye, Star, ChevronDown, ExternalLink, ArrowLeft, Check,
} from "lucide-react";
import Link from "next/link";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "@/app/admin/AdminAuthProvider";
import { deriveToc } from "@/lib/deriveToc";
import { CATEGORIES } from "@/components/insight-page/insightUtils";
import { normalizeUrl } from "@/lib/normalizeUrl";
import CloudinaryImageField from "./CloudinaryImageField";
import CtaRepeater from "./CtaRepeater";
import ExternalLinksRepeater from "./ExternalLinksRepeater";
import FaqRepeater from "./FaqRepeater";
import TocOverrides from "./TocOverrides";

// Quill reads `document` at module scope, so it can never be part of the
// server bundle.
const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
      <Loader2 size={16} className="animate-spin" /> Loading editor…
    </div>
  ),
});

// "View all" is the filter chip's reset option, not a real category.
const REAL_CATEGORIES = CATEGORIES.filter((c) => c !== "View all");

// How often auto-save checks for unsaved changes. A poll (rather than a
// per-keystroke debounce) is deliberate: the article body is kept out of React
// state to avoid re-rendering the form on every character, so there is no state
// change to debounce on — a ref flag flipped on edit is what we watch instead.
const AUTOSAVE_INTERVAL_MS = 2500;

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const emptyBlog = {
  title: "", slug: "", subtitle: "", category: "", categories: [], tags: [],
  readTime: "", heroImage: {}, cardImage: {},
  author: { name: "", role: "", avatarUrl: "" },
  contentHtml: "", contentDelta: null, toc: [], ctas: [], externalLinks: [],
  faqs: [], isFeatured: false, comingSoon: false, status: "draft",
};

function Panel({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          {title}
        </span>
        {count > 0 && (
          <span className="rounded-full bg-[#EEF0FA] px-2 py-0.5 text-xs font-medium text-[#37469E]">
            {count}
          </span>
        )}
      </button>
      {open && <div className="border-t border-gray-100 p-5">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#37469E] focus:outline-none";

export default function BlogEditor({ initial, blogId }) {
  const router = useRouter();
  const { can, user } = useAdminAuth();

  const [blog, setBlog] = useState(() => ({
    ...emptyBlog,
    ...initial,
    author: {
      ...emptyBlog.author,
      // A new post defaults to the signed-in user's name; existing posts keep
      // whatever was saved, so republishing never rewrites the byline.
      ...(initial?.author || (blogId ? {} : { name: user?.username || "" })),
    },
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Whether the editor body has changed since the last save. Drives the TOC
  // panel's "Detect headings" affordance.
  const [bodyDirty, setBodyDirty] = useState(false);

  // Auto-save, on by default. `dirty` (state) drives the visible status pill;
  // the mirrored refs let the poll below read the live values without being
  // torn down and re-created on every render.
  const [autoSave, setAutoSave] = useState(true);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const autoSaveRef = useRef(autoSave);
  autoSaveRef.current = autoSave;
  const saveRef = useRef(null);

  // Any real user edit — body keystroke or a metadata field — marks the post
  // dirty. setDirty(true) is a no-op re-render once already dirty, so continuous
  // typing does not re-render the form.
  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
  };

  // Live Quill content lives in a ref, not state: Quill fires text-change on
  // every keystroke, and routing that through setState would re-render the
  // whole form (and the editor) on each character.
  const contentRef = useRef({
    html: initial?.contentHtml || "",
    delta: initial?.contentDelta || null,
  });
  const quillApiRef = useRef(null);

  // The id of the saved post. Seeded from the prop, but ALSO written after a
  // successful create — `blogId` is a prop and stays undefined until the
  // router.replace below remounts this component, so without this a second
  // Save click during that window would POST a duplicate post.
  const savedIdRef = useRef(blogId || null);

  const set = (fields) => {
    setBlog((b) => ({ ...b, ...fields }));
    markDirty();
  };

  const handleEditorChange = useCallback(({ html, delta }) => {
    contentRef.current = { html, delta };
    setBodyDirty(true);
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  const handleTitleChange = (title) => {
    // Auto-slug only while the post has never been saved. Once it exists the
    // slug is a real URL, and silently rewriting it as someone tweaks the
    // headline would break inbound links.
    set(savedIdRef.current ? { title } : { title, slug: slugify(title) });
  };

  const refreshToc = () => {
    const detected = deriveToc(
      quillApiRef.current?.getHtml() || contentRef.current.html,
      blog.toc,
    );
    set({ toc: detected });
  };

  const buildPayload = () => ({
    title: blog.title,
    slug: blog.slug || slugify(blog.title),
    subtitle: blog.subtitle,
    category: blog.category,
    categories: blog.categories,
    tags: blog.tags,
    readTime: blog.readTime,
    heroImage: blog.heroImage,
    cardImage: blog.cardImage,
    author: blog.author,
    contentHtml: contentRef.current.html,
    contentDelta: contentRef.current.delta,
    toc: blog.toc,
    // Normalize URLs one last time before sending — covers a value that was
    // typed but never blurred (e.g. an auto-save firing mid-edit), so a bare
    // "example.com" is saved as "https://example.com" instead of 400-ing.
    ctas: blog.ctas.map((c) => ({ ...c, href: normalizeUrl(c.href) })),
    externalLinks: blog.externalLinks.map((l) => ({
      ...l,
      url: normalizeUrl(l.url),
    })),
    faqs: blog.faqs,
    isFeatured: blog.isFeatured,
    comingSoon: blog.comingSoon,
  });

  const validate = () => {
    if (!blog.title.trim()) return "Give the post a title.";
    if (!blog.category.trim()) return "Pick a primary category.";
    return "";
  };

  const save = async ({ silent = false, auto = false } = {}) => {
    const problem = validate();
    if (problem) {
      // An auto-save that can't run yet (no title/category) stays quiet rather
      // than flashing a validation error the user didn't ask for.
      if (!auto) setError(problem);
      return null;
    }

    setSaving(true);
    savingRef.current = true;
    setError("");
    if (!silent) setNotice("");
    try {
      const payload = buildPayload();
      const existingId = savedIdRef.current;
      const { data } = existingId
        ? await adminApi.patch(`/blogs/${existingId}`, payload)
        : await adminApi.post("/blogs", payload);

      const saved = data.data.blog;
      savedIdRef.current = saved.id;
      // Adopt the server's version of derived fields — slug (it may have been
      // suffixed to avoid a collision), toc and readTime are computed there.
      // Written straight to state (not via `set`) so adopting them does not
      // re-mark the post dirty and retrigger auto-save in a loop.
      setBlog((b) => ({
        ...b,
        slug: saved.slug,
        toc: saved.toc,
        readTime: saved.readTime,
        status: saved.status,
      }));
      dirtyRef.current = false;
      setDirty(false);
      setBodyDirty(false);
      if (!silent) setNotice("Saved.");

      // Move the URL onto the edit route so a refresh reopens the saved post
      // rather than a blank "new" form.
      if (!blogId) router.replace(`/admin/blogs/${saved.id}/edit`);
      return saved;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
      return null;
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  // Keep a live handle to save() for the interval below, which is created once.
  saveRef.current = save;

  // Auto-save poll. Fires a silent save when the post is dirty, idle and valid;
  // skips entirely when the toggle is off or a save is already in flight.
  useEffect(() => {
    const id = setInterval(() => {
      if (!autoSaveRef.current || savingRef.current || !dirtyRef.current) return;
      saveRef.current?.({ silent: true, auto: true });
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const publish = async () => {
    // Always save first: publishing an unsaved editor would push the *last
    // saved* body live, silently discarding whatever is on screen.
    const saved = await save({ silent: true });
    if (!saved) return;

    setSaving(true);
    savingRef.current = true;
    try {
      const next = blog.status === "published" ? "draft" : "published";
      const { data } = await adminApi.patch(`/blogs/${saved.id}/status`, {
        status: next,
      });
      // Adopt the new status straight to state — a status flip is not a content
      // edit, so it must not re-mark the post dirty or trip auto-save.
      setBlog((b) => ({ ...b, status: data.data.blog.status }));
      setNotice(next === "published" ? "Published." : "Moved back to draft.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change status.");
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  const openPreview = async () => {
    const saved = await save({ silent: true });
    if (!saved) return;
    try {
      const { data } = await adminApi.get(`/blogs/${saved.id}/preview-link`);
      window.open(data.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.response?.data?.message || "Could not build a preview link.");
    }
  };

  const canPublish = can("blog:publish");
  const canSave = blogId ? can("blog:update") : can("blog:create");
  const isPublished = blog.status === "published";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {blogId ? "Edit insight" : "New insight"}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isPublished
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-save toggle + live status. Auto-save is on by default; the
              manual Save button remains for an explicit, immediate save. */}
          {canSave && (
            <div className="mr-1 flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={autoSave}
                aria-label="Auto-save"
                onClick={() => setAutoSave((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  autoSave ? "bg-[#37469E]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    autoSave ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-gray-600">Auto-save</span>
              <span className="inline-flex min-w-[92px] items-center gap-1 text-xs text-gray-400">
                {saving ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Saving…
                  </>
                ) : dirty ? (
                  "Unsaved changes"
                ) : savedIdRef.current ? (
                  <>
                    <Check size={12} className="text-emerald-500" /> Saved
                  </>
                ) : null}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={openPreview}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <Eye size={15} /> Preview
          </button>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#37469E] px-3 py-2 text-sm font-semibold text-[#37469E] hover:bg-[#EEF0FA] disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
          {canPublish && (
            <button
              type="button"
              onClick={publish}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              <Send size={15} /> {isPublished ? "Unpublish" : "Publish"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Field label="Title">
              <input
                type="text"
                value={blog.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="How Agentic AI is transforming customer experience"
                className={inputClass}
              />
            </Field>

            <Field
              label="Slug"
              hint={
                isPublished
                  ? "This post is live — changing the slug breaks existing links to it."
                  : "The URL this post lives at: /insights/your-slug"
              }
            >
              <input
                type="text"
                value={blog.slug}
                onChange={(e) => set({ slug: slugify(e.target.value) })}
                placeholder="agentic-ai"
                className={inputClass}
              />
            </Field>

            <Field label="Summary" hint="Shown on cards and under the title on the article.">
              <textarea
                value={blog.subtitle}
                onChange={(e) => set({ subtitle: e.target.value })}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Article
            </label>
            <QuillEditor
              initialDelta={initial?.contentDelta}
              onChange={handleEditorChange}
              onReady={(api) => {
                quillApiRef.current = api;
              }}
            />
          </div>

          <Panel title="Calls to action" count={blog.ctas.length}>
            <CtaRepeater
              value={blog.ctas}
              onChange={(ctas) => set({ ctas })}
              onInsertMarker={(key) => quillApiRef.current?.insertCtaSlot(key)}
            />
          </Panel>

          <Panel title="External links" count={blog.externalLinks.length}>
            <ExternalLinksRepeater
              value={blog.externalLinks}
              onChange={(externalLinks) => set({ externalLinks })}
            />
          </Panel>

          <Panel title="FAQs" count={blog.faqs.length}>
            <FaqRepeater
              value={blog.faqs}
              onChange={(faqs) => set({ faqs })}
            />
          </Panel>

          <Panel title="Table of contents" count={blog.toc.length}>
            <TocOverrides
              value={blog.toc}
              onChange={(toc) => set({ toc })}
              onRefresh={refreshToc}
              dirty={bodyDirty}
            />
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Publishing</h2>

            <label className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-gray-700">
                <Star size={15} className={blog.isFeatured ? "text-amber-500" : "text-gray-400"} />
                Featured
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={blog.isFeatured}
                aria-label="Featured"
                onClick={() => set({ isFeatured: !blog.isFeatured })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  blog.isFeatured ? "bg-[#37469E]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    blog.isFeatured ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
            <p className="-mt-2 text-xs text-gray-500">
              Adds this post to the &ldquo;Featured blogs&rdquo; rail on the
              insights page.
            </p>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Coming soon</span>
              <button
                type="button"
                role="switch"
                aria-checked={blog.comingSoon}
                aria-label="Coming soon"
                onClick={() => set({ comingSoon: !blog.comingSoon })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  blog.comingSoon ? "bg-[#37469E]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    blog.comingSoon ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            {isPublished && blog.slug && (
              <a
                href={`/insights/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#37469E] hover:underline"
              >
                <ExternalLink size={14} /> View live
              </a>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Images</h2>
            <CloudinaryImageField
              label="Hero image"
              hint="Full-width banner at the top of the article."
              value={blog.heroImage}
              onChange={(heroImage) => set({ heroImage })}
            />
            <CloudinaryImageField
              label="Card image"
              hint="Used on listing cards. Falls back to the hero image."
              value={blog.cardImage}
              onChange={(cardImage) => set({ cardImage })}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Taxonomy</h2>

            <Field label="Primary category" hint="Shown as the badge on cards.">
              <input
                type="text"
                value={blog.category}
                onChange={(e) => set({ category: e.target.value })}
                placeholder="AI & Automation"
                className={inputClass}
              />
            </Field>

            <Field
              label="Filter categories"
              hint="Decides which filter chips show this post on /insights."
            >
              <div className="flex flex-wrap gap-1.5">
                {REAL_CATEGORIES.map((c) => {
                  const on = blog.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set({
                          categories: on
                            ? blog.categories.filter((x) => x !== c)
                            : [...blog.categories, c],
                        })
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        on
                          ? "bg-[#4A2D58] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Tags" hint="Comma separated. Matched by the search box only.">
              <input
                type="text"
                value={blog.tags.join(", ")}
                onChange={(e) =>
                  set({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Agentic AI, Enterprise AI"
                className={inputClass}
              />
            </Field>

            <Field label="Read time" hint="Left blank, this is estimated on save.">
              <input
                type="text"
                value={blog.readTime}
                onChange={(e) => set({ readTime: e.target.value })}
                placeholder="8 min read"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Author</h2>
            <Field label="Name">
              <input
                type="text"
                value={blog.author.name}
                onChange={(e) => set({ author: { ...blog.author, name: e.target.value } })}
                className={inputClass}
              />
            </Field>
            <Field label="Role">
              <input
                type="text"
                value={blog.author.role}
                onChange={(e) => set({ author: { ...blog.author, role: e.target.value } })}
                placeholder="Enterprise AI Specialists"
                className={inputClass}
              />
            </Field>
            <CloudinaryImageField
              label="Avatar"
              showCrop={false}
              value={blog.author.avatarUrl ? { url: blog.author.avatarUrl } : {}}
              onChange={(img) =>
                set({ author: { ...blog.author, avatarUrl: img.url || "" } })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
