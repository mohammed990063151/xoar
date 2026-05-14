"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function ScrollReveal({
  children,
  className,
}: ScrollRevealProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      if (cancelled || !ref.current) return;
      const node = ref.current;
      ctx = gsap.context(() => {
        gsap.from(node, {
          opacity: 0,
          y: 64,
          rotateX: 6,
          filter: "blur(8px)",
          transformOrigin: "50% 80%",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: node,
            start: "top 88%",
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
  }, []);

  return (
    <div ref={ref} className={className} style={{ perspective: "1200px" }}>
      {children}
    </div>
  );
}
