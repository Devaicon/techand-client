"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpToLine,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Pencil,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { downloadPageExport } from "@/lib/pageTransfer.mjs";
import useAutoSave from "@/hooks/useAutoSave";
import AutoSaveStatus, {
  AutoSaveToggle,
} from "@/components/admin/AutoSaveStatus";
import AddBlockMenu from "@/components/admin/pages/AddBlockMenu";
import BlockInspector from "@/components/admin/pages/BlockInspector";
import BlockList from "@/components/admin/pages/BlockList";
import FloatingPanel from "@/components/admin/pages/FloatingPanel";
import PreviewCanvas from "@/components/admin/pages/PreviewCanvas";
import { useContextMenu } from "@/components/admin/ContextMenu";
import { useToast } from "@/components/admin/Toast";
import { useAdminAuth } from "../../../AdminAuthProvider";

// Where each panel opens the first time. Both are pinned to the left so they sit
// over the edge of the canvas rather than the middle of the page being edited.
const DEFAULT_RECTS = {
  blocks: { x: 24, y: 150, width: 380, height: 460 },
  settings: { x: 24, y: 150, width: 380, height: 420 },
};

export default function PageEditor() {
  const { id } = useParams();
  const { can } = useAdminAuth();
  const contextMenu = useContextMenu();
  const toast = useToast();
  const manage = can("pages:manage");

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [panels, setPanels] = useState({ blocks: true, settings: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null); // null | "page" | "<section id>"
  // null | { definition } for a new block | { definition, section } to edit one
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  // A copied block lives in component state, not localStorage: it is scoped to
  // this editing session on purpose, and a stale clipboard surviving a week of
  // reloads would paste content the author had long forgotten copying.
  const [clipboard, setClipboard] = useState(null);
  // One switch for the whole editor: page settings and the block drawer both
  // read it. On by default, matching the insights editor.
  const [autoSave, setAutoSave] = useState(true);

  const canvasRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // The block catalog and the page load together — the list cannot render a
      // block's name or summary without its definition. The preview link needs
      // the page's token, so it comes along too.
      const [bundle, catalog, link] = await Promise.all([
        adminApi.get(`/pages/${id}`),
        adminApi.get("/blocks"),
        adminApi.get(`/pages/${id}/preview-link`),
      ]);

      setPage(bundle.data.data.page);
      setSections(bundle.data.data.sections);
      setDefinitions(catalog.data.data.blocks);
      // `edit=1` turns on the click-to-select scaffolding. The server only
      // honours it alongside a valid preview token.
      setPreviewUrl(`${link.data.data.url}&edit=1`);
      setSettings({
        title: bundle.data.data.page.title || "",
        slug: bundle.data.data.page.slug || "",
        subtitle: bundle.data.data.page.subtitle || "",
        metaTitle: bundle.data.data.page.metaTitle || "",
        metaDescription: bundle.data.data.page.metaDescription || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load this page.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Every write reports through the toast stack rather than a banner above the
  // canvas. The banner pushed the preview down as it appeared and back up as it
  // left, which moved the thing the author was looking at at exactly the moment
  // they had just changed it.
  const flash = useCallback((message) => toast.success(message), [toast]);

  // The one shape every failing call shares. Errors stay until dismissed, so a
  // save that failed while the author was scrolled elsewhere is still there
  // when they come back.
  //
  // Memoised because `reorder` depends on it: the toast API is stable, so this
  // is too, and the optimistic reorder keeps its identity across renders.
  const fail = useCallback(
    (err, fallback) => toast.error(err.response?.data?.message || fallback),
    [toast],
  );

  // Every write that changes what the page looks like ends here, so the preview
  // is never showing a state the editor has already moved past.
  const refreshPreview = () => canvasRef.current?.refresh();

  const togglePanel = (key) =>
    setPanels((current) => ({ ...current, [key]: !current[key] }));

  const definitionFor = useCallback(
    (section) => definitions.find((d) => d.type === section.type),
    [definitions],
  );

  // Selecting from the preview: the canvas already shows the block, so there is
  // nothing to scroll or zoom.
  const selectFromPreview = useCallback(
    (sectionId) => {
      setSelectedId(sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        setEditing({ definition: definitionFor(section), section });
      }
    },
    [sections, definitionFor],
  );

  // Selecting from the blocks panel: the block may be anywhere on a very long
  // page, so the canvas zooms out far enough to show where it sits and scrolls
  // to it. `focusBlock` only ever zooms OUT, so an author who has zoomed in
  // deliberately is not yanked back.
  const openBlock = (section) => {
    setSelectedId(section.id);
    canvasRef.current?.focusBlock(section.id, { zoomOut: true });
    setEditing({ definition: definitionFor(section), section });
  };

  const isPublished = page?.status === "published";

  // The slug is the page's live URL, so on a published page it is deliberately
  // left out of auto-save: typing "about-us" would otherwise PATCH /a, /ab,
  // /abo… as the real address of a page people may be reading. Pinning it to
  // what the server last returned takes it out of the comparison entirely — the
  // field stays editable, and saves through the button.
  const autoSettings = useMemo(() => {
    if (!settings) return null;
    return isPublished ? { ...settings, slug: page.slug } : settings;
  }, [settings, isPublished, page?.slug]);

  const persistSettings = useCallback(
    async (next) => {
      const { data } = await adminApi.patch(`/pages/${id}`, next);
      const saved = data.data.page;
      setPage(saved);

      // The model normalises a slug on the way in ("About Us" → "about-us").
      // Adopt its answer, or the difference reads as an unsaved change and the
      // editor sends it straight back, every tick, for as long as it is open.
      // Guarded, because on a published page the slug the author is typing is
      // NOT the one that was sent, and overwriting it would delete their edit
      // mid-keystroke.
      if (next.slug !== saved.slug) {
        setSettings((s) => ({ ...s, slug: saved.slug }));
      }
      return { ...next, slug: saved.slug };
    },
    [id],
  );

  // Quiet about what it cannot save yet. A title cleared to retype it, or a
  // slug mid-edit, is not an error worth a toast — it is a field the author is
  // still in the middle of. These are the client-side half of the server's slug
  // rules; anything subtler (a reserved or duplicate URL) still comes back as a
  // real error, which is the right way round.
  const settingsReady = (v) =>
    Boolean(v?.title.trim()) &&
    Boolean(v.slug.trim()) &&
    !v.slug.startsWith("/") &&
    /[a-z0-9]/i.test(v.slug);

  const settingsSaver = useAutoSave({
    value: autoSettings,
    recordKey: page?.id || null,
    enabled: manage && autoSave,
    save: persistSettings,
    canSave: settingsReady,
    onError: (err) => fail(err, "Failed to save page settings."),
  });

  // The button still exists, and on a live page it is the only thing that can
  // change the URL.
  const saveSettings = async (event) => {
    event.preventDefault();
    setBusy("page");
    try {
      const { data } = await adminApi.patch(`/pages/${id}`, settings);
      const saved = data.data.page;
      setPage(saved);
      setSettings((s) => ({ ...s, slug: saved.slug }));
      // Tell auto-save what just landed — this sent a slug it holds pinned, and
      // it would otherwise see the difference and re-send the whole form.
      settingsSaver.markSaved({ ...settings, slug: saved.slug });
      flash("Page settings saved.");
    } catch (err) {
      fail(err, "Failed to save page settings.");
    } finally {
      setBusy(null);
    }
  };

  const togglePublished = async () => {
    const next = page.status === "published" ? "draft" : "published";

    // Caught at the moment it matters rather than sitting in a banner above the
    // canvas from the moment the page is created. The server is still the
    // authority; this is about not making the author send a request to be told
    // something the editor already knows.
    if (next === "published" && !sections.some((s) => s.status === "active")) {
      toast.warning(
        "This page has no visible blocks. Add one, or make an existing block visible, before publishing.",
      );
      return;
    }

    setBusy("page");
    try {
      const { data } = await adminApi.patch(`/pages/${id}/status`, {
        status: next,
      });
      setPage(data.data.page);
      flash(next === "published" ? "Page published." : "Page unpublished.");
    } catch (err) {
      fail(err, "Failed to change page status.");
    } finally {
      setBusy(null);
    }
  };

  // Throws on failure so the inspector can show the server's message against the
  // field it names, and keep the author's edits on screen rather than closing.
  //
  // `sectionId` comes from the drawer rather than from `editing` here: an
  // auto-save flushed as the author moves to the next block resolves after the
  // editor has already moved on, and would otherwise land on the wrong block.
  const saveBlock = async (props, { sectionId = null, auto = false } = {}) => {
    if (sectionId) {
      const { data } = await adminApi.patch(
        `/pages/${id}/sections/${sectionId}`,
        { props },
      );
      setSections((list) =>
        list.map((s) => (s.id === sectionId ? data.data.section : s)),
      );
      // The drawer stays open on an edit — an author tuning a heading against
      // the live preview should not have to reopen it after every save. Only
      // re-seeded if it is still showing this block, for the same reason the id
      // is passed in at all.
      setEditing((current) =>
        current?.section?.id === sectionId
          ? { ...current, section: data.data.section }
          : current,
      );
      // An auto-save says so in the drawer's own status line. A toast every
      // second and a bit, for something the author did not ask for, is noise.
      if (!auto) flash("Block saved.");
    } else {
      const { data } = await adminApi.post(`/pages/${id}/sections`, {
        type: editing.definition.type,
        props,
      });
      setSections((list) => [...list, data.data.section]);
      setSelectedId(data.data.section.id);
      setEditing(null);
      flash("Block added.");
    }
    refreshPreview();
  };

  const addBlockFrom = async (type, props, message) => {
    setBusy("page");
    try {
      const { data } = await adminApi.post(`/pages/${id}/sections`, {
        type,
        props,
      });
      setSections((list) => [...list, data.data.section]);
      flash(message);
      refreshPreview();
    } catch (err) {
      fail(err, "Failed to add the block.");
    } finally {
      setBusy(null);
    }
  };

  const duplicateBlock = (section) =>
    addBlockFrom(section.type, section.props, "Block duplicated.");

  const copyBlock = (section) => {
    const definition = definitionFor(section);
    setClipboard({
      type: section.type,
      props: section.props,
      label: definition?.label || section.type,
    });
    flash(`${definition?.label || "Block"} copied.`);
  };

  const pasteBlock = () =>
    addBlockFrom(clipboard.type, clipboard.props, "Block pasted.");

  const toggleBlockStatus = async (section) => {
    const next = section.status === "active" ? "inactive" : "active";
    setBusy(section.id);
    try {
      const { data } = await adminApi.patch(
        `/pages/${id}/sections/${section.id}/status`,
        { status: next },
      );
      setSections((list) =>
        list.map((s) => (s.id === section.id ? data.data.section : s)),
      );
      refreshPreview();
    } catch (err) {
      fail(err, "Failed to change visibility.");
    } finally {
      setBusy(null);
    }
  };

  const removeBlock = async (section) => {
    if (!confirm("Delete this block and its contents? This cannot be undone.")) {
      return;
    }
    setBusy(section.id);
    try {
      await adminApi.delete(`/pages/${id}/sections/${section.id}`);
      setSections((list) => list.filter((s) => s.id !== section.id));
      if (editing?.section?.id === section.id) setEditing(null);
      if (selectedId === section.id) setSelectedId(null);
      flash("Block deleted.");
      refreshPreview();
    } catch (err) {
      fail(err, "Failed to delete the block.");
    } finally {
      setBusy(null);
    }
  };

  // Optimistic: the reorder is a single atomic call, so either every position is
  // rewritten or none is, and the list snaps back on failure.
  //
  // The pre-drag order is stashed in a ref rather than a local `const previous =
  // sections`, because `reorder` is memoised and would otherwise close over a
  // stale list — restoring an order from several drags ago on a failure.
  const rollbackRef = useRef(null);

  const reorder = useCallback(
    async (next) => {
      setSections((previous) => {
        rollbackRef.current = previous;
        return next;
      });
      try {
        const { data } = await adminApi.patch(`/pages/${id}/reorder`, {
          ids: next.map((s) => s.id),
        });
        setSections(data.data.sections);
        canvasRef.current?.refresh();
      } catch (err) {
        if (rollbackRef.current) setSections(rollbackRef.current);
        fail(err, "Failed to reorder blocks.");
      }
    },
    [id, fail],
  );

  const moveBlock = (section, to) => {
    const from = sections.findIndex((s) => s.id === section.id);
    if (from < 0) return;

    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to === "top" ? 0 : next.length, 0, moved);
    reorder(next);
  };

  // One menu definition, raised from three places: a right-click on a row, the
  // row's ⋯ button, and a right-click on the block in the live preview.
  const blockMenuItems = (section) => {
    const index = sections.findIndex((s) => s.id === section.id);
    const visible = section.status === "active";

    return [
      { label: "Edit block", icon: Pencil, onSelect: () => openBlock(section) },
      {
        label: visible ? "Hide block" : "Show block",
        icon: visible ? EyeOff : Eye,
        onSelect: () => toggleBlockStatus(section),
      },
      { separator: true },
      {
        label: "Duplicate",
        icon: CopyPlus,
        onSelect: () => duplicateBlock(section),
      },
      { label: "Copy", icon: Copy, onSelect: () => copyBlock(section) },
      {
        label: clipboard ? `Paste ${clipboard.label.toLowerCase()}` : "Paste",
        icon: ClipboardPaste,
        disabled: !clipboard,
        onSelect: pasteBlock,
      },
      { separator: true },
      { heading: "Move" },
      {
        label: "Move to top",
        icon: ArrowUpToLine,
        disabled: index === 0,
        onSelect: () => moveBlock(section, "top"),
      },
      {
        label: "Move to bottom",
        icon: ArrowDownToLine,
        disabled: index === sections.length - 1,
        onSelect: () => moveBlock(section, "bottom"),
      },
      { separator: true },
      {
        label: "Delete block",
        icon: Trash2,
        danger: true,
        onSelect: () => removeBlock(section),
      },
    ];
  };

  const openBlockMenu = (event, section) => {
    if (!manage) return;
    contextMenu.open(event, () => blockMenuItems(section));
  };

  // From the preview iframe, which reports page coordinates rather than an
  // event — there is no React event to hand over across the document boundary.
  const openBlockMenuAt = useCallback(
    (sectionId, x, y) => {
      if (!manage) return;
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;
      setSelectedId(sectionId);
      contextMenu.openAt(x, y, () => blockMenuItems(section));
    },
    // blockMenuItems closes over most of this component; listing it would make
    // the callback change on every render and re-register the message listener
    // in PreviewCanvas each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manage, sections, clipboard, contextMenu],
  );

  // Both halves are already in state — the editor loaded them to render the
  // block list — so this needs no request and works while the page is a draft.
  const exportPage = () => {
    downloadPageExport(page, sections);
    flash("Page exported.");
  };

  const openPreviewTab = () =>
    window.open(
      previewUrl.replace("&edit=1", ""),
      "_blank",
      "noopener,noreferrer",
    );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  if (!page) {
    return (
      <div>
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error || "Page not found."}
        </p>
        <Link href="/admin/pages" className="text-sm font-semibold text-[#37469E]">
          ← Back to pages
        </Link>
      </div>
    );
  }

  const published = isPublished;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── toolbar ──────────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/pages"
          title="Back to pages"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
        >
          <ArrowLeft size={17} />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-gray-900">
            {page.title}
          </h1>
          <p className="truncate text-xs text-gray-400">/{page.slug}</p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            published
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {published ? "PUBLISHED" : "DRAFT"}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Governs page settings and the block drawer alike. Each form shows
              its own status beside its own fields — a single indicator up here
              would be reporting on something off screen. */}
          {manage && (
            <AutoSaveToggle enabled={autoSave} onChange={setAutoSave} />
          )}

          {/* Panel toggles. These are the only way to reach the blocks list and
              page settings now that both float over the canvas. */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
            {[
              ["blocks", "Blocks", Layers],
              ["settings", "Page settings", Settings2],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => togglePanel(key)}
                title={label}
                aria-pressed={panels[key]}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                  panels[key]
                    ? "bg-white text-[#37469E] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={exportPage}
            title="Download this page as a .page.json file"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Download size={15} />
            <span className="hidden lg:inline">Export</span>
          </button>

          <button
            onClick={openPreviewTab}
            title="Open the preview in a new tab"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <ExternalLink size={15} />
            <span className="hidden lg:inline">Open preview</span>
          </button>

          {published && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink size={15} />
              <span className="hidden lg:inline">View live</span>
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

      {/* ── canvas ───────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1">
        <PreviewCanvas
          ref={canvasRef}
          url={previewUrl}
          selectedId={selectedId}
          onSelectBlock={selectFromPreview}
          onBlockContextMenu={openBlockMenuAt}
        />
      </div>

      {/* ── floating panels ──────────────────────────────────────────────── */}
      {panels.blocks && (
        <FloatingPanel
          id="blocks"
          title="Blocks"
          subtitle={`${sections.length} on this page`}
          icon={Layers}
          defaultRect={DEFAULT_RECTS.blocks}
          onClose={() => togglePanel("blocks")}
        >
          {manage && (
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-2">
              <span className="text-[11px] text-gray-400">
                Right-click a block for more
              </span>
              <AddBlockMenu
                definitions={definitions}
                clipboard={clipboard}
                onPaste={pasteBlock}
                onPick={(definition) => {
                  setSelectedId(null);
                  setEditing({ definition });
                }}
              />
            </div>
          )}

          <BlockList
            sections={sections}
            definitions={definitions}
            manage={manage}
            busyId={busy}
            selectedId={selectedId}
            onEdit={openBlock}
            onToggle={toggleBlockStatus}
            onRemove={removeBlock}
            onReorder={reorder}
            onDuplicate={duplicateBlock}
            onCopy={copyBlock}
            onContextMenu={openBlockMenu}
            // Dropping a block between two others is a decision about the shape
            // of the page, so the canvas pulls back to show the whole thing for
            // the duration of the drag.
            onDragStart={() => canvasRef.current?.fitToPage()}
          />
        </FloatingPanel>
      )}

      {panels.settings && (
        <FloatingPanel
          id="settings"
          title="Page settings"
          subtitle={`/${page.slug}`}
          icon={Settings2}
          defaultRect={DEFAULT_RECTS.settings}
          onClose={() => togglePanel("settings")}
        >
          <form onSubmit={saveSettings} className="space-y-4 p-4">
            {[
              ["title", "Title", "Shown in the admin and the browser tab"],
              ["slug", "URL", "Use slashes for nested pages"],
              ["subtitle", "Subtitle", "Falls back to the meta description"],
              ["metaTitle", "Meta title", "Falls back to the page title"],
              ["metaDescription", "Meta description", "Falls back to the subtitle"],
            ].map(([key, label, hint]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  {label}
                </span>
                <input
                  type="text"
                  value={settings[key]}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, [key]: e.target.value }))
                  }
                  disabled={!manage}
                  placeholder={hint}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
                />
                {/* Said only once it matters. Without it, an author who
                    retyped the URL of a live page would watch the status line
                    settle on "Saved" and reasonably assume it meant this. */}
                {key === "slug" && published && settings.slug !== page.slug && (
                  <span className="mt-1 block text-xs text-amber-600">
                    This page is live, so its URL is not auto-saved. Press Save
                    settings to move it.
                  </span>
                )}
              </label>
            ))}

            {manage && (
              <div className="space-y-2">
                <AutoSaveStatus
                  status={autoSave ? settingsSaver.status : undefined}
                />
                <button
                  type="submit"
                  disabled={busy === "page"}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
                >
                  {busy === "page" && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Save settings
                </button>
              </div>
            )}
          </form>
        </FloatingPanel>
      )}

      {editing?.definition && (
        <BlockInspector
          definition={editing.definition}
          section={editing.section || null}
          autoSave={manage && autoSave}
          onSave={saveBlock}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
