import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { EventCard } from "@/components/ui/EventCard";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

interface EntertainmentShowcaseProps {
  readonly locale: Locale;
  readonly section: Dictionary["entertainmentSection"];
  readonly bookCta: string;
}

export function EntertainmentShowcase({
  locale,
  section,
  bookCta,
}: EntertainmentShowcaseProps): React.ReactElement {
  const hrefBase = "/activities";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">{section.subtitle}</p>
        </div>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {section.cards.map((card) => (
          <ScrollReveal key={card.title}>
            <EventCard
              locale={locale}
              title={card.title}
              description={card.desc}
              imageSrc={card.image}
              href={hrefBase}
              cta={bookCta}
              imageAspect="16 / 11"
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
