import type { EquipmentCategory } from "@/types/equipment-offering";
import type { Locale } from "@/lib/i18n";

export interface EquipmentCategoryMeta {
  id: EquipmentCategory | "all";
  label: string;
  icon: string;
  hint: string;
}

export function equipmentCategories(locale: Locale): EquipmentCategoryMeta[] {
  const ar = locale === "ar";
  return [
    {
      id: "all",
      label: ar ? "الكل" : "All",
      icon: "✦",
      hint: ar ? "كل المعدات المتاحة" : "Everything available",
    },
    {
      id: "sound",
      label: ar ? "صوت" : "Sound",
      icon: "♪",
      hint: ar ? "أنظمة صوت ومايكات" : "PA systems & mics",
    },
    {
      id: "lighting",
      label: ar ? "إضاءة" : "Lighting",
      icon: "✧",
      hint: ar ? "إضاءة مسرح وفعاليات" : "Stage & event lights",
    },
    {
      id: "screens",
      label: ar ? "شاشات" : "Screens",
      icon: "▣",
      hint: ar ? "LED وبروجكتر" : "LED & projectors",
    },
    {
      id: "staging",
      label: ar ? "منصات" : "Staging",
      icon: "▭",
      hint: ar ? "ستيج ومنصات" : "Stages & platforms",
    },
    {
      id: "bundle",
      label: ar ? "باقات جاهزة" : "Bundles",
      icon: "◆",
      hint: ar ? "حزم متكاملة للفعالية" : "Full event kits",
    },
  ];
}

export function categoryLabel(category: EquipmentCategory, locale: Locale): string {
  return equipmentCategories(locale).find((c) => c.id === category)?.label
    ?? (locale === "ar" ? "معدات" : "Equipment");
}
