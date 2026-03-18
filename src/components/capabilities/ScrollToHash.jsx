"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * ScrollToHash Component
 * Handles scrolling to hash anchors on page load and navigation
 * Accounts for fixed navigation height
 */
export default function ScrollToHash() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get hash from URL
    const hash = window.location.hash;

    if (hash) {
      // Remove the # from hash
      const id = hash.substring(1);

      // Wait for DOM to be ready and then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          // Account for fixed navigation height (sticky nav is ~60px)
          const yOffset = -80;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [searchParams]);

  return null;
}
