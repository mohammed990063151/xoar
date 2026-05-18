"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { XoraLogo } from "@/components/brand/XoraLogo";
import type { Dictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

interface AchievementsProps {
  readonly data: Dictionary["achievements"];
}

export function Achievements({
  data,
}: AchievementsProps): React.ReactElement {
  const hasTitle = Boolean(data.title?.trim());

  return (
    <section className={cn(siteContainer, "pb-12 pt-8")}>
      {hasTitle ? (
        <ScrollReveal>
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">{data.title}</h2>
        </ScrollReveal>
      ) : null}
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${hasTitle ? "mt-12" : "mt-0"}`}
      >
        <Stat value={10} suffix="+" label={data.years} icon={<IconStar />} />
        <Stat value={20} suffix="+" label={data.cities} icon={<IconPin />} />
        <Stat value={350} suffix="+" label={data.events} icon={<IconCalendar />} />
        <Stat value={150} suffix="+" label={data.clients} icon={<IconUsers />} />
      </div>
      <ScrollReveal>
        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/5 pt-12">
          <p className="max-w-xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
            {data.vision}
          </p>
          <div className="mt-1" role="img" aria-label="xora">
            <XoraLogo size="md" />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label,
  icon,
}: {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}): React.ReactElement {
  const [n, setN] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      controls = animate(0, value, {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          if (!cancelled) setN(Math.round(latest));
        },
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      controls?.stop();
    };
  }, [value]);

  return (
    <motion.div
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-8 text-center backdrop-blur-sm"
      whileHover={{ y: -4, borderColor: "rgba(168, 85, 247, 0.35)" }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/25 text-purple-300/90">
        {icon}
      </span>
      <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
        {n}
        {suffix}
      </span>
      <span className="text-sm text-slate-400">{label}</span>
    </motion.div>
  );
}

function IconStar(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.7L12 16.9 6.8 18.9l1-5.7L3.6 9.1l5.8-.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconCalendar(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M21 19c0-2-1.5-3.5-3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
