import { PartnersPageView } from "@/components/partners/PartnersPageView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getPartnersPageContent } from "@/lib/site-page";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const [content, dict] = await Promise.all([
    getPartnersPageContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  return (
    <PartnersPageView locale={loc} content={content} contactCta={dict.nav.cta} />
  );
}
