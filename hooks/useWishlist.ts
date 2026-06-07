"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "xoar_wishlist_v1";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

function sanitizeSlug(slug: string): string | null {
  const trimmed = slug.trim().toLowerCase();
  return SLUG_PATTERN.test(trimmed) ? trimmed : null;
}

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(sanitizeSlug)
      .filter((s): s is string => s !== null);
  } catch {
    return [];
  }
}

function writeStorage(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, 50)));
  } catch {
    /* quota or private mode */
  }
}

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readStorage());
  }, []);

  const toggle = useCallback((slug: string) => {
    const safe = sanitizeSlug(slug);
    if (!safe) return;
    setSlugs((prev) => {
      const next = prev.includes(safe)
        ? prev.filter((s) => s !== safe)
        : [...prev, safe];
      writeStorage(next);
      return next;
    });
  }, []);

  const has = useCallback(
    (slug: string) => {
      const safe = sanitizeSlug(slug);
      return safe ? slugs.includes(safe) : false;
    },
    [slugs],
  );

  return { slugs, toggle, has };
}
