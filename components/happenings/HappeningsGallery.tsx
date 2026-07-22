"use client";

import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { HappeningCard } from "@/components/ui/HappeningCard";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import {
  gridCards3,
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionBlock,
} from "@/lib/layout";
import type { HappeningItem } from "@/services/contentService";

interface HappeningsGalleryProps {
  readonly locale: Locale;
  readonly title: string;
  readonly intro: string;
  readonly items: readonly HappeningItem[];
  readonly viewDetailsLabel: string;
}

type FilterId = "all" | "individual" | "exhibitions" | "entertainment";

export function HappeningsGallery({
  locale,
  title,
  intro,
  items,
  viewDetailsLabel,
}: HappeningsGalleryProps): React.ReactElement {
  const ar = locale === "ar";
  const [filter, setFilter] = useState<FilterId>("all");

  const tabs = useMemo(
    () =>
      [
        { id: "all" as const, label: ar ? "الكل" : "All" },
        { id: "individual" as const, label: ar ? "أفراد" : "Individuals" },
        { id: "exhibitions" as const, label: ar ? "معارض" : "Exhibitions" },
        { id: "entertainment" as const, label: ar ? "ترفيه" : "Entertainment" },
      ] as const,
    [ar],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => (item.category || "") === filter);
  }, [filter, items]);

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_0%,rgba(34,211,238,0.2),transparent),radial-gradient(ellipse_50%_40%_at_0%_90%,rgba(14,165,233,0.1),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <ScrollReveal className="max-w-2xl">
              <p className={pageEyebrow}>{ar ? "فعاليات للحجز" : "Bookable events"}</p>
              <h1 className={`mt-3 ${pageTitle}`}>{title}</h1>
              <p className={cn(pageIntro, "max-w-xl")}>{intro}</p>
            </ScrollReveal>
            
          </div>

          <div
            className="mt-8 flex flex-wrap gap-2"
            role="tablist"
            aria-label={ar ? "تصفية الفعاليات" : "Filter events"}
          >
            {tabs.map((tab) => {
              const active = filter === tab.id;
              const count =
                tab.id === "all"
                  ? items.length
                  : items.filter((item) => item.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-gradient-to-l from-cyan-500 to-sky-600 text-white shadow-[0_10px_28px_rgba(34,211,238,0.3)]"
                      : "border border-white/12 bg-white/[0.03] text-slate-300 hover:border-cyan-400/35 hover:text-white",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "inline-flex min-w-[1.4rem] justify-center rounded-full px-1.5 text-[11px]",
                      active ? "bg-white/20" : "bg-white/8 text-slate-400",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={sectionBlock}>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center text-slate-400">
            {ar
              ? "لا توجد فعاليات في هذا التصنيف — أضفها من لوحة التحكم → فعالياتنا."
              : "No events in this category — add them from Dashboard → Events."}
          </p>
        ) : (
          <div className={gridCards3}>
            {filtered.map((item) => (
              <ScrollReveal key={item.slug || item.id}>
                <HappeningCard
                  locale={locale}
                  item={item}
                  cta={viewDetailsLabel}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
