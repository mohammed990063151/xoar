import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import {
  pageBottom,
  pageEyebrow,
  pageHeroCentered,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  siteContainerNarrow,
} from "@/lib/layout";

export type LegalSection = {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
};

export type LegalDocumentCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly updated: string;
  readonly intro: string;
  readonly sections: readonly LegalSection[];
  readonly contactLabel: string;
  readonly contactEmail: string;
};

interface LegalDocumentViewProps {
  readonly locale: Locale;
  readonly copy: LegalDocumentCopy;
  readonly related?: readonly { readonly href: string; readonly label: string }[];
}

export function LegalDocumentView({
  locale,
  copy,
  related = [],
}: LegalDocumentViewProps): React.ReactElement {
  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div className={pageHeroInner}>
          <div className={pageHeroCentered}>
            <p className={pageEyebrow}>{copy.eyebrow}</p>
            <h1 className={pageTitle}>{copy.title}</h1>
            <p className="mt-3 text-sm text-slate-500">{copy.updated}</p>
            <p className={pageIntro}>{copy.intro}</p>
          </div>
        </div>
      </section>

      <article className={`${siteContainerNarrow} mt-10 space-y-10 sm:mt-14`}>
        {copy.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {section.title}
            </h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="list-disc space-y-2 ps-5 text-sm leading-7 text-slate-300 sm:text-base">
                {section.bullets.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">{copy.contactLabel}</h2>
          <a
            href={`mailto:${copy.contactEmail}`}
            className="mt-2 inline-block text-sm text-cyan-300 underline-offset-4 hover:underline"
            dir="ltr"
          >
            {copy.contactEmail}
          </a>
        </section>

        {related.length > 0 ? (
          <nav className="flex flex-wrap gap-3 border-t border-white/8 pt-6 text-sm">
            {related.map((link) => (
              <Link
                key={link.href}
                href={localizedPath(locale, link.href)}
                scroll={false}
                className="rounded-full border border-white/12 px-4 py-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </article>
    </div>
  );
}
