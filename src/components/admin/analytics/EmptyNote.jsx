"use client";

export default function EmptyNote({ children = "No data for this period yet." }) {
  return <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{children}</p>;
}
