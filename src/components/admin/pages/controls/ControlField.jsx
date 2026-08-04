"use client";

import CloudinaryImageField from "@/components/admin/blog/CloudinaryImageField";
import IconField from "./IconField";
import LinkField from "./LinkField";
import RepeaterControl from "./RepeaterControl";
import {
  ListControl,
  NumberControl,
  SelectControl,
  TextControl,
  TextareaControl,
  ToggleControl,
} from "./BasicControls";

// Control name → the component that renders it.
//
// This is the client's half of the control vocabulary. The server decides which
// control a field uses and validates what comes back; this decides what the
// author touches. The names must match `server/src/blocks/controls.js` — a field
// naming a control that is missing here renders the fallback below rather than
// crashing the inspector.
//
// Three entries are adapters over components that already existed and are used
// elsewhere: the icon picker, the link pair and the Cloudinary uploader (shared
// with the blog editor, which is why it lives under `admin/blog`).
//
// A module-level object looked up by property access, not a `resolve(name)`
// helper: the React Compiler lint rule `react-hooks/static-components` cannot
// see through a function call and reports "Cannot create components during
// render".
const CONTROLS = {
  text: TextControl,
  textarea: TextareaControl,
  select: SelectControl,
  toggle: ToggleControl,
  number: NumberControl,
  list: ListControl,
  repeater: RepeaterControl,
  link: LinkControlAdapter,
  image: ImageControlAdapter,
  icon: IconControlAdapter,
};

function LinkControlAdapter({ field, value, onChange }) {
  return (
    <LinkField
      label={field.label || field.name}
      hint={field.help}
      value={value}
      onChange={onChange}
    />
  );
}

function ImageControlAdapter({ field, value, onChange }) {
  return (
    <CloudinaryImageField
      label={field.label || field.name}
      hint={field.help}
      value={value}
      onChange={onChange}
    />
  );
}

function IconControlAdapter({ field, value, onChange }) {
  return (
    <IconField
      label={field.label || field.name}
      hint={field.help}
      value={value}
      onChange={onChange}
    />
  );
}

/**
 * Renders one field from the server's descriptor.
 *
 * The whole point of the block registry: the inspector never knows which block
 * it is editing, only which controls that block declared. A block added on the
 * server with fields this panel has never seen gets a working editor with no
 * client change at all — provided it only uses controls that exist here.
 */
export default function ControlField({ field, value, onChange }) {
  const Control = CONTROLS[field.control];

  if (!Control) {
    // A server ahead of this client. Naming the control is what turns "the
    // field is just missing" into a one-line fix.
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <strong>{field.label || field.name}</strong> uses the{" "}
        <code>{field.control}</code> control, which this version of the admin
        panel cannot render. Update the client to edit it.
      </p>
    );
  }

  return <Control field={field} value={value} onChange={onChange} />;
}
