"use client";

// The controls with no state of their own: a label, an input, an optional hint.
//
// Every control in this system takes the same three props — `field` (the
// server's descriptor), `value`, and `onChange` — so the inspector can render
// any of them without knowing which it has. Adding a control type means adding
// one component here and one entry in `index.js`.

const labelFor = (field) => field.label || field.name;

function Field({ field, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {labelFor(field)}
        {field.required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {field.help && (
        <span className="mb-2 block text-xs text-gray-500">{field.help}</span>
      )}
      {children}
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#37469E] focus:outline-none focus:ring-1 focus:ring-[#37469E]";

export function TextControl({ field, value, onChange }) {
  return (
    <Field field={field}>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={INPUT_CLASS}
      />
    </Field>
  );
}

export function TextareaControl({ field, value, onChange }) {
  return (
    <Field field={field}>
      <textarea
        rows={4}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${INPUT_CLASS} resize-y`}
      />
    </Field>
  );
}

export function SelectControl({ field, value, onChange }) {
  const options = field.options || [];
  return (
    <Field field={field}>
      <select
        value={value ?? options[0]?.value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label || option.value}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function NumberControl({ field, value, onChange }) {
  return (
    <Field field={field}>
      <input
        type="number"
        value={value ?? ""}
        min={field.min}
        max={field.max}
        step={field.step ?? (field.max <= 1 ? 0.1 : 1)}
        // An empty input parses to NaN, which the server rejects as "expected
        // number". Falling back to the field's floor keeps a half-typed value
        // from becoming an error banner.
        onChange={(e) => {
          const parsed = Number.parseFloat(e.target.value);
          onChange(Number.isNaN(parsed) ? (field.min ?? 0) : parsed);
        }}
        className={INPUT_CLASS}
      />
    </Field>
  );
}

// A checkbox rather than the `<Field>` wrapper: the label belongs beside the
// box, not above it.
export function ToggleControl({ field, value, onChange }) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#37469E] focus:ring-[#37469E]"
        />
        <span className="text-sm font-medium text-gray-700">
          {labelFor(field)}
        </span>
      </label>
      {field.help && (
        <p className="mt-1 pl-[26px] text-xs text-gray-500">{field.help}</p>
      )}
    </div>
  );
}

// A list of plain strings — bullet points, feature lines.
//
// A trailing blank row is always shown so there is somewhere to type; the server
// drops blanks on save, which is why this does not need an explicit "add" button
// or any validation of its own.
export function ListControl({ field, value, onChange }) {
  const rows = [...(value || []), ""];

  const setRow = (index, text) => {
    const next = [...(value || [])];
    next[index] = text;
    onChange(next);
  };

  const removeRow = (index) => {
    const next = [...(value || [])];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <Field field={field}>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={row}
              onChange={(e) => setRow(index, e.target.value)}
              placeholder="Add a line…"
              className={INPUT_CLASS}
            />
            {index < rows.length - 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Remove line ${index + 1}`}
                className="shrink-0 rounded-lg px-2 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </Field>
  );
}
