"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface HomeAmbientMotionProps {
  readonly locale: "ar" | "en";
}

export function HomeAmbientMotion({ locale }: HomeAmbientMotionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const rtl = locale === "ar";

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setEnabled(!mobile);
  }, []);

  if (reduceMotion || !enabled) {
    return <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className={cn(
          "absolute top-[18%] h-40 w-40 rounded-full bg-violet-600/20 blur-3xl sm:h-56 sm:w-56",
          rtl ? "-right-[6%]" : "-left-[6%]",
        )}
        initial={{ x: rtl ? 140 : -140, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={cn(
          "absolute top-[42%] h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl sm:h-48 sm:w-48",
          rtl ? "-left-[5%]" : "-right-[5%]",
        )}
        initial={{ x: rtl ? -120 : 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={cn(
          "absolute bottom-[28%] h-24 w-24 rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm",
          rtl ? "right-[10%]" : "left-[10%]",
        )}
        initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.3 }}
      />
      <motion.div
        className={cn(
          "absolute bottom-[38%] h-20 w-20 rounded-full border border-cyan-400/25 bg-cyan-500/10",
          rtl ? "left-[8%]" : "right-[8%]",
        )}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.45 }}
      />
    </div>
  );
}
