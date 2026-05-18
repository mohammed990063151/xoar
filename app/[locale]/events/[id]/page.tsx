import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getDictionary } from "@/lib/dictionary";
import { getEventById } from "@/lib/event-gallery";
import type { Locale } from "@/lib/i18n";
import { isLocale, localizedPath } from "@/lib/i18n";
import Image from "next/image";
import { EventDetailBook } from "@/components/events/EventDetailBook";
import { siteContainerNarrow } from "@/lib/layout";
import Link from "next/link";
import { notFound } from "next/navigation";

const detailCopy: Record<
  string,
  { ar: { body: string }; en: { body: string } }
> = {
  "1": {
    ar: {
      body: "تغطية كاملة للمسرح، مناطق تسجيل، وإدارة بث متزامن لعدة قاعات.",
    },
    en: {
      body: "Full stage coverage, registration zones, and synchronized multi-hall streaming.",
    },
  },
  "2": {
    ar: {
      body: "تصميم إضاءة حيّة، تنسيق فني، وتشغيل صوتي احترافي للجمهور.",
    },
    en: {
      body: "Live lighting design, artistic direction, and pro audio for the crowd.",
    },
  },
  "3": {
    ar: {
      body: "لمسة ديكور شخصية، طاولات VIP، وتجربة ضيافة سلسة.",
    },
    en: {
      body: "Personal decor touches, VIP tables, and a smooth hospitality flow.",
    },
  },
  "4": {
    ar: {
      body: "خرائط بوثات، لوحات إرشادية رقمية، وفرق دعم على الأرض.",
    },
    en: {
      body: "Booth maps, digital wayfinding, and on-ground support crews.",
    },
  },
  "5": {
    ar: {
      body: "شاشة عرض ضخمة، صوت محيطي، وتنسيق أمني للتجمعات العائلية.",
    },
    en: {
      body: "Large projection, surround sound, and safety coordination for families.",
    },
  },
  "6": {
    ar: {
      body: "سينوغرافيا لحظية، تصوير جوّي، وتنسيق دخول وخروج الضيوف.",
    },
    en: {
      body: "Run-of-show choreography, aerial capture, and guest flow coordination.",
    },
  },
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const dict = getDictionary(locale);
  const item = getEventById(id);
  if (!item) notFound();
  const extra = detailCopy[id]?.[locale === "ar" ? "ar" : "en"];

  return (
    <article className={`${siteContainerNarrow} py-16`}>
      <ScrollReveal>
        <Link
          href={localizedPath(locale, "/events")}
          className="text-sm text-cyan-300 hover:underline"
        >
          ← {dict.pages.events.title}
        </Link>
        <h1 className="mt-4 text-4xl font-bold">
          {locale === "ar" ? item.titleAr : item.titleEn}
        </h1>
      </ScrollReveal>
      <ScrollReveal>
        <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
          <div className="relative aspect-video w-full">
            <Image
              src={item.image}
              alt={locale === "ar" ? item.titleAr : item.titleEn}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <p className="mt-6 text-lg text-slate-300">
          {locale === "ar" ? item.descAr : item.descEn}
        </p>
        {extra ? (
          <p className="mt-4 text-slate-400">{extra.body}</p>
        ) : null}
      </ScrollReveal>
      <ScrollReveal>
        <EventDetailBook
          label={dict.eventsSection.book}
          source={`event-detail:${id}`}
          title={locale === "ar" ? item.titleAr : item.titleEn}
        />
      </ScrollReveal>
    </article>
  );
}
