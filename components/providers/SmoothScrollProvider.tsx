"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface LenisScrollState {
  readonly scrollY: number;
  /** 1 = down, -1 = up, 0 = idle */
  readonly direction: -1 | 0 | 1;
}

const TOP_THRESHOLD = 72;
const SCROLLED_THRESHOLD = 12;

const LenisScrollContext = createContext<LenisScrollState>({
  scrollY: 0,
  direction: 0,
});

export function useLenisScroll(): LenisScrollState {
  return useContext(LenisScrollContext);
}

function shouldPublishScroll(prev: LenisScrollState, next: LenisScrollState): boolean {
  if (prev.direction !== next.direction) return true;

  const prevScrolled = prev.scrollY > SCROLLED_THRESHOLD;
  const nextScrolled = next.scrollY > SCROLLED_THRESHOLD;
  if (prevScrolled !== nextScrolled) return true;

  const prevAtTop = prev.scrollY < TOP_THRESHOLD;
  const nextAtTop = next.scrollY < TOP_THRESHOLD;
  if (prevAtTop !== nextAtTop) return true;

  return false;
}

interface SmoothScrollProviderProps {
  readonly children: React.ReactNode;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps): React.ReactElement {
  const [scrollState, setScrollState] = useState<LenisScrollState>({
    scrollY: 0,
    direction: 0,
  });

  useEffect(() => {
    const preferNativeScroll =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches;

    if (preferNativeScroll) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    let lenis: import("lenis").default | null = null;
    let unsubscribe = (): void => {};
    let frameId = 0;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });

      unsubscribe = lenis.on("scroll", (instance) => {
        const next: LenisScrollState = {
          scrollY: instance.scroll,
          direction: instance.direction as -1 | 0 | 1,
        };

        setScrollState((prev) => (shouldPublishScroll(prev, next) ? next : prev));
      });

      function raf(time: number): void {
        lenis?.raf(time);
        frameId = requestAnimationFrame(raf);
      }

      frameId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      cancelAnimationFrame(frameId);
      lenis?.destroy();
      root.classList.remove("lenis", "lenis-smooth");
    };
  }, []);

  return (
    <LenisScrollContext.Provider value={scrollState}>{children}</LenisScrollContext.Provider>
  );
}
