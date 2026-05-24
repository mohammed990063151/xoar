"use client";

import Lenis from "lenis";
import { useEffect } from "react";

interface SmoothScrollProviderProps {
  readonly children: React.ReactNode;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps): React.ReactElement {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frameId = 0;

    function raf(time: number): void {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
