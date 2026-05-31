import { useEffect, useState } from "react";
import { useLenisScroll } from "@/components/providers/SmoothScrollProvider";

const TOP_THRESHOLD = 72;

/**
 * Header stays visible at top, hides on scroll down, reappears on scroll up.
 * Force visible when mobile menu is open.
 */
export function useHeaderPinned(menuOpen: boolean): {
  readonly pinned: boolean;
  readonly scrolled: boolean;
} {
  const { scrollY, direction } = useLenisScroll();
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (menuOpen || scrollY < TOP_THRESHOLD) {
      setPinned(true);
      return;
    }
    if (direction === 1) {
      setPinned(false);
    } else if (direction === -1) {
      setPinned(true);
    }
  }, [menuOpen, scrollY, direction]);

  return {
    pinned,
    scrolled: scrollY > 12,
  };
}
