"use client";

import { createContext, useContext, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenisInstance } from "@/lib/scroll-to";

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

    gsap.registerPlugin(ScrollTrigger);

    let lenis: import("lenis").default | null = null;
    let unsubscribe = (): void => {};
    let tickerFn: ((time: number) => void) | null = null;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });

      setLenisInstance(lenis);

      ScrollTrigger.scrollerProxy(root, {
        scrollTop(value) {
          if (!lenis) return 0;
          if (arguments.length && typeof value === "number") {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      lenis.on("scroll", ScrollTrigger.update);

      const unsubState = lenis.on("scroll", (instance) => {
        const next: LenisScrollState = {
          scrollY: instance.scroll,
          direction: instance.direction as -1 | 0 | 1,
        };

        setScrollState((prev) => (shouldPublishScroll(prev, next) ? next : prev));
      });

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();

      unsubscribe = () => {
        unsubState();
      };
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
      setLenisInstance(null);
      ScrollTrigger.scrollerProxy(root, {});
      root.classList.remove("lenis", "lenis-smooth");
    };
  }, []);

  return (
    <LenisScrollContext.Provider value={scrollState}>{children}</LenisScrollContext.Provider>
  );
}
