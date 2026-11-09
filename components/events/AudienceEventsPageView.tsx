"use client";

import Link from "next/link";
import { EventRequestPageView } from "@/components/events/EventRequestPageView";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";

type Audience = "individual" | "corporate";

interface AudienceEventsPageViewProps {
  readonly locale: Locale;
  readonly audience: Audience;
  readonly copy: Dictionary["pages"]["individualEvents"] | Dictionary["pages"]["corporateEvents"];
  readonly formCopy: Dictionary["pages"]["requestEvent"];
}

export function AudienceEventsPageView({
  locale,
  audience,
  copy,
  formCopy,
}: AudienceEventsPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const formOverrides = {
    ...formCopy,
    eyebrow: copy.eyebrow,
    title: copy.formTitle,
    intro: copy.intro,
    submit: copy.cta,
  };

  return (
    <div className={pageBottom}>
      <div className={siteContainer}>
        <SlideInEdge from={ar ? "end" : "start"} className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
            {copy.eyebrow}
          </p>
          <h1 className={`mt-3 ${pageTitle}`}>{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-400">{copy.intro}</p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {copy.highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-relaxed text-slate-200"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, "/services")}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              {ar ? "كل خدماتنا" : "All services"}
            </Link>
            <Link
              href={localizedPath(locale, audience === "corporate" ? "/individual-events" : "/corporate-events")}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              {audience === "corporate"
                ? ar
                  ? "فعاليات الأفراد"
                  : "Individual events"
                : ar
                  ? "فعاليات الشركات"
                  : "Corporate events"}
            </Link>
          </div>
        </SlideInEdge>

        <div className="mt-4">
          <EventRequestPageView
            locale={locale}
            copy={formOverrides}
            mode={audience}
            hideIntro
          />
        </div>
      </div>
    </div>
  );
}
