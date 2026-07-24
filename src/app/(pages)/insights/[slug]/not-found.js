import Link from "next/link";

// Replaces the inline "404 — Insight Not Found" block the page used to render
// itself. Going through notFound() means the response actually carries a 404
// status, which the hand-rolled version did not.
export default function InsightNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          404 — Insight Not Found
        </h1>
        <p className="mb-8 text-gray-600">
          The insight you&apos;re looking for doesn&apos;t exist, or is not
          published yet.
        </p>
        <Link
          href="/insights"
          className="rounded-lg px-6 py-3 font-semibold text-white"
          style={{ background: "#37469E" }}
        >
          Back to Insights
        </Link>
      </div>
    </main>
  );
}
