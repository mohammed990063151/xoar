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

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const eventGallery: readonly EventGalleryItem[] = [
  {
    id: "1",
    filter: "exhibitions",
    titleAr: "LEAP 2026 — الرياض",
    titleEn: "LEAP 2026 — Riyadh",
    descAr: "مؤتمر تقني سعودي ضخم: مسرح رئيسي، شاشات LED، ومسارات زوار لآلاف الحضور.",
    descEn: "Major Saudi tech conference: main stage, LED screens, and visitor flows for thousands.",
    image: u("photo-1540575467063-178a50c2df87"),
  },
  {
    id: "2",
    filter: "entertainment",
    titleAr: "موسم الرياض — ليلة Boulevard",
    titleEn: "Riyadh Season — Boulevard Night",
    descAr: "عروض حية وإضاءة ديناميكية في قلب موسم الرياض.",
    descEn: "Live acts and dynamic lighting at the heart of Riyadh Season.",
    image: u("photo-1470229722913-7c0e2dbbafd3"),
  },
  {
    id: "3",
    filter: "individual",
    titleAr: "حفل زفاف في الدرعية",
    titleEn: "Wedding celebration in Diriyah",
    descAr: "ديكور فاخر وإضاءة ناعمة في أجواء تراثية سعودية.",
    descEn: "Luxury décor and soft lighting in authentic Saudi heritage setting.",
    image: u("photo-1511795409834-ef04bbd61622"),
  },
  {
    id: "4",
    filter: "exhibitions",
    titleAr: "معرض سكّك — قطار الحرمين",
    titleEn: "Sikkah Expo — Haramain Rail",
    descAr: "بوثات تفاعلية ومسارات زوار واضحة في معرض سعودي.",
    descEn: "Interactive booths and clear visitor paths at a Saudi expo.",
    image: u("photo-1505373877841-8d25f7d46678"),
  },
  {
    id: "5",
    filter: "entertainment",
    titleAr: "سينما تحت النجوم — العلا",
    titleEn: "Open-air cinema — AlUla",
    descAr: "عرض سينمائي في وادي العلا تحت سماء الصحراء.",
    descEn: "Cinema screening in AlUla valley under desert skies.",
    image: u("photo-1489599849927-2ee91cede3ba"),
  },
  {
    id: "6",
    filter: "individual",
    titleAr: "احتفال اليوم الوطني — الدمام",
    titleEn: "National Day celebration — Dammam",
    descAr: "فعالية وطنية بألوان العلم السعودي وعروض للعائلات.",
    descEn: "National celebration with Saudi flag colours and family shows.",
    image: u("photo-1519741497674-611481863552"),
  },
];

export function getEventById(id: string): EventGalleryItem | undefined {
  return eventGallery.find((e) => e.id === id);
}
