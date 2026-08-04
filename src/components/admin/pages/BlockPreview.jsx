"use client";

import { Component, useEffect, useRef, useState } from "react";
import { BLOCK_COMPONENTS } from "@/components/blocks";
import BlockThumbnail from "./BlockThumbnail";
import blockSampleProps from "./blockSampleProps";

/**
 * The real block, rendered small, with sample content.
 *
 * The palette used to show a wireframe sketch per block. A sketch is honest
 * about layout and silent about everything else — an author picking between
 * "Statement banner" and "CTA band" learned nothing from two similar grey
 * shapes. This renders the actual component the public page will use, so what
 * is previewed is what gets added.
 *
 * Three things keep that safe:
 *
 *   - Sample props, not defaults. See `blockSampleProps`.
 *   - An error boundary. A block that throws on synthetic content degrades to
 *     the old wireframe instead of taking the editor down with it.
 *   - An opt-out list for blocks that cannot render here at all.
 */

// `insights-feed` is an async Server Component that reads the Blog collection;
// a client component cannot render one, and a palette has no business querying
// the database. It keeps the wireframe.
const NO_LIVE_PREVIEW = new Set(["insights-feed"]);

// The width the public page is designed against. The preview renders at this
// width and is scaled down to fit, rather than rendered narrow — a block at
// 360px would show its mobile layout, which is not what the author is picking.
const DESIGN_WIDTH = 1280;

class PreviewBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    // Reset when the author previews a different block, or the boundary would
    // stay tripped for the rest of the session.
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function BlockPreview({ definition, className = "" }) {
  const frameRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0.25);
  const [height, setHeight] = useState(220);

  // The scale depends on the pane's width and the height on what the block
  // actually rendered, so both are measured rather than assumed. A block is
  // anywhere between a 120px banner and a 900px pricing table.
  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return undefined;

    const measure = () => {
      const next = frame.clientWidth / DESIGN_WIDTH;
      setScale(next);
      setHeight(Math.max(140, inner.scrollHeight * next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [definition.type]);

  const Component_ = BLOCK_COMPONENTS[definition.type];
  const wireframe = (
    <div className="flex h-full items-center justify-center bg-gray-50 p-6">
      <BlockThumbnail
        definition={definition}
        className="h-28 w-48 rounded border border-gray-200"
      />
    </div>
  );

  if (!Component_ || NO_LIVE_PREVIEW.has(definition.type)) {
    return (
      <div
        className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
      >
        {wireframe}
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
      style={{ height }}
    >
      {/* `inert` and `pointer-events-none`: this is a picture of a block, not a
          working one. Without it the preview's own buttons and tabs are
          focusable, and tabbing through the palette walks into them. */}
      <div
        inert
        className="pointer-events-none origin-top-left"
        style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
      >
        <div ref={innerRef}>
          <PreviewBoundary resetKey={definition.type} fallback={wireframe}>
            <Component_ props={blockSampleProps(definition)} />
          </PreviewBoundary>
        </div>
      </div>
    </div>
  );
}
