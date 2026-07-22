"use client";

import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { EventCard } from "@/components/ui/EventCard";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import {
  gridCards3,
  pageBottom,
  pageIntro,
  pageTitle,
  sectionBlock,
} from "@/lib/layout";
import type { Dictionary } from "@/lib/dictionary";
import type { EventGalleryItem } from "@/services/contentService";

type Filter = "all" | "individual" | "exhibitions" | "entertainment";

interface EventsGalleryProps {
  readonly locale: Locale;
  readonly copy: {
    title: string;
    intro: string;
    filterAll?: string;
    filterIndividual?: string;
    filterExpo?: string;
    filterFun?: string;
  };
  readonly section: Dictionary["eventsSection"];
  readonly events: readonly EventGalleryItem[];
  /** Base path for detail links, e.g. `/works` */
  readonly detailBase?: string;
}

export function EventsGallery({
  locale,
  copy,
  section,
  events,
  detailBase = "/works",
}: EventsGalleryProps): React.ReactElement {
  const [filter, setFilter] = useState<Filter>("all");
  const defaults = getDictionary(locale).pages.works;

  const tabs = useMemo(
    () => [
      { id: "all" as const, label: copy.filterAll?.trim() || defaults.filterAll },
      {
        id: "individual" as const,
        label: copy.filterIndividual?.trim() || defaults.filterIndividual,
      },
      { id: "exhibitions" as const, label: copy.filterExpo?.trim() || defaults.filterExpo },
      { id: "entertainment" as const, label: copy.filterFun?.trim() || defaults.filterFun },
    ],
    [copy, defaults],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: events.length,
      individual: 0,
      exhibitions: 0,
      entertainment: 0,
    };
    for (const event of events) {
      const key = event.filter || "entertainment";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map as Record<Filter, number>;
  }, [events]);

  const items = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) => event.filter === filter);
  }, [filter, events]);

  const ar = locale === "ar";

  return (
    <div className={cn(pageBottom, sectionBlock)}>
      <ScrollReveal>
        <h1 className={pageTitle}>{copy.title}</h1>
        <p className={cn(pageIntro, "max-w-2xl text-slate-300")}>{copy.intro}</p>
      </ScrollReveal>

      <div className="mt-8 sm:mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {ar ? "تصفية حسب النوع" : "Filter by type"}
        </p>
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5"
          role="tablist"
          aria-label={ar ? "تصنيف الأعمال" : "Portfolio categories"}
        >
          {tabs.map((tab) => {
            const active = filter === tab.id;
            const count = counts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:min-h-10 sm:rounded-full sm:px-5",
                  active
                    ? "bg-gradient-to-l from-violet-600 to-cyan-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] ring-1 ring-cyan-400/30"
                    : "border border-white/12 bg-slate-950/50 text-slate-300 hover:border-cyan-400/35 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="truncate">{tab.label}</span>
                <span
                  className={cn(
                    "inline-flex min-w-[1.5rem] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-white/8 text-slate-400",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
          {ar ? "لا توجد أعمال في هذا التصنيف." : "No items in this category."}
        </p>
      ) : (
        <div id="individual" className={cn(gridCards3, "mt-8 sm:mt-10")}>
          {items.map((item) => (
            <ScrollReveal key={item.id}>
              <EventCard
                locale={locale}
                title={item.title}
                description={item.description}
                imageSrc={item.image}
                href={`${detailBase}/${item.id}`}
                cta={section.viewDetails}
                imageAspect="4 / 3"
                imageObjectFit="cover"
                badge={item.filterLabel}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
