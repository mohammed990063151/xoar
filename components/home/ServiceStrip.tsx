"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import { localizedPath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface ServiceStripProps {
  readonly locale: Locale;
  readonly data: Dictionary["servicesStrip"];
}

const FEATURED_INDEX = 2;

function IconMegaphone({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 22V10l12-3v18l-12-3Z M22 12c3 0 5 2 5 4s-2 4-5 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 14H5v4h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconMap({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 24V9l7-3 7 3 7-3v15l-7 3-7-3-7 3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M13 6v18M20 9v18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconParty({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 24L14 8l10 4-6 16-10-4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M10 10l3-4M18 6l2-3M22 12l4-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconPeople({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 24c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="22" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 24c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const icons = [IconMegaphone, IconMap, IconParty, IconPeople] as const;

export function ServiceStrip({
  locale,
  data,
}: ServiceStripProps): React.ReactElement {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -start-24 top-10 h-64 w-64 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -end-20 bottom-0 h-56 w-56 rounded-full bg-blue-600/15 blur-[90px]" />

      <motion.h2
        className="relative text-center text-2xl font-bold text-white sm:text-3xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {data.title}
      </motion.h2>
      <motion.p
        className="relative mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400 sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.55, delay: 0.05 }}
      >
        {data.subtitle}
      </motion.p>

      <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.cards.map((card, i) => {
          const Icon = icons[i] ?? IconMegaphone;
          const featured = i === FEATURED_INDEX;
          return (
            <motion.article
              key={card.title}
              className={cn(
                "group relative flex h-full flex-col rounded-2xl border bg-slate-950/55 p-5 backdrop-blur-md transition-all duration-500",
                featured
                  ? "card-neon border-transparent"
                  : "border-white/10 hover:border-purple-500/35 hover:shadow-[0_0_32px_rgba(59,130,246,0.12)]",
              )}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              {featured ? (
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "mb-4 flex h-11 w-11 items-center justify-center rounded-xl border text-slate-200",
                  featured
                    ? "border-purple-400/40 bg-gradient-to-br from-blue-500/20 to-purple-600/25 text-white"
                    : "border-white/10 bg-white/5 text-slate-300",
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{card.desc}</p>
              <Link
                href={localizedPath(locale, "/contact")}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300/95 transition hover:text-purple-200"
              >
                {card.cta}
                <span className="text-base rtl:rotate-180" aria-hidden>
                  →
                </span>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
