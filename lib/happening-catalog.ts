import type { Locale } from "@/lib/i18n";
import type { HappeningItem } from "@/services/contentService";

const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const CATALOG: Array<{
  slug: string;
  image: string;
  ar: {
    title: string;
    description: string;
    body: string;
    location: string;
    highlights: string[];
  };
  en: {
    title: string;
    description: string;
    body: string;
    location: string;
    highlights: string[];
  };
}> = [
  {
    slug: "riyadh-season-night",
    image: u("photo-1470229722913-7c0e2dbbafd3"),
    ar: {
      title: "ليلة Boulevard — موسم الرياض",
      description: "فعالية ترفيهية مفتوحة مع عروض حية وإضاءة ديناميكية في Boulevard World.",
      body: "نصمّم ونشغّل أمسية متكاملة في موسم الرياض: مسرح، إضاءة، صوت، ومسارات زوار.",
      location: "بوليفارد World — الرياض",
      highlights: ["مسرح رئيسي", "عروض حية", "إدارة حشود"],
    },
    en: {
      title: "Boulevard Night — Riyadh Season",
      description: "An open entertainment night with live acts and dynamic lighting at Boulevard World.",
      body: "We design and run a full evening at Riyadh Season: stage, lighting, sound, and visitor flows.",
      location: "Boulevard World — Riyadh",
      highlights: ["Main stage", "Live acts", "Crowd management"],
    },
  },
  {
    slug: "innovation-expo",
    image: u("photo-1540575467063-178a50c2df87"),
    ar: {
      title: "LEAP 2026 — معرض التقنية",
      description: "معرض تقني سعودي ببوثات ذكية ومسارات زوار واضحة في الرياض.",
      body: "من تخطيط القاعة إلى تشغيل البوثات والشاشات — نغطي كل التفاصيل في LEAP.",
      location: "مركز المعارض — الرياض",
      highlights: ["بوثات تفاعلية", "شاشات LED", "تنسيق العلامات"],
    },
    en: {
      title: "LEAP 2026 — Tech Expo",
      description: "A Saudi tech expo with smart booths and clear visitor paths in Riyadh.",
      body: "From hall planning to booth and screen operations — we cover every detail at LEAP.",
      location: "Exhibition Center — Riyadh",
      highlights: ["Interactive booths", "LED screens", "Brand coordination"],
    },
  },
  {
    slug: "private-gala",
    image: u("photo-1511795409834-ef04bbd61622"),
    ar: {
      title: "حفل خاص — كورنيش جدة",
      description: "مناسبة خاصة بديكور وإضاءة ناعمة على كورنيش جدة.",
      body: "نحوّل المكان إلى مشهد بصري متماسك: دخول، برنامج، وإغلاقات أنيقة.",
      location: "الشاطئ — جدة",
      highlights: ["ديكور فاخر", "إضاءة ناعمة", "ضيافة متكاملة"],
    },
    en: {
      title: "Private gala — Jeddah Corniche",
      description: "A private occasion with soft lighting on Jeddah Corniche.",
      body: "We turn the venue into a cohesive visual scene: arrival, program, and elegant close.",
      location: "Al Shati — Jeddah",
      highlights: ["Luxury décor", "Soft lighting", "Full hospitality"],
    },
  },
];

export function fallbackHappenings(locale: Locale): HappeningItem[] {
  return CATALOG.map((item) => {
    const copy = item[locale];

    return {
      id: item.slug,
      slug: item.slug,
      title: copy.title,
      description: copy.description,
      body: copy.body,
      location: copy.location,
      highlights: copy.highlights,
      image: item.image,
      gallery: [item.image],
      eventDate: "",
      category: item.slug === "private-gala" ? "individual" : item.slug === "innovation-expo" ? "exhibitions" : "entertainment",
    };
  });
}

export function fallbackHappeningBySlug(
  locale: Locale,
  slug: string,
): HappeningItem | null {
  return fallbackHappenings(locale).find((h) => h.slug === slug) ?? null;
}
