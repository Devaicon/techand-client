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
 * Both insight work queues, fetched once for the whole panel.
 *
 * A submitted post passes through two of them — artwork, then approval — and
 * several places need each count at the same time: the sidebar badges, the
 * overview sections, and the dedicated pages. Fetching per component would mean
 * a request per view on every navigation and, worse, several copies of the
 * truth: approving a post on the overview would leave the sidebar still
 * claiming it is waiting.
 *
 * Each queue is gated on its own permission. Without it the endpoint 403s, so
 * it is never called and that queue stays empty — the matching sidebar entry
 * and overview section are hidden in that case anyway.
 *
 * Was PendingApprovalsProvider, when approval was the only stage.
 */

const BlogQueuesContext = createContext(null);

export function BlogQueuesProvider({ children }) {
  const { user, can } = useAdminAuth();
  const canApprove = can("blog:approve");
  const canIllustrate = can("blog:illustrate");

  const [approvals, setApprovals] = useState([]);
  const [artwork, setArtwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!canApprove && !canIllustrate) {
      setApprovals([]);
      setArtwork([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Both in flight together — someone who works both stages should not wait
      // for the first list to arrive before the second is asked for.
      const [pending, needsImages] = await Promise.all([
        canApprove ? adminApi.get("/blogs/pending") : null,
        canIllustrate ? adminApi.get("/blogs/needs-images") : null,
      ]);
      setApprovals(pending ? pending.data.data.blogs : []);
      setArtwork(needsImages ? needsImages.data.data.blogs : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the work queues.");
    } finally {
      setLoading(false);
    }
  }, [canApprove, canIllustrate]);

  // Waits for the session: `can` is false until /auth/me resolves, so firing
  // before that would decide the user has no queues and never look again.
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // The single writer for approvals. Every approve/reject in the panel goes
  // through here so the decided post leaves all views at once — dropping it
  // locally on success rather than refetching keeps the row from flickering
  // back in.
  const decide = useCallback(async (id, decision, note = "") => {
    const { data } = await adminApi.patch(`/blogs/${id}/review`, {
      decision,
      note,
    });
    setApprovals((list) => list.filter((b) => b.id !== id));
    return data.data.blog;
  }, []);

  // Artwork done. The post moves between the two queues rather than leaving,
  // so a user who works both stages watches it cross from one list to the
  // other instead of vanishing and reappearing on the next refresh.
  const markImagesReady = useCallback(
    async (id) => {
      const { data } = await adminApi.post(`/blogs/${id}/images-ready`);
      const moved = data.data.blog;
      setArtwork((list) => list.filter((b) => b.id !== id));
      if (canApprove) setApprovals((list) => [...list, moved]);
      return moved;
    },
    [canApprove],
  );

  const value = useMemo(
    () => ({
      approvals,
      artwork,
      approvalCount: approvals.length,
      artworkCount: artwork.length,
      loading,
      error,
      canApprove,
      canIllustrate,
      refresh,
      decide,
      markImagesReady,
    }),
    [
      approvals,
      artwork,
      loading,
      error,
      canApprove,
      canIllustrate,
      refresh,
      decide,
      markImagesReady,
    ],
  );

  return (
    <BlogQueuesContext.Provider value={value}>
      {children}
    </BlogQueuesContext.Provider>
  );
}

export function useBlogQueues() {
  const ctx = useContext(BlogQueuesContext);
  if (!ctx) {
    throw new Error("useBlogQueues must be used within BlogQueuesProvider");
  }
  return ctx;
}
