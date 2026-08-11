"use client";

import { useEffect, useState } from "react";

export type DocumentTheme = "light" | "dark";

function readTheme(): DocumentTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/** Syncs to `<html data-theme>` (ThemeToggle / ThemeInit). SSR + first paint stay `dark`. */
export function useDocumentTheme(): DocumentTheme {
  const [theme, setTheme] = useState<DocumentTheme>("dark");

  useEffect(() => {
    setTheme(readTheme());

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") setTheme(readTheme());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return theme;
}
