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

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 64,
        rotateX: 6,
        filter: "blur(8px)",
        transformOrigin: "50% 80%",
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ perspective: "1200px" }}>
      {children}
    </div>
  );
}
