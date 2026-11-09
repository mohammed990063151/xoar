import type { Metadata } from "next";
import { EquipmentDetailView } from "@/components/equipment/EquipmentDetailView";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { equipmentOfferingService } from "@/services/equipmentOfferingService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) return {};
  const item = await equipmentOfferingService.get(loc, slug);
  if (!item) return {};
  return pageMetadata("equipment", loc, `/${loc}/equipment/${slug}`, undefined, {
    title: `${item.title} | ${loc === "ar" ? "معدات اكزورا" : "Xora Equipment"}`,
    description: item.description?.slice(0, 160) || item.title,
  });
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();
  const offering = await equipmentOfferingService.get(loc, slug);
  if (!offering) notFound();

  return <EquipmentDetailView locale={loc} offering={offering} />;
}
