"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ControlField from "./ControlField";

// A repeating group of fields — cards, tiers, FAQ rows, timeline stages.
//
// Generic over the sub-fields the server declares in `field.of`, so this one
// component is every repeating editor the panel will ever need. The block that
// gained a `tiers` repeater in Cycle 3 gets its editor from here without anyone
// writing one.
//
// Rows are collapsed by default and open one at a time. A collection with eight
// cards, each with seven fields, is otherwise a wall of inputs with no way to
// see the shape of the list.

// Rows the author has not saved yet have no server id. A local key keeps React
// from remounting the open row on every keystroke.
let localSeq = 0;
const newRowKey = () => `new-${(localSeq += 1)}`;

const rowKeyOf = (row) => row.id || row._localKey;

function SortableRow({ row, index, field, open, onToggle, onPatch, onRemove }) {
  const key = rowKeyOf(row);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: key });

  const titleKey = field.titleKey || "title";
  const title = row[titleKey] || `Untitled ${field.rowLabel || "row"}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-gray-200 bg-white ${
        isDragging ? "z-10 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${title}`}
          className="cursor-grab rounded p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate text-sm font-medium text-gray-900">
            {title}
          </span>
          {row.hidden && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
              HIDDEN
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse" : "Expand"}
          className="rounded p-1 text-gray-400 hover:bg-gray-100"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-gray-100 px-4 py-4">
          {field.of.map((sub) => (
            <ControlField
              key={sub.name}
              field={sub}
              value={row[sub.name]}
              onChange={(next) => onPatch({ [sub.name]: next })}
            />
          ))}
        </div>
      )}
    </li>
  );
}

export default function RepeaterControl({ field, value, onChange }) {
  const rows = value || [];
  const [openKey, setOpenKey] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Without a small threshold, a click on the handle registers as a
      // zero-distance drag and the row never toggles.
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const patchRow = (index, patch) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeRow = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    onChange(next);
  };

  const addRow = () => {
    const key = newRowKey();
    onChange([...rows, { _localKey: key }]);
    setOpenKey(key);
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => rowKeyOf(r) === active.id);
    const to = rows.findIndex((r) => rowKeyOf(r) === over.id);
    if (from < 0 || to < 0) return;

    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {field.label || field.name}
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ({rows.length})
          </span>
        </span>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <Plus size={13} /> Add {field.rowLabel || "row"}
        </button>
      </div>

      {field.help && (
        <p className="mb-2 text-xs text-gray-500">{field.help}</p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
          No {field.rowLabel || "row"}s yet.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={rows.map(rowKeyOf)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {rows.map((row, index) => (
                <SortableRow
                  key={rowKeyOf(row)}
                  row={row}
                  index={index}
                  field={field}
                  open={openKey === rowKeyOf(row)}
                  onToggle={() =>
                    setOpenKey((k) => (k === rowKeyOf(row) ? null : rowKeyOf(row)))
                  }
                  onPatch={(patch) => patchRow(index, patch)}
                  onRemove={() => removeRow(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
