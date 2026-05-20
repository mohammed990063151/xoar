"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import type { Dictionary } from "@/lib/dictionary";
interface ActivitiesClientProps {
  readonly dict: Dictionary["pages"]["activities"];
  readonly activityTabs: Dictionary["activityTabs"];
  readonly activityCards: Dictionary["activityCards"];
  readonly cta: string;
  readonly formTitle: string;
}

export function ActivitiesClient({
  dict,
  activityTabs,
  activityCards,
  cta,
  formTitle,
}: ActivitiesClientProps): React.ReactElement {
  const search = useSearchParams();
  const [active, setActive] = useState(activityTabs[0]?.id ?? "yoga");

  useEffect(() => {
    const f = search.get("focus");
    if (f && activityTabs.some((t) => t.id === f)) setActive(f);
  }, [search, activityTabs]);

  const current =
    activityCards.items.find((item) => item.id === active) ?? activityCards.items[0];

  if (!current) {
    return <div className={cn(siteContainer, "py-16")} />;
  }

  return (
    <div className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <h1 className="text-3xl font-bold sm:text-4xl">{dict.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{dict.intro}</p>
      </ScrollReveal>

      <div className="mt-10 flex flex-wrap justify-center gap-2 sm:justify-start">
        {activityTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-medium transition",
              active === tab.id
                ? "border-transparent text-white"
                : "border-white/15 text-slate-300 hover:text-white",
            )}
          >
            {active === tab.id ? (
              <motion.span
                layoutId="actTab"
                className="absolute inset-0 bg-gradient-to-l from-violet-600/80 to-cyan-600/60"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{tab.short}</span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-lg">
        <ActivityCard
          key={current.id}
          activity={current}
          organizerLabel={activityCards.organizerLabel}
          bookCta={cta}
          formTitle={formTitle}
        />
      </div>
    </div>
  );
}
