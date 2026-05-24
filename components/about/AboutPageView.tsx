import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { AboutPageContent } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { isStorageImage } from "@/lib/image-url";

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

export function AboutPageView({
  locale,
  content,
  contactCta,
}: AboutPageViewProps): React.ReactElement {
  const contactPath = localizedPath(locale, "/contact");
  const [heroImage, ...galleryRest] = content.images;
  const gallery = galleryRest.length > 0 ? galleryRest : content.images;

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(168,85,247,0.22),transparent),radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(59,130,246,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <ScrollReveal>
            {content.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400/90">
                {content.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {content.title}
            </h1>
            {content.intro ? (
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
                {content.intro}
              </p>
            ) : null}
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <ScrollReveal>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400/90">
                {locale === "ar" ? "قصتنا" : "Our story"}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">{content.p1}</p>
            </ScrollReveal>
            <ScrollReveal>
              <p className="text-lg leading-relaxed text-slate-400">{content.p2}</p>
            </ScrollReveal>
            <ScrollReveal>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="gradient-border h-full">
                  <div className="inner h-full p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-white">{content.mission.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{content.mission.text}</p>
                  </div>
                </article>
                <article className="gradient-border h-full">
                  <div className="inner h-full p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-white">{content.vision.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{content.vision.text}</p>
                  </div>
                </article>
              </div>
            </ScrollReveal>
          </div>

          {content.images.length > 0 ? (
            <ScrollReveal className="space-y-3">
              {heroImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 520px"
                    priority
                    unoptimized={isStorageImage(heroImage)}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent"
                    aria-hidden
                  />
                </div>
              ) : null}
              {gallery.length > 1 ? (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.slice(0, 3).map((src) => (
                    <div
                      key={src}
                      className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized={isStorageImage(src)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
                {locale === "ar"
                  ? "أضف صوراً من لوحة التحكم → صفحات الموقع → من نحن"
                  : "Add images from Dashboard → Site pages → About"}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
                {locale === "ar" ? "ما يميزنا" : "What sets us apart"}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                {locale === "ar" ? "قيمنا في العمل" : "Our values"}
              </h2>
            </div>
          </ScrollReveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {content.values.map((value, index) => (
              <ScrollReveal key={`${value.title}-${index}`}>
                <li className="group gradient-border h-full transition duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
                  <div className="inner flex h-full gap-4 p-5 sm:p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/25 text-cyan-300 ring-1 ring-white/10">
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
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-slate-400">
            {locale === "ar"
              ? "جاهزون لتحويل فكرتك إلى تجربة لا تُنسى."
              : "Ready to turn your idea into an unforgettable experience."}
          </p>
          <Link
            href={contactPath}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110"
          >
            {contactCta}
            <span className="text-lg rtl:rotate-180" aria-hidden>
              →
            </span>
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
