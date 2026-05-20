import { ActivityCard } from "@/components/activities/ActivityCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Dictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

type EntertainmentCard = Dictionary["entertainmentSection"]["cards"][number] & {
  organizer?: string;
  location?: string;
  date?: string;
  price?: string;
};

interface EntertainmentShowcaseProps {
  readonly section: Dictionary["entertainmentSection"];
  readonly activityCards: Dictionary["activityCards"];
  readonly bookCta: string;
  readonly formTitle: string;
}

export function EntertainmentShowcase({
  section,
  activityCards,
  bookCta,
  formTitle,
}: EntertainmentShowcaseProps): React.ReactElement {
  return (
    <section className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {section.title}
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            {section.subtitle}
          </p>
        </div>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {section.cards.map((card: EntertainmentCard, index) => (
          <ScrollReveal key={`${card.title}-${index}`}>
            <ActivityCard
              activity={{
                id: `entertainment-${index}`,
                title: card.title,
                description: card.desc,
                image: card.image,
                organizer: card.organizer ?? "Xora",
                location: card.location ?? "",
                date: card.date ?? "",
                price: card.price ?? "",
              }}
              organizerLabel={activityCards.organizerLabel}
              bookCta={bookCta}
              formTitle={formTitle}
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
