"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SlideInEdgeProps {
  readonly children: ReactNode;
  readonly from?: "start" | "end" | "bottom";
  readonly delay?: number;
  readonly className?: string;
  readonly amount?: number;
}

export function SlideInEdge({
  children,
  from = "start",
  delay = 0,
  className,
  amount = 72,
}: SlideInEdgeProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  const initial =
    from === "bottom"
      ? { opacity: 0, y: amount }
      : from === "end"
        ? { opacity: 0, x: amount }
        : { opacity: 0, x: -amount };

  const animate = { opacity: 1, x: 0, y: 0 };

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px", amount: 0.2 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
