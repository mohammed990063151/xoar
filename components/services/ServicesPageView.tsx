"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { ServicesPageContent, ServiceListItem } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { isStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionBlock,
  siteContainerNarrow,
} from "@/lib/layout";

interface ServicesPageViewProps {
  readonly locale: Locale;
  readonly content: ServicesPageContent;
  readonly contactCta: string;
}

const SERVICE_ICONS: Record<string, React.ReactElement> = {
  strategy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  production: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <path d="M4 7h16v10H4z" />
      <path d="M8 7V5h8v2M9 12h6" />
    </svg>
  ),
  content: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19h14M8 16h8" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M8 6l2-3h4l2 3M10 11.5l6 3.5-6 3.5v-7z" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  ),
  hospitality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="h-6 w-6">
      <path d="M4 11h16v8H4z" />
      <path d="M6 11V8a6 6 0 0112 0v3" />
    </svg>
  ),
};

const ICON_FALLBACKS = Object.values(SERVICE_ICONS);

const ACCENTS = [
  {
    icon: "from-cyan-500/25 to-blue-600/20 text-cyan-300 ring-cyan-400/30",
    bar: "from-cyan-400 to-blue-500",
    glow: "group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)]",
  },
  {
    icon: "from-violet-500/25 to-purple-600/20 text-violet-300 ring-violet-400/30",
    bar: "from-violet-400 to-purple-500",
    glow: "group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.18)]",
  },
  {
    icon: "from-emerald-500/25 to-teal-600/20 text-emerald-300 ring-emerald-400/30",
    bar: "from-emerald-400 to-teal-500",
    glow: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)]",
  },
  {
    icon: "from-amber-500/25 to-orange-600/20 text-amber-300 ring-amber-400/30",
    bar: "from-amber-400 to-orange-500",
    glow: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)]",
  },
];

const STEP_LABELS = {
  ar: ["التخطيط", "التنفيذ", "ما بعد الحدث"],
  en: ["Planning", "Delivery", "Post-event"],
};

function serviceIcon(item: ServiceListItem, index: number): React.ReactElement {
  if (item.iconKey && SERVICE_ICONS[item.iconKey]) {
    return SERVICE_ICONS[item.iconKey];
  }
  return ICON_FALLBACKS[index % ICON_FALLBACKS.length];
}

function ServiceTile({
  locale,
  item,
  index,
  detailCta,
}: {
  readonly locale: Locale;
  readonly item: ServiceListItem;
  readonly index: number;
  readonly detailCta: string;
}): React.ReactElement {
  const accent = ACCENTS[index % ACCENTS.length];
  const href = localizedPath(locale, item.slug ? `/services/${item.slug}` : "/contact");
  const description = item.body || item.description;

  return (
    <motion.article
      className={cn(
        "services-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-sm transition-all duration-500 sm:p-7",
        accent.glow,
      )}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
          accent.bar,
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
            accent.icon,
          )}
        >
          {serviceIcon(item, index)}
        </span>
        <span className="text-xs font-bold tabular-nums text-slate-500">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-white sm:text-2xl">{item.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 sm:text-base">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:gap-3 group-hover:text-cyan-200"
      >
        {detailCta}
        <span aria-hidden className="rtl:rotate-180">
          →
        </span>
      </Link>
    </motion.article>
  );
}

export function ServicesPageView({
  locale,
  content,
  contactCta,
}: ServicesPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const contactPath = localizedPath(locale, "/contact");
  const steps = STEP_LABELS[locale];
  const detailCta = content.detailCta || (ar ? "التفاصيل" : "Details");
  const items = content.items.filter((item) => item.title.trim().length > 0);

  return (
    <div className={cn(pageBottom, "services-page")}>
      {/* Hero */}
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(168,85,247,0.12),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-14">
            <ScrollReveal className="min-w-0">
              {content.eyebrow ? <p className={pageEyebrow}>{content.eyebrow}</p> : null}
              <h1 className={cn(pageTitle, "gradient-text")}>{content.title}</h1>
              <p className={pageIntro}>{content.intro}</p>

              <ol className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                {steps.map((label, index) => (
                  <li
                    key={label}
                    className="services-step flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal>
              {content.heroImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
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
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/55 to-transparent"
                    aria-hidden
                  />
                </div>
              ) : (
                <div className="services-hero-placeholder relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/80 via-slate-950 to-cyan-950/60 p-8 text-center">
                  <div
                    className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -start-8 bottom-0 h-36 w-36 rounded-full bg-cyan-500/25 blur-3xl"
                    aria-hidden
                  />
                  <p className="relative text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {ar ? "من الفكرة" : "From idea"}
                  </p>
                  <p className="relative mt-2 text-lg font-semibold text-cyan-300 sm:text-xl">
                    {ar ? "إلى تجربة لا تُنسى" : "to an unforgettable experience"}
                  </p>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className={sectionBlock}>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className={pageEyebrow}>{ar ? "حلول متكاملة" : "End-to-end solutions"}</p>
            <h2 className="mt-3 text-[clamp(1.35rem,4vw,2rem)] font-bold tracking-tight text-white sm:text-3xl">
              {ar ? "خدماتنا الأساسية" : "Core services"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              {ar
                ? "نغطي كل مرحلة من دورة الفعالية باحترافية وتقنية وهوية بصرية قوية."
                : "We cover every stage of the event lifecycle with craft, tech, and strong visual identity."}
            </p>
          </div>
        </ScrollReveal>

        {items.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:gap-6">
            {items.map((item, index) => (
              <li key={item.slug || `${item.title}-${index}`} className="h-full">
                <ServiceTile
                  locale={locale}
                  item={item}
                  index={index}
                  detailCta={detailCta}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
            {ar ? "لا توجد خدمات معروضة حالياً." : "No services to show yet."}
          </p>
        )}
      </section>

      {/* Closing CTA */}
      <section className="services-closing relative border-t border-white/5 py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.12),transparent)]"
          aria-hidden
        />
        <div className={cn(siteContainerNarrow, "relative text-center")}>
          <ScrollReveal>
            <p className="services-closing-text mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-200 sm:text-xl">
              {content.closingText ||
                (ar
                  ? "نرافقك في كل مرحلة — من الفكرة إلى التسليم."
                  : "We support you at every stage — from idea to delivery.")}
            </p>
            <Link
              href={contactPath}
              className="services-cta mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110"
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
