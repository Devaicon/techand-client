"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-bold text-red-200 mb-4">500</h1>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          We&apos;re sorry, but something unexpected happened. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-[#5B6FB6] text-white px-8 py-4 rounded-lg hover:bg-[#4a5e9d] transition-colors font-semibold"
        >
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
