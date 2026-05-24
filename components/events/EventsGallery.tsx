"use client";

import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { EventCard } from "@/components/ui/EventCard";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import type { EventGalleryItem } from "@/services/contentService";

type Filter = "all" | "individual" | "exhibitions" | "entertainment";

interface EventsGalleryProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["events"];
  readonly section: Dictionary["eventsSection"];
  readonly events: readonly EventGalleryItem[];
}

export function EventsGallery({
  locale,
  copy,
  section,
  events,
}: EventsGalleryProps): React.ReactElement {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) => event.filter === filter);
  }, [filter, events]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: copy.filterAll },
    { id: "individual", label: copy.filterIndividual },
    { id: "exhibitions", label: copy.filterExpo },
    { id: "entertainment", label: copy.filterFun },
  ];

  return (
    <div className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{copy.intro}</p>
      </ScrollReveal>

      <div className="mt-10 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              filter === tab.id
                ? "bg-gradient-to-l from-violet-600 to-cyan-500 text-white"
                : "border border-white/15 text-slate-300 hover:border-cyan-400/40",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="individual"
        className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <ScrollReveal key={item.id}>
            <EventCard
              locale={locale}
              title={item.title}
              description={item.description}
              imageSrc={item.image}
              href={`/events/${item.id}`}
              cta={section.viewDetails}
              imageAspect="4 / 3"
              imageObjectFit="contain"
            />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
