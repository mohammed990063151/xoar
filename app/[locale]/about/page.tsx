import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getSiteContent } from "@/services/contentService";
import { siteContainerNarrow } from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = await getSiteContent(loc);
  const p = dict.pages.about;

  return (
    <div className={`${siteContainerNarrow} py-16`}>
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{p.title}</h1>
      </ScrollReveal>
      <ScrollReveal>
        <p className="mt-6 text-lg leading-relaxed text-slate-300">{p.p1}</p>
      </ScrollReveal>
      <ScrollReveal>
        <p className="mt-4 text-lg leading-relaxed text-slate-300">{p.p2}</p>
      </ScrollReveal>
      <ScrollReveal>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {p.values.map((v) => (
            <li
              key={v}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200"
            >
              {v}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
}
