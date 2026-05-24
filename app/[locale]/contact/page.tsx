import { ContactForm } from "@/components/contact/ContactForm";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = await getSiteContent(loc);

  return <ContactForm copy={dict.pages.contact} locale={loc} />;
  return <ContactForm locale={loc} copy={dict.pages.contact} />;
}
