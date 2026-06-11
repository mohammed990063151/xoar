"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState } from "react";

export interface LenisScrollState {
  readonly scrollY: number;
  /** 1 = down, -1 = up, 0 = idle */
  readonly direction: -1 | 0 | 1;
}

const LenisScrollContext = createContext<LenisScrollState>({
  scrollY: 0,
  direction: 0,
});

export function useLenisScroll(): LenisScrollState {
  return useContext(LenisScrollContext);
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
    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    const unsubscribe = lenis.on("scroll", (instance) => {
      setScrollState({
        scrollY: instance.scroll,
        direction: instance.direction,
      });
    });

    let frameId = 0;

    function raf(time: number): void {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      unsubscribe();
      cancelAnimationFrame(frameId);
      lenis.destroy();
      root.classList.remove("lenis", "lenis-smooth");
    };
  }, []);

  return (
    <LenisScrollContext.Provider value={scrollState}>{children}</LenisScrollContext.Provider>
  );
}
