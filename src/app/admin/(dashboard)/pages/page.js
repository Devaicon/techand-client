"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  CopyPlus,
  Download,
  ExternalLink,
  FileText,
  Files,
  Globe,
  Layers,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { downloadPageExport } from "@/lib/pageTransfer";
import ImportPageDialog from "@/components/admin/pages/ImportPageDialog";
import { useToast } from "@/components/admin/Toast";
import { useContextMenu } from "@/components/admin/ContextMenu";
import { useAdminAuth } from "../../AdminAuthProvider";

// "3 days ago" beats a timestamp on a list you scan: the question a page list
// answers is "what have I touched lately", not "what was the exact minute".
const RELATIVE = [
  [60, "second", 1],
  [3600, "minute", 60],
  [86400, "hour", 3600],
  [604800, "day", 86400],
  [2629800, "week", 604800],
  [31557600, "month", 2629800],
];

const relativeTime = (iso) => {
  if (!iso) return "";
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 45) return "just now";

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [limit, unit, divisor] of RELATIVE) {
    if (seconds < limit) {
      return formatter.format(-Math.round(seconds / divisor), unit);
    }
  }
  return formatter.format(-Math.round(seconds / 31557600), "year");
};

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-bold leading-none text-gray-900">
          {value}
        </span>
        <span className="block truncate text-xs text-gray-500">{label}</span>
      </span>
    </div>
  );
}

export default function PagesListPage() {
  const { can } = useAdminAuth();
  const router = useRouter();
  const contextMenu = useContextMenu();
  const toast = useToast();
  const manage = can("pages:manage");

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", slug: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.get("/pages");
      setPages(data.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (message) => {
    toast.success(message);
  };

  const create = async (event) => {
    event.preventDefault();
    setBusy("new");
    setError("");
    try {
      const { data } = await adminApi.post("/pages", draft);
      setPages((list) => [...list, data.data.page]);
      setDraft({ title: "", slug: "" });
      setSlugTouched(false);
      setCreating(false);
      // Straight into the editor: creating a page is never the goal, filling it
      // in is, and a new page has nothing on this screen worth returning to.
      router.push(`/admin/pages/${data.data.page.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create the page.");
      setBusy(null);
    }
  };

  const remove = async (page) => {
    if (
      !confirm(
        `Delete "${page.title}" and all ${page.blockCount} of its blocks? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(page.id);
    setError("");
    try {
      await adminApi.delete(`/pages/${page.id}`);
      setPages((list) => list.filter((p) => p.id !== page.id));
      flash("Page deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete the page.");
    } finally {
      setBusy(null);
    }
  };

  // Copies the page row and every block on it. Done client-side from the
  // endpoints that already exist rather than as a server "duplicate" route:
  // there is nothing the server would do here that the client cannot, and a new
  // endpoint would need its own validation, tests and permission check.
  const duplicate = async (page) => {
    setBusy(page.id);
    setError("");
    try {
      const { data: bundle } = await adminApi.get(`/pages/${page.id}`);

      const { data: created } = await adminApi.post("/pages", {
        slug: `${page.slug}-copy`,
        title: `${page.title} (copy)`,
        subtitle: bundle.data.page.subtitle || "",
        metaTitle: bundle.data.page.metaTitle || "",
        metaDescription: bundle.data.page.metaDescription || "",
      });

      // Sequentially, not Promise.all: `order` is assigned server-side by
      // appending, so concurrent creates would land in a nondeterministic order.
      for (const section of bundle.data.sections) {
        await adminApi.post(`/pages/${created.data.page.id}/sections`, {
          type: section.type,
          props: section.props,
          status: section.status,
        });
      }

      await load();
      flash(`Duplicated as "${created.data.page.title}".`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to duplicate the page.",
      );
    } finally {
      setBusy(null);
    }
  };

  // The list row does not hold a page's blocks, so the bundle is fetched first.
  // The editor's own Export button already has both in state and skips this.
  const exportPage = async (page) => {
    setBusy(page.id);
    try {
      const { data } = await adminApi.get(`/pages/${page.id}`);
      downloadPageExport(data.data.page, data.data.sections);
      flash(`Exported "${page.title}".`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export that page.");
    } finally {
      setBusy(null);
    }
  };

  // The dialog reports what it managed to create; this decides what to say about
  // it. A block the server rejected is called out by name rather than folded
  // into the success message — the page is now missing something, and the author
  // is the only one who can tell whether that matters.
  const onImported = async ({ page, added, failed }) => {
    setImporting(false);
    await load();

    if (failed.length > 0) {
      toast.warning(
        `Imported "${page.title}" with ${added} block${
          added === 1 ? "" : "s"
        }. ${failed.length} could not be added: ${failed
          .map((f) => `${f.type} (${f.message})`)
          .join("; ")}`,
      );
    } else {
      flash(
        `Imported "${page.title}" with ${added} block${added === 1 ? "" : "s"}.`,
      );
    }

    router.push(`/admin/pages/${page.id}`);
  };

  const copyUrl = async (page) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${page.slug}`,
      );
      flash("URL copied.");
    } catch {
      toast.error("Could not copy to the clipboard.");
    }
  };

  const openMenu = (event, page) =>
    contextMenu.open(event, [
      {
        label: "Edit page",
        icon: Pencil,
        onSelect: () => router.push(`/admin/pages/${page.id}`),
      },
      {
        label: page.status === "published" ? "View live" : "Not published yet",
        icon: ExternalLink,
        disabled: page.status !== "published",
        onSelect: () => window.open(`/${page.slug}`, "_blank", "noopener"),
      },
      { label: "Copy URL", icon: Link2, onSelect: () => copyUrl(page) },
      {
        label: "Export page",
        icon: Download,
        hint: "Downloads a .page.json file",
        onSelect: () => exportPage(page),
      },
      ...(manage
        ? [
            { separator: true },
            {
              label: "Duplicate page",
              icon: CopyPlus,
              hint: "Copies every block",
              onSelect: () => duplicate(page),
            },
            { separator: true },
            {
              label: "Delete page",
              icon: Trash2,
              danger: true,
              onSelect: () => remove(page),
            },
          ]
        : []),
    ]);

  // Typing a title fills the slug, but only until the author edits the slug
  // themselves — after that it is theirs and must not be overwritten.
  const setTitle = (title) =>
    setDraft((d) => ({
      title,
      slug: slugTouched
        ? d.slug
        : title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s/-]/g, "")
            .replace(/\s+/g, "-"),
    }));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter((p) =>
      `${p.title} ${p.slug}`.toLowerCase().includes(needle),
    );
  }, [pages, query]);

  const publishedCount = pages.filter((p) => p.status === "published").length;
  const blockTotal = pages.reduce((sum, p) => sum + (p.blockCount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Every public page you control, assembled from blocks.
          </p>
        </div>
        {manage && !creating && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImporting(true)}
              title="Create a page from a .page.json export"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Upload size={16} /> Import
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
            >
              <Plus size={16} /> New page
            </button>
          </div>
        )}
      </div>

      {importing && (
        <ImportPageDialog
          existingSlugs={pages.map((p) => p.slug)}
          onImported={onImported}
          onClose={() => setImporting(false)}
        />
      )}

      {pages.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Files}
            label="Total pages"
            value={pages.length}
            tone="bg-[#EEF0FA] text-[#37469E]"
          />
          <StatCard
            icon={Globe}
            label={`Published · ${pages.length - publishedCount} draft${
              pages.length - publishedCount === 1 ? "" : "s"
            }`}
            value={publishedCount}
            tone="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Layers}
            label="Blocks across all pages"
            value={blockTotal}
            tone="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {creating && (
        <form
          onSubmit={create}
          className="mb-5 rounded-2xl border border-gray-200 bg-white p-5"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            New page
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Title
              </span>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                placeholder="Microsoft Dynamics Partner — UAE"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                URL
              </span>
              <div className="flex items-center rounded-lg border border-gray-200 px-3">
                <span className="text-sm text-gray-400">/</span>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setDraft((d) => ({ ...d, slug: e.target.value }));
                  }}
                  required
                  placeholder="solutions/dynamics-365-uae"
                  className="w-full py-2 pl-0.5 text-sm outline-none"
                />
              </div>
              <span className="mt-1 block text-xs text-gray-500">
                Use slashes for nested pages. Some URLs are reserved by built-in
                pages.
              </span>
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy === "new"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {busy === "new" && <Loader2 size={15} className="animate-spin" />}
              Create & edit
            </button>
          </div>
        </form>
      )}

      {pages.length > 4 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
          <Search size={15} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages by title or URL…"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
      )}

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FA] text-[#37469E]">
            <FileText size={22} />
          </span>
          <h2 className="text-base font-semibold text-gray-900">No pages yet</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
            Create one from scratch, or run{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              npm run seed:pages
            </code>{" "}
            on the server to start from the Services and Dynamics UAE templates.
          </p>
          {manage && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
              >
                <Plus size={16} /> New page
              </button>
              {/* An empty install is exactly where an import is most likely —
                  a page carried over from staging is the fastest way to have
                  something here at all. */}
              <button
                onClick={() => setImporting(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Upload size={16} /> Import a page
              </button>
            </div>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
          No pages match “{query}”.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((page) => {
            const published = page.status === "published";
            const hiddenCount = page.blockCount - page.activeBlockCount;

            return (
              <li
                key={page.id}
                onContextMenu={(event) => openMenu(event, page)}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      published
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <FileText size={17} />
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                {/* The whole card is the link — a card where only the title is
                    clickable makes people aim. */}
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="min-w-0 after:absolute after:inset-0"
                >
                  <span className="block truncate text-[15px] font-semibold text-gray-900 group-hover:text-[#37469E]">
                    {page.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500">
                    /{page.slug}
                  </span>
                </Link>

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Layers size={13} />
                    {page.blockCount} block{page.blockCount === 1 ? "" : "s"}
                    {hiddenCount > 0 && ` · ${hiddenCount} hidden`}
                  </span>
                  {page.updatedAt && <span>· {relativeTime(page.updatedAt)}</span>}
                </div>

                {/* Above the card-wide link overlay, or these would never be
                    clickable. */}
                <div className="relative z-10 mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF0FA] px-3 py-1.5 text-xs font-semibold text-[#37469E] hover:bg-[#e2e6f7]"
                  >
                    <Pencil size={13} /> Edit
                  </Link>

                  {published && (
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View live"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  <button
                    onClick={() => copyUrl(page)}
                    title="Copy URL"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
                  >
                    <Copy size={14} />
                  </button>

                  {busy === page.id && (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  )}

                  {manage && (
                    <button
                      onClick={() => remove(page)}
                      disabled={busy === page.id}
                      title="Delete"
                      className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-600 disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages.length > 0 && (
        <p className="mt-4 text-center text-xs text-gray-400">
          Right-click a page for more actions
        </p>
      )}
    </div>
  );
}
