import { AboutPageView } from "@/components/about/AboutPageView";
import { getDictionary } from "@/lib/dictionary";
import { getAboutPageContent } from "@/lib/site-page";
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

  const [content, dict] = await Promise.all([
    getAboutPageContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  return (
    <AboutPageView
      locale={loc}
      content={content}
      contactCta={dict.nav.cta}
    />
  );
}
