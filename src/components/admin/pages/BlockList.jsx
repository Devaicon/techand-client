"use client";

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
import {
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { BLOCK_GLYPHS, FALLBACK_GLYPH } from "./blockGlyphs";

/**
 * One line of description under a block's name.
 *
 * Generic over the registry rather than a switch on `type`: it counts the rows
 * in whatever repeaters a block declares and shows whatever `select` fields it
 * has. A block added in a later cycle gets a sensible summary with no change
 * here — which is the difference between this and the hardcoded
 * `"platform · copy left · 2 cards"` it replaces.
 */
const summarise = (definition, props) => {
  if (!definition) return "Unknown block type";

  const parts = [];

  for (const field of definition.fields) {
    if (field.control === "select" && props?.[field.name]) {
      parts.push(props[field.name]);
    }
    if (field.control === "repeater") {
      const count = (props?.[field.name] || []).length;
      const noun = field.rowLabel || "item";
      parts.push(`${count} ${noun}${count === 1 ? "" : "s"}`);
    }
  }

  return parts.join(" · ") || definition.blurb;
};

// The block's own heading, whichever field carries it. Falls back through the
// usual suspects so a header block shows its title and a CTA shows its heading.
const titleOf = (props) =>
  props?.heading || props?.headline || props?.title || "";

function SortableBlock({
  section,
  definition,
  manage,
  busy,
  selected,
  onEdit,
  onToggle,
  onRemove,
  onDuplicate,
  onCopy,
  onContextMenu,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id, disabled: !manage });

  const Glyph = BLOCK_GLYPHS[definition?.icon] || FALLBACK_GLYPH;
  const visible = section.status === "active";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onContextMenu={(event) => onContextMenu?.(event, section)}
      className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
        selected ? "bg-[#EEF0FA]" : "bg-white"
      } ${isDragging ? "relative z-10 rounded-xl shadow-lg" : ""} ${
        visible ? "" : "opacity-60"
      }`}
    >
      {manage && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${definition?.label || section.type}`}
          className="cursor-grab rounded p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
      )}

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FA] text-[#37469E]">
        <Glyph size={17} />
      </span>

      <button
        type="button"
        onClick={() => onEdit(section)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-semibold text-gray-900">
          {titleOf(section.props) || definition?.label || section.type}
        </span>
        <span className="block truncate text-xs text-gray-500">
          {definition?.label || section.type} ·{" "}
          {summarise(definition, section.props)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => manage && onToggle(section)}
        disabled={!manage || busy}
        title={manage ? "Toggle visibility" : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          visible
            ? "bg-emerald-50 text-emerald-700"
            : "bg-gray-100 text-gray-500"
        } ${manage ? "hover:opacity-80" : "cursor-default"} disabled:opacity-60`}
      >
        {visible ? <Eye size={12} /> : <EyeOff size={12} />}
        {visible ? "VISIBLE" : "HIDDEN"}
      </button>

      {busy && <Loader2 size={15} className="animate-spin text-gray-400" />}

      {/* Two buttons, not five. The panel is ~360px wide and floats over the
          canvas, so the row has to stay narrow — duplicate, copy, move and
          delete all live in the context menu, which the ⋯ button opens at the
          same place a right-click would. */}
      {manage && (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(section)}
            title="Edit"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={(event) => onContextMenu?.(event, section)}
            title="More actions"
            aria-label="More actions"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      )}
    </li>
  );
}

export default function BlockList({
  sections,
  definitions,
  manage,
  busyId,
  selectedId,
  onEdit,
  onToggle,
  onRemove,
  onReorder,
  onDuplicate,
  onCopy,
  onContextMenu,
  onDragStart,
}) {
  const sensors = useSensors(
    // A few pixels of travel before a drag starts, so clicking the handle does
    // not register as a zero-distance drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Keyboard reordering comes free with dnd-kit's sensor — which is most of
    // why it was worth a dependency over hand-rolled drag handlers.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0) return;

    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  if (sections.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-sm text-gray-500">
        No blocks yet. Add the first one to start building this page.
      </p>
    );
  }

  const byType = new Map(definitions.map((d) => [d.type, d]));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // Announced so the editor can zoom the preview out to the whole page for
      // the duration of the drag — dropping a block between two others is a
      // decision about the page's shape, and you cannot make it at 100%.
      onDragStart={() => onDragStart?.()}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="divide-y divide-gray-100">
          {sections.map((section) => (
            <SortableBlock
              key={section.id}
              section={section}
              definition={byType.get(section.type)}
              manage={manage}
              busy={busyId === section.id}
              selected={selectedId === section.id}
              onEdit={onEdit}
              onToggle={onToggle}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onCopy={onCopy}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
