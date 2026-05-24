import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { EventCard } from "@/components/ui/EventCard";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

interface EventsShowcaseProps {
  readonly locale: Locale;
  readonly section: Dictionary["eventsSection"];
}

const imgs = {
  individual:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  exhibitions:
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  entertainment:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
} as const;

export function EventsShowcase({
  locale,
  section,
}: EventsShowcaseProps): React.ReactElement {
  return (
    <section className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{section.title}</h2>
          <p className="mt-3 text-slate-400">{section.subtitle}</p>
        </div>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        <ScrollReveal>
          <EventCard
            locale={locale}
            title={section.individual}
            description={section.individualDesc}
            imageSrc={imgs.individual}
            href="/events#individual"
            cta={section.book}
          />
        </ScrollReveal>
        <ScrollReveal>
          <EventCard
            locale={locale}
            title={section.exhibitions}
            description={section.exhibitionsDesc}
            imageSrc={imgs.exhibitions}
            href="/events#exhibitions"
            cta={section.book}
          />
        </ScrollReveal>
        <ScrollReveal>
          <EventCard
            locale={locale}
            title={section.entertainment}
            description={section.entertainmentDesc}
            imageSrc={imgs.entertainment}
            href="/events#entertainment"
            cta={section.book}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
