"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  enableManualScrollRestoration,
  scheduleScrollToTop,
  cancelScheduledScrollToTop,
} from "@/lib/scroll-to";

function shouldSkipScrollToTop(): boolean {
  const hash = window.location.hash;
  return hash.length > 1;
}

/**
 * Ensures every client-side route change starts at the top of the page.
 * Skips when the URL has a hash so in-page anchors (e.g. #book) still work.
 */
export function ScrollToTopOnNavigate(): null {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    enableManualScrollRestoration();
  }, []);

  useLayoutEffect(() => {
    const isNavigation =
      previousPathname.current !== null && previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (!isNavigation || shouldSkipScrollToTop()) {
      return;
    }

    cancelScheduledScrollToTop();
    scheduleScrollToTop();

    return () => {
      cancelScheduledScrollToTop();
    };
  }, [pathname]);

  return null;
}
