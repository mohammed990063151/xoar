"use client";

import { motion } from "framer-motion";

const confetti = [
  { id: 0, w: 6, h: 10, left: "12%", top: "28%", rot: 12, color: "#f472b6", delay: 0 },
  { id: 1, w: 8, h: 6, left: "42%", top: "22%", rot: -24, color: "#7dd3fc", delay: 0.3 },
  { id: 2, w: 5, h: 9, left: "68%", top: "34%", rot: 40, color: "#c084fc", delay: 0.6 },
  { id: 3, w: 7, h: 7, left: "78%", top: "18%", rot: -8, color: "#fde047", delay: 0.2 },
  { id: 4, w: 6, h: 8, left: "22%", top: "48%", rot: -32, color: "#a78bfa", delay: 0.9 },
  { id: 5, w: 9, h: 5, left: "55%", top: "52%", rot: 22, color: "#34d399", delay: 0.45 },
] as const;

/** Lightweight celebration motif (lights + confetti) — replaces heavy 3D in hero. */
export function HeroCelebrationGraphic(): React.ReactElement {
  return (
    <div
      className="pointer-events-none absolute end-0 top-0 h-[min(420px,50vh)] w-[min(400px,90vw)] sm:h-[min(460px,54vh)] sm:w-[min(440px,85vw)]"
      aria-hidden
    >
      <svg
        className="h-full w-full text-purple-300/90"
        viewBox="0 0 320 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin meet"
      >
        <defs>
          <radialGradient id="heroSpot" cx="50%" cy="0%" r="75%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.35)" />
            <stop offset="45%" stopColor="rgba(59, 130, 246, 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="heroWire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.45)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.45)" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill="url(#heroSpot)" />
        <path
          d="M40 48 Q160 12 300 52"
          stroke="url(#heroWire)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        {[52, 88, 124, 162, 200, 238, 276].map((x, i) => (
          <circle
            key={x}
            cx={x + i * 3}
            cy={46 + Math.sin(i * 0.9) * 6}
            r={i % 3 === 0 ? 4 : 3}
            fill={i % 2 === 0 ? "#f0abfc" : "#7dd3fc"}
            opacity="0.9"
          />
        ))}
        <path
          d="M60 120 Q100 80 140 120 T220 118 Q260 100 300 130"
          stroke="rgba(244, 114, 182, 0.35)"
          strokeWidth="1.2"
          strokeDasharray="6 10"
          strokeLinecap="round"
        />
        <path
          d="M80 200 L120 160 L160 200 L200 168 L240 200 L280 175"
          stroke="rgba(125, 211, 252, 0.25)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {confetti.map((c) => (
        <motion.span
          key={c.id}
          className="absolute rounded-sm shadow-sm"
          style={{
            width: c.w,
            height: c.h,
            left: c.left,
            top: c.top,
            background: c.color,
            rotate: c.rot,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: [0.35, 0.85, 0.45],
            y: [0, -18, -6],
            rotate: [c.rot, c.rot + 18, c.rot - 8],
          }}
          transition={{
            duration: 4.2 + c.id * 0.15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: c.delay,
          }}
        />
      ))}
    </div>
  );
}
