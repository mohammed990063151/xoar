import { PartnersPageView } from "@/components/partners/PartnersPageView";
import { isLocale } from "@/lib/i18n";
import { getPartnersPageContent } from "@/lib/site-page";
import { notFound } from "next/navigation";

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const content = await getPartnersPageContent(loc);

  return <PartnersPageView locale={loc} content={content} />;
}
