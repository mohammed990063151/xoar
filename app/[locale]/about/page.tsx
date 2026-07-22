import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getAboutPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("about", loc, `/${loc}/about`);
}

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
