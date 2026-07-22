"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ScrollRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

function prefersLightMotion(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isInViewport(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function ScrollReveal({
  children,
  className,
}: ScrollRevealProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    setMotionEnabled(!prefersLightMotion());
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;

    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      if (cancelled || !ref.current) return;
      const node = ref.current;

      if (isInViewport(node)) return;

      ctx = gsap.context(() => {
        gsap.from(node, {
          opacity: 0,
          y: 32,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            toggleActions: "play none none none",
          },
        });
      }, node);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [motionEnabled]);

  if (!motionEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
