export type EventGalleryFilter = "individual" | "exhibitions" | "entertainment";

export interface EventGalleryItem {
  readonly id: string;
  readonly filter: EventGalleryFilter;
  readonly titleAr: string;
  readonly titleEn: string;
  readonly descAr: string;
  readonly descEn: string;
  readonly image: string;
}

export const eventGallery: readonly EventGalleryItem[] = [
  {
    id: "1",
    filter: "exhibitions",
    titleAr: "قمة التقنية ٢٠٢٥",
    titleEn: "Tech Summit 2025",
    descAr: "مسرح رئيسي، شاشات ضخمة، وتجربة زوار متكاملة.",
    descEn: "Main stage, LED canvas, and a cohesive visitor journey.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    id: "2",
    filter: "entertainment",
    titleAr: "ليلة الإيقاع",
    titleEn: "Rhythm Night",
    descAr: "إضاءة ديناميكية وعروض حية لمدينة الرياض.",
    descEn: "Dynamic lighting and live acts in Riyadh.",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    id: "3",
    filter: "individual",
    titleAr: "احتفال خاص",
    titleEn: "Private celebration",
    descAr: "تصميم ديكور فاخر وتنسيق لحظة بلحظة.",
    descEn: "Luxury decor design and moment-by-moment coordination.",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  },
  {
    id: "4",
    filter: "exhibitions",
    titleAr: "معرض الابتكار",
    titleEn: "Innovation Expo",
    descAr: "بوثات ذكية ومسارات زوار واضحة.",
    descEn: "Smart booths and clear visitor flows.",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  },
  {
    id: "5",
    filter: "entertainment",
    titleAr: "سينما تحت النجوم",
    titleEn: "Open-air cinema",
    descAr: "تجربة بصرية وصوتية للمجتمعات.",
    descEn: "Immersive audiovisual community experience.",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  },
  {
    id: "6",
    filter: "individual",
    titleAr: "عرس بتفاصيل ذهبية",
    titleEn: "Gold-detail wedding",
    descAr: "إضاءة ناعمة ومشهد بصري رومانسي.",
    descEn: "Soft lighting and a romantic visual scene.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  },
];

export function getEventById(id: string): EventGalleryItem | undefined {
  return eventGallery.find((e) => e.id === id);
}
