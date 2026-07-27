"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Columns2,
  Eye,
  ExternalLink,
  LayoutGrid,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import SectionEditor, {
  SECTION_TYPES,
} from "@/components/admin/services/SectionEditor";
import { useAdminAuth } from "../../AdminAuthProvider";

// Type → the glyph and the one-line summary shown in the section list. A
// module-level object indexed by property access, not a `resolve(type)` helper:
// the React Compiler lint rule `react-hooks/static-components` cannot see
// through a function call and reports "Cannot create components during render".
const TYPE_ICONS = {
  platform: Columns2,
  collection: LayoutGrid,
  cta: Megaphone,
};

const summarise = (section) => {
  if (section.type === "cta") return section.link?.label || "No button";
  const count = `${section.cards?.length || 0} card${
    section.cards?.length === 1 ? "" : "s"
  }`;
  if (section.type === "collection") return `${section.layout} · ${count}`;
  return `copy ${section.align} · ${count}`;
};

export default function ServicesAdminPage() {
  const { can } = useAdminAuth();
  const manage = can("pages:manage");

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(null); // null | "page" | "<section id>"
  const [editing, setEditing] = useState(null); // null | {type} | section
  const [adding, setAdding] = useState(false);

  const addMenuRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.get("/services/page");
      setPage(data.data.page);
      setSections(data.data.sections);
      setSettings({
        title: data.data.page.title || "",
        subtitle: data.data.page.subtitle || "",
        metaTitle: data.data.page.metaTitle || "",
        metaDescription: data.data.page.metaDescription || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load the services page.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Close the add-section menu on an outside click, so it does not sit open
  // over the list after the author has moved on.
  useEffect(() => {
    if (!adding) return undefined;
    const onClick = (e) => {
      if (!addMenuRef.current?.contains(e.target)) setAdding(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [adding]);

  // Errors are sticky, successes are not: a "Saved" that lingers reads as if it
  // applies to whatever the author does next.
  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setBusy("page");
    setError("");
    try {
      const { data } = await adminApi.patch("/services/page", settings);
      setPage(data.data.page);
      flash("Page settings saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save page settings.");
    } finally {
      setBusy(null);
    }
  };

  const togglePublished = async () => {
    const next = page.status === "published" ? "draft" : "published";
    setBusy("page");
    setError("");
    try {
      const { data } = await adminApi.patch("/services/page/status", {
        status: next,
      });
      setPage(data.data.page);
      flash(next === "published" ? "Page published." : "Page unpublished.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change page status.");
    } finally {
      setBusy(null);
    }
  };

  const openPreview = async () => {
    setBusy("page");
    try {
      const { data } = await adminApi.get("/services/page/preview-link");
      window.open(data.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not build a preview link.",
      );
    } finally {
      setBusy(null);
    }
  };

  const saveSection = async (body, type) => {
    if (editing?.id) {
      const { data } = await adminApi.patch(
        `/services/sections/${editing.id}`,
        body,
      );
      setSections((list) =>
        list.map((s) => (s.id === editing.id ? data.data.section : s)),
      );
      flash("Section saved.");
    } else {
      const { data } = await adminApi.post("/services/sections", {
        ...body,
        type,
      });
      setSections((list) => [...list, data.data.section]);
      flash("Section added.");
    }
    setEditing(null);
  };

  const toggleSectionStatus = async (section) => {
    const next = section.status === "active" ? "inactive" : "active";
    setBusy(section.id);
    setError("");
    try {
      const { data } = await adminApi.patch(
        `/services/sections/${section.id}/status`,
        { status: next },
      );
      setSections((list) =>
        list.map((s) => (s.id === section.id ? data.data.section : s)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change visibility.");
    } finally {
      setBusy(null);
    }
  };

  const removeSection = async (section) => {
    if (
      !confirm(
        `Delete "${section.heading || "this section"}" and its cards? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(section.id);
    setError("");
    try {
      await adminApi.delete(`/services/sections/${section.id}`);
      setSections((list) => list.filter((s) => s.id !== section.id));
      flash("Section deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete the section.");
    } finally {
      setBusy(null);
    }
  };

  // ↑/↓ rather than drag-and-drop: keyboard accessible without extra work, no
  // dependency, and the list is short enough that a drag would not be faster.
  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];

    const previous = sections;
    setSections(next); // optimistic — the reorder is a single atomic call
    setBusy(sections[index].id);
    setError("");
    try {
      const { data } = await adminApi.patch("/services/reorder", {
        ids: next.map((s) => s.id),
      });
      setSections(data.data.sections);
    } catch (err) {
      setSections(previous);
      setError(err.response?.data?.message || "Failed to reorder sections.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  const published = page?.status === "published";
  const activeCount = sections.filter((s) => s.status === "active").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              published
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openPreview}
            disabled={busy === "page"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <Eye size={15} /> Preview
          </button>
          {published && (
            <a
              href="/services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink size={15} /> View live
            </a>
          )}
          {manage && (
            <button
              onClick={togglePublished}
              disabled={busy === "page"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                published
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-[#37469E] hover:bg-[#2C3A85]"
              }`}
            >
              <Send size={15} /> {published ? "Unpublish" : "Publish"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}
      {!published && activeCount === 0 && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Add at least one visible section before this page can be published.
        </p>
      )}

      {/* ── Page settings ─────────────────────────────────────────────── */}
      <form
        onSubmit={saveSettings}
        className="mb-8 rounded-2xl border border-gray-200 bg-white p-5"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Page settings
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Title
            </span>
            <input
              type="text"
              value={settings.title}
              onChange={(e) =>
                setSettings((s) => ({ ...s, title: e.target.value }))
              }
              disabled={!manage}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Subtitle
            </span>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) =>
                setSettings((s) => ({ ...s, subtitle: e.target.value }))
              }
              disabled={!manage}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Meta title
            </span>
            <input
              type="text"
              value={settings.metaTitle}
              onChange={(e) =>
                setSettings((s) => ({ ...s, metaTitle: e.target.value }))
              }
              disabled={!manage}
              placeholder="Falls back to the page title"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Meta description
            </span>
            <input
              type="text"
              value={settings.metaDescription}
              onChange={(e) =>
                setSettings((s) => ({ ...s, metaDescription: e.target.value }))
              }
              disabled={!manage}
              placeholder="Falls back to the subtitle"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </label>
        </div>

        {manage && (
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={busy === "page"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {busy === "page" && <Loader2 size={15} className="animate-spin" />}
              Save settings
            </button>
          </div>
        )}
      </form>

      {/* ── Sections ──────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Sections ({sections.length})
        </h2>

        {manage && (
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setAdding((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
            >
              <Plus size={16} /> Add section
            </button>

            {adding && (
              <div className="absolute right-0 z-10 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {SECTION_TYPES.map((t) => {
                  const Glyph = TYPE_ICONS[t.value];
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        setEditing({ type: t.value });
                        setAdding(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <Glyph size={17} className="mt-0.5 shrink-0 text-[#37469E]" />
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">
                          {t.label}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {t.blurb}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {sections.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            No sections yet. Add the first one to start building this page.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sections.map((section, index) => {
              const Glyph = TYPE_ICONS[section.type] || LayoutGrid;
              const label =
                SECTION_TYPES.find((t) => t.value === section.type)?.label ||
                section.type;

              return (
                <li
                  key={section.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  {manage && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || busy === section.id}
                        title="Move up"
                        className="rounded p-0.5 text-gray-300 hover:text-[#37469E] disabled:opacity-40"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={
                          index === sections.length - 1 || busy === section.id
                        }
                        title="Move down"
                        className="rounded p-0.5 text-gray-300 hover:text-[#37469E] disabled:opacity-40"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  )}

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FA] text-[#37469E]">
                    <Glyph size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {section.heading || "Untitled section"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {label} · {summarise(section)}
                    </p>
                  </div>

                  <button
                    onClick={() => manage && toggleSectionStatus(section)}
                    disabled={!manage || busy === section.id}
                    title={manage ? "Toggle visibility" : undefined}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      section.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    } ${
                      manage ? "hover:opacity-80" : "cursor-default"
                    } disabled:opacity-60`}
                  >
                    {section.status === "active" ? "VISIBLE" : "HIDDEN"}
                  </button>

                  {busy === section.id && (
                    <Loader2 size={15} className="animate-spin text-gray-400" />
                  )}

                  {manage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(section)}
                        title="Edit"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => removeSection(section)}
                        disabled={busy === section.id}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-rose-600 disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && (
        <SectionEditor
          // `{type}` means "new"; a real section carries an id.
          section={editing.id ? editing : null}
          type={editing.type}
          onSave={saveSection}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
