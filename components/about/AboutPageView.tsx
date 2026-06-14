import Image from "next/image";
import Link from "next/link";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutTeamSection } from "@/components/about/AboutTeamSection";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { AboutPageContent } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { isStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import {
  pageBottom,
  pageEyebrow,
  sectionBlock,
  sectionHeading,
  siteContainer,
} from "@/lib/layout";

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
    ring: "ring-cyan-400/25",
    icon: "from-cyan-500/35 to-blue-600/20 text-cyan-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)]",
    bar: "bg-gradient-to-r from-cyan-400 to-blue-500",
  },
  {
    ring: "ring-violet-400/25",
    icon: "from-violet-500/35 to-purple-600/20 text-violet-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.18)]",
    bar: "bg-gradient-to-r from-violet-400 to-purple-500",
  },
  {
    ring: "ring-emerald-400/25",
    icon: "from-emerald-500/35 to-teal-600/20 text-emerald-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)]",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
  {
    ring: "ring-amber-400/25",
    icon: "from-amber-500/35 to-orange-600/20 text-amber-300",
    glow: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)]",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
];

function accentImageFromContent(content: AboutPageContent): string | undefined {
  const teamPhoto = content.team.members.find((m) => m.image.trim())?.image;
  if (teamPhoto) return teamPhoto;
  return content.images[0];
}

export function AboutPageView({
  locale,
  content,
  contactCta,
}: AboutPageViewProps): React.ReactElement {
  const contactPath = localizedPath(locale, "/contact");
  const ar = locale === "ar";
  const [heroImage, ...galleryRest] = content.images;
  const galleryThumbs = galleryRest.length > 0 ? galleryRest : content.images.slice(1);
  const accentImage = accentImageFromContent(content);

  return (
    <div className={pageBottom}>
      <AboutHero
        locale={locale}
        eyebrow={content.eyebrow}
        title={content.title}
        intro={content.intro}
        accentImage={accentImage}
      />

      <AboutTeamSection locale={locale} team={content.team} variant="featured" />

      <section className={cn(sectionBlock, "relative")}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(59,130,246,0.08),transparent)]"
          aria-hidden
        />

        <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-8">
          <ScrollReveal className="lg:col-span-7">
            <div className="gradient-border h-full">
              <div className="inner h-full p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400/90">
                  {ar ? "قصتنا" : "Our story"}
                </p>
                <h2 className={`mt-3 ${sectionHeading}`}>
                  {ar ? "من الفكرة إلى التجربة" : "From idea to experience"}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-slate-300">{content.p1}</p>
                <p className="mt-4 text-base leading-relaxed text-slate-400">{content.p2}</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <ScrollReveal>
              <article className="gradient-border group h-full overflow-hidden transition duration-300 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]">
                <div className="inner relative h-full overflow-hidden p-6 sm:p-7">
                  <div
                    className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl"
                    aria-hidden
                  />
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-lg text-emerald-300 ring-1 ring-emerald-400/25">
                    ◆
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-white">{content.mission.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{content.mission.text}</p>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal>
              <article className="gradient-border group h-full overflow-hidden transition duration-300 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)]">
                <div className="inner relative h-full overflow-hidden p-6 sm:p-7">
                  <div
                    className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl"
                    aria-hidden
                  />
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300 ring-1 ring-violet-400/25">
                    ✦
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-white">{content.vision.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{content.vision.text}</p>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>

        {content.images.length > 0 ? (
          <ScrollReveal className="mt-10 lg:mt-14">
            <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
              {heroImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:col-span-8 sm:aspect-auto sm:min-h-[320px]">
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    className="object-cover transition duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 720px"
                    unoptimized={isStorageImage(heroImage)}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
              ) : null}
              {galleryThumbs.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:col-span-4 sm:grid-cols-1 sm:gap-4">
                  {galleryThumbs.slice(0, 3).map((src, i) => (
                    <div
                      key={src}
                      className={cn(
                        "relative overflow-hidden rounded-xl border border-white/10",
                        i === 0 && "aspect-square sm:aspect-[4/3]",
                        i === 1 && "aspect-square sm:aspect-[4/3]",
                        i === 2 && "aspect-square sm:aspect-[4/3]",
                      )}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover transition duration-700 hover:scale-110"
                        sizes="240px"
                        unoptimized={isStorageImage(src)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </ScrollReveal>
        ) : null}
      </section>

      {content.values.length > 0 ? (
        <section className="relative overflow-hidden border-y border-white/5 py-14 sm:py-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(168,85,247,0.14),transparent),radial-gradient(ellipse_60%_45%_at_10%_100%,rgba(6,182,212,0.1),transparent)]"
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

            {content.values.length >= 2 ? (
              <ScrollReveal className="mt-8 overflow-hidden sm:mt-10">
                <div className="relative flex">
                  <div
                    className="marquee-track--forward flex shrink-0 gap-3 py-1"
                    style={{ "--marquee-duration": "28s" } as React.CSSProperties}
                  >
                    {[...content.values, ...content.values].map((value, index) => (
                      <span
                        key={`${value.title}-marquee-${index}`}
                        className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-slate-300"
                      >
                        {value.title}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ) : null}

            <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:gap-6">
              {content.values.map((value, index) => {
                const style = VALUE_STYLES[index % VALUE_STYLES.length];
                return (
                  <ScrollReveal key={`${value.title}-${index}`}>
                    <li
                      className={cn(
                        "group gradient-border h-full overflow-hidden transition duration-300",
                        style.glow,
                      )}
                    >
                      <div className="inner relative flex h-full gap-4 overflow-hidden p-5 sm:p-6">
                        <div className={cn("absolute inset-x-0 top-0 h-1", style.bar)} aria-hidden />
                        <span
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1",
                            style.icon,
                            style.ring,
                          )}
                        >
                          {VALUE_ICONS[index % VALUE_ICONS.length]}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{value.title}</h3>
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

      <section className={`${siteContainer} pt-12 sm:pt-14 lg:pt-16`}>
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-violet-600/15 to-cyan-600/10 p-8 text-center sm:p-12 lg:p-14">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent)]"
              aria-hidden
            />
            <p className="relative text-lg text-slate-200 sm:text-xl">
              {ar
                ? "جاهزون لتحويل فكرتك إلى تجربة لا تُنسى."
                : "Ready to turn your idea into an unforgettable experience."}
            </p>
            <Link
              href={contactPath}
              className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.4)] transition hover:scale-[1.03] hover:brightness-110"
            >
              {contactCta}
              <span className="text-lg rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
