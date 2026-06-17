import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { AboutPageContent } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { isStorageImage, useUnoptimizedImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import {
  pageBottom,
  pageEyebrow,
  pageHeroCentered,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionHeading,
  sectionSpacingTight,
  siteContainer,
  siteContainerNarrow,
} from "@/lib/layout";
import { AboutTeamSection } from "./AboutTeamSection";

interface AboutPageViewProps {
  readonly locale: Locale;
  readonly content: AboutPageContent;
  readonly contactCta: string;
}

const VALUE_ICONS = [
  (
    <svg key="quality" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  ),
  (
    <svg key="trust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 3l8 4v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  (
    <svg key="innovation" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10c.5.4.8 1 .9 1.6L9 18h6l.1-4.4c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 2z" />
    </svg>
  ),
  (
    <svg key="care" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
    </svg>
  ),
];

const VALUE_STYLES = [
  {
    ring: "ring-cyan-400/20",
    icon: "from-cyan-500/30 to-blue-600/15 text-cyan-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.14)]",
    accent: "from-cyan-400/80 to-blue-500/80",
  },
  {
    ring: "ring-violet-400/20",
    icon: "from-violet-500/30 to-purple-600/15 text-violet-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.14)]",
    accent: "from-violet-400/80 to-purple-500/80",
  },
  {
    ring: "ring-emerald-400/20",
    icon: "from-emerald-500/30 to-teal-600/15 text-emerald-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.14)]",
    accent: "from-emerald-400/80 to-teal-500/80",
  },
  {
    ring: "ring-amber-400/20",
    icon: "from-amber-500/30 to-orange-600/15 text-amber-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.14)]",
    accent: "from-amber-400/80 to-orange-500/80",
  },
];

function AboutImage({
  src,
  alt,
  className,
  sizes,
}: {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly sizes?: string;
}): React.ReactElement {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes ?? "(max-width: 1024px) 100vw, 50vw"}
      unoptimized={useUnoptimizedImage(src) || isStorageImage(src)}
    />
  );
}

export function AboutPageView({
  locale,
  content,
  contactCta,
}: AboutPageViewProps): React.ReactElement {
  const contactPath = localizedPath(locale, "/contact");
  const ar = locale === "ar";
  const [heroImage, ...galleryRest] = content.images;
  const galleryThumbs = galleryRest.length > 0 ? galleryRest.slice(0, 2) : [];
  const hasStory = content.p1.trim() || content.p2.trim();
  const hasImages = content.images.length > 0;

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(168,85,247,0.22),transparent),radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(59,130,246,0.12),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <ScrollReveal className={pageHeroCentered}>
            {content.eyebrow ? <p className={pageEyebrow}>{content.eyebrow}</p> : null}
            <h1 className={pageTitle}>{content.title}</h1>
            {content.intro ? <p className={pageIntro}>{content.intro}</p> : null}
          </ScrollReveal>
        </div>
      </section>

      {(hasStory || hasImages) ? (
        <section className={cn(siteContainer, sectionSpacingTight)}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            {hasStory ? (
              <ScrollReveal>
                <p className={pageEyebrow}>{ar ? "قصتنا" : "Our story"}</p>
                <div className="mt-4 space-y-4">
                  {content.p1.trim() ? (
                    <p className="text-base leading-relaxed text-slate-200 sm:text-lg">{content.p1}</p>
                  ) : null}
                  {content.p2.trim() ? (
                    <p className="text-base leading-relaxed text-slate-400 sm:text-lg">{content.p2}</p>
                  ) : null}
                </div>
              </ScrollReveal>
            ) : null}

            {hasImages && heroImage ? (
              <ScrollReveal className={cn(!hasStory && "lg:col-span-2")}>
                <div
                  className={cn(
                    "grid gap-3 sm:gap-4",
                    galleryThumbs.length > 0 ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  <div
                    className={cn(
                      "gradient-border overflow-hidden",
                      galleryThumbs.length > 0 ? "col-span-2" : "",
                    )}
                  >
                    <div className="inner relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
                      <AboutImage
                        src={heroImage}
                        alt={content.title}
                        sizes="(max-width: 1024px) 100vw, 640px"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/40 via-transparent to-transparent"
                        aria-hidden
                      />
                    </div>
                  </div>
                  {galleryThumbs.map((src, index) => (
                    <div key={`${src}-${index}`} className="gradient-border overflow-hidden">
                      <div className="inner relative aspect-[4/3] overflow-hidden">
                        <AboutImage
                          src={src}
                          alt=""
                          sizes="(max-width: 1024px) 50vw, 320px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className={cn(siteContainer, sectionSpacingTight)}>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          <ScrollReveal>
            <article className="gradient-border group h-full transition duration-300 hover:shadow-[0_24px_60px_rgba(139,92,246,0.12)]">
              <div className="inner relative h-full p-6 sm:p-8">
                <div
                  className="pointer-events-none absolute end-6 top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition duration-500 group-hover:bg-violet-500/20"
                  aria-hidden
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-purple-600/10 text-violet-300 ring-1 ring-violet-400/25"
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                    {ar ? "رؤيتنا" : "Our vision"}
                  </p>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">{content.vision.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {content.vision.text}
                </p>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal>
            <article className="gradient-border group h-full transition duration-300 hover:shadow-[0_24px_60px_rgba(6,182,212,0.12)]">
              <div className="inner relative h-full p-6 sm:p-8">
                <div
                  className="pointer-events-none absolute end-6 top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition duration-500 group-hover:bg-cyan-500/20"
                  aria-hidden
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/10 text-cyan-300 ring-1 ring-cyan-400/25"
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                      <path d="M12 2L4 7v6c0 5.5 3.8 9.4 8 10 4.2-.6 8-4.5 8-10V7l-8-5z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
                    {ar ? "رسالتنا" : "Our mission"}
                  </p>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">{content.mission.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {content.mission.text}
                </p>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {content.values.length > 0 ? (
        <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-12 sm:py-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(168,85,247,0.12),transparent),radial-gradient(ellipse_60%_45%_at_10%_100%,rgba(6,182,212,0.08),transparent)]"
            aria-hidden
          />

          <div className={siteContainer}>
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className={pageEyebrow}>{ar ? "ما يميزنا" : "What sets us apart"}</p>
                <h2 className={`mt-3 ${sectionHeading}`}>
                  {ar ? "قيمنا في العمل" : "Our values"}
                </h2>
              </div>
            </ScrollReveal>

            <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:gap-6">
              {content.values.map((value, index) => {
                const style = VALUE_STYLES[index % VALUE_STYLES.length];
                const number = String(index + 1).padStart(2, "0");
                return (
                  <ScrollReveal key={`${value.title}-${index}`}>
                    <li
                      className={cn(
                        "group gradient-border h-full overflow-hidden transition duration-300",
                        style.glow,
                      )}
                    >
                      <div className="inner relative flex h-full gap-5 p-5 sm:p-6">
                        <div
                          className={cn(
                            "absolute inset-y-4 start-0 w-px bg-gradient-to-b opacity-60 transition duration-300 group-hover:opacity-100",
                            style.accent,
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 transition duration-300 group-hover:scale-105",
                            style.icon,
                            style.ring,
                          )}
                        >
                          {VALUE_ICONS[index % VALUE_ICONS.length]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                            <span
                              className="shrink-0 text-[11px] font-semibold tabular-nums tracking-widest text-slate-600 transition duration-300 group-hover:text-slate-500"
                              aria-hidden
                            >
                              {number}
                            </span>
                          </div>
                          {value.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                              {value.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  </ScrollReveal>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <AboutTeamSection locale={locale} team={content.team} />

      <section className={cn(siteContainerNarrow, "pt-12 sm:pt-14 lg:pt-16")}>
        <ScrollReveal>
          <div className="gradient-border overflow-hidden">
            <div className="inner relative px-6 py-10 text-center sm:px-10 sm:py-12">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent)]"
                aria-hidden
              />
              <p className="relative text-base leading-relaxed text-slate-300 sm:text-lg">
                {ar
                  ? "جاهزون لتحويل فكرتك إلى تجربة لا تُنسى."
                  : "Ready to turn your idea into an unforgettable experience."}
              </p>
              <Link
                href={contactPath}
                className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.3)] transition hover:brightness-110 hover:shadow-[0_16px_48px_rgba(59,130,246,0.4)]"
              >
                {contactCta}
                <span className="text-lg rtl:rotate-180" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
