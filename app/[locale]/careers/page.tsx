import { CareersPageView } from "@/components/careers/CareersPageView";
import { isLocale } from "@/lib/i18n";
import { getCareersPageContent } from "@/lib/site-page";
import { notFound } from "next/navigation";

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const content = await getCareersPageContent(loc);

  return <CareersPageView locale={loc} content={content} />;
}
