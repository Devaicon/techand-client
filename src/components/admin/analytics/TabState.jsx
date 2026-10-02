"use client";

export function ErrorNote({ message }) {
  return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{message}</p>;
}

export const compareLabelFor = (range) =>
  range.compare === "year" ? "Same period last year" : "Previous period";
