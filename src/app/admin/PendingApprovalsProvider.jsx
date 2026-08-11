"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "./AdminAuthProvider";

/**
 * The approval queue, fetched once for the whole panel.
 *
 * Three places need it at the same time — the sidebar's count badge, the
 * "Waiting for your approval" section on the overview, and the Approvals page
 * itself. Fetching per component would mean three requests on every navigation
 * and, worse, three copies of the truth: approving a post on the overview would
 * leave the sidebar still claiming it is waiting.
 *
 * Reviewers only. Without blog:approve the endpoint 403s, so it is never
 * called and the queue stays empty — the sidebar entry and the overview section
 * are both hidden in that case anyway.
 */

const PendingApprovalsContext = createContext(null);

export function PendingApprovalsProvider({ children }) {
  const { user, can } = useAdminAuth();
  const canApprove = can("blog:approve");

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!canApprove) {
      setBlogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.get("/blogs/pending");
      setBlogs(data.data.blogs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the approval queue.");
    } finally {
      setLoading(false);
    }
  }, [canApprove]);

  // Waits for the session: `can` is false until /auth/me resolves, so firing
  // before that would decide the reviewer has no queue and never look again.
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // The single writer. Every approve/reject in the panel goes through here so
  // the decided post leaves all three views at once — dropping it locally on
  // success rather than refetching keeps the row from flickering back in.
  const decide = useCallback(async (id, decision, note = "") => {
    const { data } = await adminApi.patch(`/blogs/${id}/review`, {
      decision,
      note,
    });
    setBlogs((list) => list.filter((b) => b.id !== id));
    return data.data.blog;
  }, []);

  const value = useMemo(
    () => ({ blogs, count: blogs.length, loading, error, canApprove, refresh, decide }),
    [blogs, loading, error, canApprove, refresh, decide],
  );

  return (
    <PendingApprovalsContext.Provider value={value}>
      {children}
    </PendingApprovalsContext.Provider>
  );
}

export function usePendingApprovals() {
  const ctx = useContext(PendingApprovalsContext);
  if (!ctx) {
    throw new Error(
      "usePendingApprovals must be used within PendingApprovalsProvider",
    );
  }
  return ctx;
}
