import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { getDictionary } from "@/lib/dictionary";
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
  const copy = getDictionary(loc).pages.terms;
  return pageMetadata("terms", loc, `/${loc}/terms`, undefined, {
    title: copy.title,
    description: copy.intro,
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);

  return (
    <LegalDocumentView
      locale={loc}
      copy={dict.pages.terms}
      related={[
        { href: "/privacy-policy", label: dict.footer.privacy },
        { href: "/data-deletion", label: dict.footer.dataDeletion },
      ]}
    />
  );
}
