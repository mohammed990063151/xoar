"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Dictionary } from "@/lib/dictionary";

interface AchievementsProps {
  readonly data: Dictionary["achievements"];
}

export function Achievements({
  data,
}: AchievementsProps): React.ReactElement {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="text-center text-3xl font-bold">{data.title}</h2>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value={10} suffix="+" label={data.years} />
        <Stat value={20} suffix="+" label={data.cities} />
        <Stat value={350} suffix="+" label={data.events} />
        <Stat value={150} suffix="+" label={data.clients} />
      </div>
      <ScrollReveal>
        <p className="mt-12 text-center text-sm text-slate-400">{data.vision}</p>
      </ScrollReveal>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label,
}: {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}): React.ReactElement {
  const [n, setN] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setN(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <motion.div
      className="gradient-border"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex flex-col items-center gap-2 p-6 text-center">
        <span className="text-4xl font-bold tabular-nums text-white">
          {n}
          {suffix}
        </span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
    </motion.div>
  );
}
