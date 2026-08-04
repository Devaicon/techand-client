"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Plus, Pencil, Trash2, Star, Search, Send, Eye,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useAdminAuth } from "../../AdminAuthProvider";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function BlogsPage() {
  const toast = useToast();
  const { can } = useAdminAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.get("/blogs", {
        params: { status, q: query || undefined },
      });
      setBlogs(data.data.blogs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load insights.");
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  // Debounced so typing in the search box does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const patchLocal = (updated) =>
    setBlogs((bs) => bs.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));

  const toggleFeatured = async (blog) => {
    setBusyId(blog.id);
    try {
      const { data } = await adminApi.patch(`/blogs/${blog.id}/featured`, {
        isFeatured: !blog.isFeatured,
      });
      patchLocal(data.data.blog);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (blog) => {
    setBusyId(blog.id);
    try {
      const next = blog.status === "published" ? "draft" : "published";
      const { data } = await adminApi.patch(`/blogs/${blog.id}/status`, { status: next });
      patchLocal(data.data.blog);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change status.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (blog) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setBusyId(blog.id);
    try {
      await adminApi.delete(`/blogs/${blog.id}`);
      setBlogs((bs) => bs.filter((b) => b.id !== blog.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = async (blog) => {
    setBusyId(blog.id);
    try {
      const { data } = await adminApi.get(`/blogs/${blog.id}/preview-link`);
      window.open(data.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not build a preview link.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        {can("blog:create") && (
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
          >
            <Plus size={16} /> New insight
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#37469E] focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              aria-pressed={status === f.value}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                status === f.value ? "bg-white text-[#37469E] shadow-sm" : "text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#37469E]" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="mb-1 text-gray-600">No insights found</p>
          <p className="text-sm text-gray-500">
            {query || status !== "all"
              ? "Try a different search or filter."
              : "Create your first post to get started."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((b) => (
                <tr key={b.id} className={busyId === b.id ? "opacity-50" : ""}>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => can("blog:update") && toggleFeatured(b)}
                        disabled={!can("blog:update")}
                        title={b.isFeatured ? "Remove from Featured blogs" : "Add to Featured blogs"}
                        className="mt-0.5 disabled:cursor-default"
                      >
                        <Star
                          size={15}
                          className={b.isFeatured ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      </button>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{b.title}</p>
                        <p className="truncate text-xs text-gray-500">/insights/{b.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        b.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.category}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(b.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {b.status !== "published" && can("blog:read") && (
                        <button
                          onClick={() => openPreview(b)}
                          title="Preview draft"
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {can("blog:publish") && (
                        <button
                          onClick={() => toggleStatus(b)}
                          title={b.status === "published" ? "Unpublish" : "Publish"}
                          className="text-gray-400 hover:text-[#37469E]"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {can("blog:update") && (
                        <Link
                          href={`/admin/blogs/${b.id}/edit`}
                          title="Edit"
                          className="rounded-lg p-1.5 text-[#37469E] hover:bg-[#EEF0FA]"
                        >
                          <Pencil size={16} />
                        </Link>
                      )}
                      {can("blog:delete") && (
                        <button
                          onClick={() => remove(b)}
                          title="Delete"
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
