import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { isLocale, localizedPath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";
import { EventDetailBook } from "@/components/events/EventDetailBook";
import { pageBottom, pageTitle, siteContainerNarrow } from "@/lib/layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, getSiteContent } from "@/services/contentService";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const dict = await getSiteContent(locale);
  const item = await getEventBySlug(locale, id);
  if (!item) notFound();

  return (
    <article className={`${siteContainerNarrow} ${pageBottom} py-10 sm:py-14 lg:py-16`}>
      <ScrollReveal>
        <Link
          href={localizedPath(locale, "/events")}
          className="text-sm text-cyan-300 hover:underline"
        >
          ← {dict.pages.events.title}
        </Link>
        <h1 className={`mt-4 ${pageTitle}`}>{item.title}</h1>
      </ScrollReveal>
      <ScrollReveal>
        <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
          <div className="relative aspect-video w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <p className="mt-6 text-lg text-slate-300">{item.description}</p>
        {item.bodyExtra ? (
          <p className="mt-4 text-slate-400">{item.bodyExtra}</p>
        ) : null}
      </ScrollReveal>
      <ScrollReveal>
        <EventDetailBook
          label={dict.eventsSection.book}
          source={`event-detail:${id}`}
          title={item.title}
        />
      </ScrollReveal>
    </article>
  );
}
