"use client";

import { useCallback, useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";

/**
 * GET /admin/analytics/<path>, re-fetched whenever path or params change.
 *
 * `loading` is derived — "the data on hand is not for the current request" —
 * rather than set inside the effect, so the previous figures stay on screen
 * while a new range loads instead of the whole tab blanking to a spinner.
 */
export default function useAnalytics(path, params = {}, { enabled = true, refreshKey = "" } = {}) {
  const [nonce, setNonce] = useState(0);
  const query = JSON.stringify(params);
  // `refreshKey` re-fetches without being sent: the page bumps it after a sync
  // so every tab picks up the new data.
  const requestKey = `${path}|${query}|${nonce}|${refreshKey}`;
  const [state, setState] = useState({ key: null, data: null, error: "" });

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    adminApi
      .get(`/analytics/${path}`, { params: JSON.parse(query) })
      .then(({ data }) => {
        if (alive) setState({ key: requestKey, data: data.data, error: "" });
      })
      .catch((err) => {
        if (alive) {
          setState({
            key: requestKey,
            data: null,
            error: err.response?.data?.message || "Could not load analytics.",
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [path, query, requestKey, enabled]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const loading = enabled && state.key !== requestKey;

  return { data: state.data, loading, error: loading ? "" : state.error, reload };
}
