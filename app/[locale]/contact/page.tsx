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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = await getSiteContent(loc);

  return (
    <ContactPageView
      locale={loc}
      copy={dict.pages.contact}
      whatsapp={dict.settings?.whatsapp}
      email={dict.settings?.email}
      phone={dict.settings?.phone}
      social={dict.settings?.social}
    />
  );
}
