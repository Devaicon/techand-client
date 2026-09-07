// A single JSON POST, on the platform's own fetch.
//
// These two public contact forms used axios for one `axios.post` each, which
// put ~58 KB of axios in the bundle of every page carrying a form — the home
// page included. fetch does the same job here: there are no interceptors, no
// retries and no cancellation involved, which is what adminApi actually needs
// axios for.
//
// The thrown error keeps axios's `error.response.data` shape so callers can go
// on reading `error.response?.data?.message` unchanged.
export async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // fetch resolves on 4xx/5xx; axios rejects. Match axios so the callers'
  // try/catch still sees a failed submit as a failure.
  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body — leave data null */
  }

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.response = { status: response.status, data };
    throw error;
  }

  return { status: response.status, data };
}
