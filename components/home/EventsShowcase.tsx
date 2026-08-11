"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { localizedPath } from "@/lib/i18n";

interface EventsShowcaseProps {
  readonly locale: Locale;
  readonly section: Dictionary["eventsSection"];
}

const imgs = {
  individual:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80",
  exhibitions:
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80",
  entertainment:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80",
} as const;

const ACCENT_COLORS = [
  {
    gradient: "from-violet-600/80 to-blue-600/60",
    badge: "bg-violet-500/20 border-violet-400/40 text-violet-200",
    glow: "group-hover:shadow-[0_24px_60px_rgba(139,92,246,0.25)]",
    cta: "from-violet-600 to-blue-500",
    dot: "bg-violet-400",
  },
  {
    gradient: "from-cyan-600/80 to-blue-700/60",
    badge: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200",
    glow: "group-hover:shadow-[0_24px_60px_rgba(6,182,212,0.25)]",
    cta: "from-cyan-500 to-blue-600",
    dot: "bg-cyan-400",
  },
  {
    gradient: "from-amber-600/80 to-orange-600/60",
    badge: "bg-amber-500/20 border-amber-400/40 text-amber-200",
    glow: "group-hover:shadow-[0_24px_60px_rgba(245,158,11,0.25)]",
    cta: "from-amber-500 to-orange-500",
    dot: "bg-amber-400",
  },
];

interface ShowcaseCardProps {
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly href: string;
  readonly cta: string;
  readonly accentIdx: number;
  readonly index: number;
}

function ShowcaseCard({
  locale,
  title,
  description,
  imageSrc,
  href,
  cta,
  accentIdx,
  index,
}: ShowcaseCardProps): React.ReactElement {
  const path = href.startsWith("/") ? localizedPath(locale, href) : href;
  const accent = ACCENT_COLORS[accentIdx % ACCENT_COLORS.length];

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-sm transition-shadow duration-500",
        accent.glow,
      )}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      {/* Image */}
      <Link href={path} className="relative block aspect-[16/10] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {/* Overlay gradient */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t opacity-75",
            accent.gradient,
          )}
        />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 to-transparent" />
      </Link>

      {/* Content */}
      <div className="relative flex flex-col gap-3 p-5 sm:p-6">
        {/* Accent dot */}
        <span
          className={cn("absolute end-5 top-5 h-2 w-2 rounded-full", accent.dot)}
          aria-hidden
        />

        <h3 className="text-xl font-bold leading-snug text-white sm:text-2xl">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {description}
        </p>

        <Link
          href={path}
          className={cn(
            "mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-l px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110",
            accent.cta,
          )}
        >
          {cta}
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </motion.article>
  );
}

export function EventsShowcase({
  locale,
  section,
}: EventsShowcaseProps): React.ReactElement {
  const ar = locale === "ar";

  const cards = [
    { key: "individual", title: section.individual, desc: section.individualDesc, img: imgs.individual, href: "/events#individual" },
    { key: "exhibitions", title: section.exhibitions, desc: section.exhibitionsDesc, img: imgs.exhibitions, href: "/events#exhibitions" },
    { key: "entertainment", title: section.entertainment, desc: section.entertainmentDesc, img: imgs.entertainment, href: "/events#entertainment" },
  ];

  return (
    <section className={cn(siteContainer, "py-16 sm:py-20")}>
      {/* Header */}
      <ScrollReveal>
        <div className={cn("max-w-2xl", ar ? "" : "")}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/90">
            {ar ? "فعالياتنا" : "Our Events"}
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{section.title}</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
            {section.subtitle}
          </p>
        </div>
      </ScrollReveal>

      {/* Cards grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-7">
        {cards.map((card, i) => (
          <ShowcaseCard
            key={card.key}
            locale={locale}
            title={card.title}
            description={card.desc}
            imageSrc={card.img}
            href={card.href}
            cta={section.book}
            accentIdx={i}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
