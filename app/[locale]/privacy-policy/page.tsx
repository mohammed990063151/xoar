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
  const copy = getDictionary(loc).pages.privacyPolicy;
  return pageMetadata("privacy-policy", loc, `/${loc}/privacy-policy`, undefined, {
    title: copy.title,
    description: copy.intro,
  });
}

export default async function PrivacyPolicyPage({
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
      copy={dict.pages.privacyPolicy}
      related={[
        { href: "/terms", label: dict.footer.terms },
        { href: "/data-deletion", label: dict.footer.dataDeletion },
      ]}
    />
  );
}
