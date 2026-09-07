import test from "node:test";
import assert from "node:assert/strict";
import { postJson } from "./postJson.mjs";

// These assertions pin the axios-compatible contract the two contact forms
// depend on: they read `error.response?.data?.message` in their catch blocks,
// and `response.status` in the success path.

const withFetch = async (impl, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("sends a JSON body and returns the status the form checks for", async () => {
  let seen = null;
  const result = await withFetch(
    async (url, init) => {
      seen = { url, init };
      return jsonResponse(201, { ok: true });
    },
    () => postJson("https://api.example/contact-us/expert", { name: "Ada" }),
  );

  assert.equal(seen.url, "https://api.example/contact-us/expert");
  assert.equal(seen.init.method, "POST");
  assert.equal(seen.init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(seen.init.body), { name: "Ada" });
  assert.equal(result.status, 201);
});

test("rejects on a 4xx, the way axios did, exposing response.data.message", async () => {
  await withFetch(
    async () => jsonResponse(422, { message: "Email is required" }),
    async () => {
      await assert.rejects(
        () => postJson("https://api.example/x", {}),
        (error) => {
          assert.equal(error.response.status, 422);
          assert.equal(error.response.data.message, "Email is required");
          return true;
        },
      );
    },
  );
});

test("rejects on a 5xx with a non-JSON body without throwing on the parse", async () => {
  await withFetch(
    async () => new Response("<html>502</html>", { status: 502 }),
    async () => {
      await assert.rejects(
        () => postJson("https://api.example/x", {}),
        (error) => {
          assert.equal(error.response.status, 502);
          assert.equal(error.response.data, null);
          return true;
        },
      );
    },
  );
});

test("propagates a network failure so the form shows its fallback message", async () => {
  await withFetch(
    async () => {
      throw new TypeError("Failed to fetch");
    },
    () => assert.rejects(() => postJson("https://api.example/x", {})),
  );
});
