import type { Metadata } from "next";
import { EquipmentCatalogView } from "@/components/equipment/EquipmentCatalogView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { equipmentOfferingService } from "@/services/equipmentOfferingService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("equipment", loc, `/${loc}/equipment`, undefined, {
    title: loc === "ar" ? "حجز وتأجير المعدات | اكزورا" : "Equipment rental | Xora",
    description:
      loc === "ar"
        ? "كتالوج معدات الفعاليات — صوت، إضاءة، شاشات، ومنصات مع حجز ودفع فوري."
        : "Event equipment catalog — sound, lighting, screens, and staging with instant booking.",
  });
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);
  const offerings = await equipmentOfferingService.list(loc, "all");

  return (
    <EquipmentCatalogView locale={loc} offerings={offerings} copy={dict.pages.equipment} />
  );
}
