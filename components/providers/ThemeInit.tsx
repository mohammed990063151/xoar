"use client";

import { useEffect } from "react";

/**
 * Initializes `data-theme` on <html> without inline <script>.
 * Root SSR stays `dark` to avoid hydration mismatch; we update after mount.
 */
export function ThemeInit(): null {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const themeFromStorage =
        saved === "light" || saved === "dark" ? saved : null;

      const prefersLight =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;

      const nextTheme = themeFromStorage ?? (prefersLight ? "light" : "dark");
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
    } catch {
      // ignore
    }
  }, []);

  return null;
}

