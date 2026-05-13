"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

const images: Record<string, string> = {
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
  hiking: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80",
  interactive:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80",
  shows: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80",
  family: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80",
};

const longText: Record<
  string,
  { ar: string; en: string }
> = {
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
}

export function ActivitiesClient({
  locale,
  dict,
  activityTabs,
  cta,
}: ActivitiesClientProps): React.ReactElement {
  const search = useSearchParams();
  const [active, setActive] = useState(activityTabs[0]?.id ?? "yoga");

  useEffect(() => {
    const f = search.get("focus");
    if (f && activityTabs.some((t) => t.id === f)) setActive(f);
  }, [search, activityTabs]);

  const current = activityTabs.find((t) => t.id === active) ?? activityTabs[0];
  const img = images[current.id] ?? images.yoga;
  const text =
    longText[current.id]?.[locale === "ar" ? "ar" : "en"] ?? longText.yoga.en;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{dict.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{dict.intro}</p>
      </ScrollReveal>

      <div className="mt-10 flex flex-wrap gap-2">
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
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
          <motion.img
            src={img}
            alt=""
            className="h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{current.label}</h2>
          <p className="mt-4 text-slate-300">{text}</p>
          <a
            href="https://wa.me/966563672097"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-8 py-3 font-semibold text-white"
          >
            {cta}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
