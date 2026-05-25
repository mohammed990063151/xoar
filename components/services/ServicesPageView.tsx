import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { ServicesPageContent } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { isStorageImage } from "@/lib/image-url";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  scrollRow,
  sectionBlock,
  sectionHeading,
  siteContainerNarrow,
} from "@/lib/layout";

interface ServicesPageViewProps {
  readonly locale: Locale;
  readonly content: ServicesPageContent;
  readonly contactCta: string;
}

const SERVICE_ICONS = [
  (
    <svg key="strategy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  (
    <svg key="production" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 7h16v10H4z" />
      <path d="M8 7V5h8v2M9 12h6" />
    </svg>
  ),
  (
    <svg key="content" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19h14M8 16h8" />
    </svg>
  ),
  (
    <svg key="media" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M8 6l2-3h4l2 3M10 11.5l6 3.5-6 3.5v-7z" />
    </svg>
  ),
];

const STEP_LABELS = {
  ar: ["التخطيط", "التنفيذ", "ما بعد الحدث"],
  en: ["Planning", "Delivery", "Post-event"],
};

export function ServicesPageView({
  locale,
  content,
  contactCta,
}: ServicesPageViewProps): React.ReactElement {
  const contactPath = localizedPath(locale, "/contact");
  const steps = STEP_LABELS[locale];

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(168,85,247,0.1),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-14">
            <ScrollReveal className="min-w-0">
              {content.eyebrow ? <p className={pageEyebrow}>{content.eyebrow}</p> : null}
              <h1 className={pageTitle}>{content.title}</h1>
              <p className={pageIntro}>{content.intro}</p>

              <ol className={`${scrollRow} mt-6 sm:mt-8 sm:flex-wrap`}>
                {steps.map((label, index) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-600/30 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal>
              {content.heroImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  <Image
                    src={content.heroImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 520px"
                    priority
                    unoptimized={isStorageImage(content.heroImage)}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent"
                    aria-hidden
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
                  {locale === "ar"
                    ? "ارفع صورة من لوحة التحكم → صفحات الموقع → خدماتنا"
                    : "Upload a hero image from Dashboard → Site pages → Services"}
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className={sectionBlock}>
        <ScrollReveal>
          <div className="text-center">
            <p className={pageEyebrow}>{locale === "ar" ? "حلول متكاملة" : "End-to-end solutions"}</p>
            <h2 className={`mt-3 ${sectionHeading}`}>
              {locale === "ar" ? "خدماتنا الأساسية" : "Core services"}
            </h2>
          </div>
        </ScrollReveal>

        <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {content.items.map((item, index) => (
            <ScrollReveal key={`${item.title}-${index}`}>
              <li className="group gradient-border h-full transition duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.14)]">
                <div className="inner flex h-full flex-col p-6 sm:p-7">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/25 text-cyan-300 ring-1 ring-white/10 transition group-hover:scale-105">
                    {SERVICE_ICONS[index % SERVICE_ICONS.length]}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{item.body}</p>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/5 bg-white/[0.02] py-12 sm:py-16 lg:py-20">
        <div className={`${siteContainerNarrow} text-center`}>
          <ScrollReveal>
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              {content.closingText ||
                (locale === "ar"
                  ? "نرافقك في كل مرحلة — من الفكرة إلى التسليم."
                  : "We support you at every stage — from idea to delivery.")}
            </p>
            <Link
              href={contactPath}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110"
            >
              {contactCta}
              <span className="text-lg rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
