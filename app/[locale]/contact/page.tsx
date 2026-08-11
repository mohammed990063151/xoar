import type { Metadata } from "next";
import { ContactPageView } from "@/components/contact/ContactPageView";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("contact", loc, `/${loc}/contact`);
}

function parseCoord(value?: string): number | null {
  if (!value?.trim()) return null;
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : null;
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = await getSiteContent(loc);
  const settings = dict.settings;

  return (
    <ContactPageView
      locale={loc}
      copy={dict.pages.contact}
      whatsapp={settings?.whatsapp}
      email={settings?.email}
      phone={settings?.phone}
      social={settings?.social}
      address={settings?.address}
      mapLatitude={parseCoord(settings?.mapLatitude)}
      mapLongitude={parseCoord(settings?.mapLongitude)}
      mapLabel={settings?.mapLabel || settings?.address}
    />
  );
}
