"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { BookButton } from "@/components/ui/BookButton";
import { cn } from "@/lib/cn";
import { activityIcons } from "@/lib/activity-icons";
import { siteContainer } from "@/lib/layout";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

const longText: Record<string, { ar: string; en: string }> = {
  yoga: {
    ar: "جلسات يوجا للشركات والمجتمعات مع مدربين معتمدين، سجاد، موسيقى هادئة، ومسارات صعوبة متعددة.",
    en: "Corporate and community yoga with certified instructors, mats, calm music, and multi-level flows.",
  },
  hiking: {
    ar: "مسارات آمنة في الطبيعة مع مرشدين، نقاط تموين، وتصوير جوّي اختياري لتخليد الرحلة.",
    en: "Safe outdoor trails with guides, hydration points, and optional aerial capture.",
  },
  interactive: {
    ar: "ألعاب تفاعلية وVR خفيف وتجارب أركان للفعاليات الكبرى والعائلية.",
    en: "Interactive games, light VR, and booth-style activations for large or family events.",
  },
  shows: {
    ar: "عروض موسيقية ورقص وإضاءة متزامنة مع هوية الفعالية.",
    en: "Music, dance, and lighting synchronized with your event identity.",
  },
  family: {
    ar: "ركن أطفال، ورش يدوية، وجلسات أمان مع مشرفين مدربين.",
    en: "Kids corners, craft workshops, and trained supervisors for peace of mind.",
  },
};

interface ActivitiesClientProps {
  readonly locale: Locale;
  readonly dict: Dictionary["pages"]["activities"];
  readonly activityTabs: Dictionary["activityTabs"];
  readonly cta: string;
  readonly formTitle: string;
}

export function ActivitiesClient({
  locale,
  dict,
  activityTabs,
  cta,
  formTitle,
}: ActivitiesClientProps): React.ReactElement {
  const search = useSearchParams();
  const [active, setActive] = useState(activityTabs[0]?.id ?? "yoga");

  useEffect(() => {
    const f = search.get("focus");
    if (f && activityTabs.some((t) => t.id === f)) setActive(f);
  }, [search, activityTabs]);

  const current = activityTabs.find((t) => t.id === active) ?? activityTabs[0];
  const text =
    longText[current.id]?.[locale === "ar" ? "ar" : "en"] ?? longText.yoga.en;

  return (
    <div className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <h1 className="text-3xl font-bold sm:text-4xl">{dict.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{dict.intro}</p>
      </ScrollReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {activityTabs.map((tab, i) => {
          const selected = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "gradient-border group text-start transition",
                selected && "ring-2 ring-cyan-400/40",
              )}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <div className="inner flex min-h-[11rem] flex-col gap-4 p-5 sm:min-h-[12rem] sm:p-6">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg sm:h-16 sm:w-16 sm:text-4xl",
                    selected
                      ? "bg-gradient-to-br from-emerald-500/50 via-violet-500/45 to-cyan-400/40 shadow-emerald-500/25"
                      : "bg-gradient-to-br from-violet-600/30 to-cyan-500/20",
                  )}
                >
                  <span aria-hidden>{activityIcons[tab.id] ?? "✦"}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {tab.label}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    {tab.short}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-10 gradient-border"
      >
        <div className="inner flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/40 via-violet-500/35 to-cyan-400/30 text-4xl">
              <span aria-hidden>{activityIcons[current.id] ?? "✦"}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                {current.label}
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">{text}</p>
            </div>
          </div>
          <BookButton
            type="booking"
            source={`activity:${current.id}`}
            title={`${formTitle} — ${current.label}`}
            className="inline-flex shrink-0 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-8 py-3 font-semibold text-white shadow-md shadow-violet-500/25"
          >
            {cta}
          </BookButton>
        </div>
      </motion.div>
    </div>
  );
}
