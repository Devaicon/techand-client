"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import ControlField from "@/components/admin/pages/controls/ControlField";
import { useAdminAuth } from "../../AdminAuthProvider";

/**
 * The site navigation editor.
 *
 * Notice how little there is here: the navbar is declared on the server as a
 * field descriptor list, so this screen is a fetch, a loop over `fields`, and a
 * save. The three-level item → column → link tree, its drag-and-drop reordering
 * and its per-row show/hide all come from the same `ControlField` /
 * `RepeaterControl` pair the block inspector uses.
 *
 * That reuse is the reason this cycle was small. A bespoke navigation editor
 * would have been a third implementation of the same nested-list UI.
 */
export default function NavbarAdminPage() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const manage = can("navbar:manage");

  const [fields, setFields] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: body } = await adminApi.get("/navbar");
      setFields(body.data.fields);
      setData(body.data.navbar.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the navbar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data: body } = await adminApi.patch("/navbar", { data });
      setData(body.data.navbar.data);
      toast.success("Navigation saved.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save the navbar.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="mt-1 text-sm text-gray-500">
            The menu shown at the top of every public page.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <ExternalLink size={15} /> View site
        </a>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {!manage && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          You have read-only access to the navigation.
        </p>
      )}

      <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5">
        <fieldset disabled={!manage} className="space-y-6">
          {fields.map((field) => (
            <ControlField
              key={field.name}
              field={field}
              value={data[field.name]}
              onChange={(next) =>
                setData((current) => ({ ...current, [field.name]: next }))
              }
            />
          ))}
        </fieldset>

        {manage && (
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save navigation
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
