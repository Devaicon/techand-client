"use client";

import { Plus, Trash2 } from "lucide-react";

// Per-post FAQs, rendered as an accordion at the end of the article. Each row
// is a question + a plain-text answer (line breaks in the answer are preserved
// on the reader). No rich text: answers never pass through the HTML sanitizer.
export default function FaqRepeater({ value = [], onChange }) {
  const update = (index, fields) =>
    onChange(value.map((f, i) => (i === index ? { ...f, ...fields } : f)));

  const add = () => onChange([...value, { question: "", answer: "" }]);

  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          No FAQs yet. These appear as an accordion at the end of the article.
        </p>
      )}

      {value.map((faq, index) => (
        <div
          // Index key is safe here: FAQ rows carry no external references and
          // are only ever appended or removed.
          key={index}
          className="rounded-xl border border-gray-200 bg-gray-50/60 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              FAQ {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              title="Remove FAQ"
              className="text-gray-400 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={faq.question}
              onChange={(e) => update(index, { question: e.target.value })}
              placeholder="Question — e.g. Is agentic AI enterprise-ready?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => update(index, { answer: e.target.value })}
              placeholder="Answer"
              rows={3}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#37469E] hover:text-[#37469E]"
      >
        <Plus size={15} /> Add FAQ
      </button>
    </div>
  );
}
