import type { Locale } from "@/lib/i18n";
import type { HappeningItem } from "@/services/contentService";

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
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80",
    ar: {
      title: "ليلة موسم الرياض",
      description: "فعالية ترفيهية مفتوحة مع عروض حية وإضاءة ديناميكية.",
      body: "نصمّم ونشغّل أمسية متكاملة: مسرح، إضاءة، صوت، ومسارات زوار.",
      location: "الرياض",
      highlights: ["مسرح رئيسي", "عروض حية", "إدارة حشود"],
    },
    en: {
      title: "Riyadh Season Night",
      description: "An open entertainment night with live acts and dynamic lighting.",
      body: "We design and run a full evening: stage, lighting, sound, and visitor flows.",
      location: "Riyadh",
      highlights: ["Main stage", "Live acts", "Crowd management"],
    },
  },
  {
    slug: "innovation-expo",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80",
    ar: {
      title: "معرض الابتكار",
      description: "معرض تقني ببوثات ذكية ومسارات زوار واضحة.",
      body: "من تخطيط القاعة إلى تشغيل البوثات والشاشات — نغطي كل التفاصيل.",
      location: "الرياض",
      highlights: ["بوثات تفاعلية", "شاشات LED", "تنسيق العلامات"],
    },
    en: {
      title: "Innovation Expo",
      description: "A tech expo with smart booths and clear visitor paths.",
      body: "From hall planning to booth and screen operations — we cover every detail.",
      location: "Riyadh",
      highlights: ["Interactive booths", "LED screens", "Brand coordination"],
    },
  },
  {
    slug: "private-gala",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80",
    ar: {
      title: "حفل خاص فاخر",
      description: "مناسبة خاصة بديكور وإضاءة ناعمة وتنسيق لحظة بلحظة.",
      body: "نحوّل المكان إلى مشهد بصري متماسك: دخول، برنامج، وإغلاقات أنيقة.",
      location: "جدة",
      highlights: ["ديكور فاخر", "إضاءة ناعمة", "ضيافة متكاملة"],
    },
    en: {
      title: "Private luxury gala",
      description: "A private occasion with soft lighting and moment-by-moment coordination.",
      body: "We turn the venue into a cohesive visual scene: arrival, program, and elegant close.",
      location: "Jeddah",
      highlights: ["Luxury décor", "Soft lighting", "Full hospitality"],
    },
  },
];

export function fallbackHappenings(locale: Locale): HappeningItem[] {
  return CATALOG.map((item) => {
    const copy = item[locale];
    const category =
      item.slug === "private-gala"
        ? "individual"
        : item.slug === "innovation-expo"
          ? "exhibitions"
          : "entertainment";
    return {
      id: item.slug,
      slug: item.slug,
      title: copy.title,
      description: copy.description,
      body: copy.body,
      category,
      categoryLabel:
        locale === "ar"
          ? category === "individual"
            ? "أفراد"
            : category === "exhibitions"
              ? "معارض"
              : "ترفيه"
          : category === "individual"
            ? "Individuals"
            : category === "exhibitions"
              ? "Exhibitions"
              : "Entertainment",
      location: copy.location,
      highlights: copy.highlights,
      image: item.image,
      gallery: [item.image],
    };
  });
}

export function fallbackHappeningBySlug(
  locale: Locale,
  slug: string,
): HappeningItem | null {
  const all = fallbackHappenings(locale);
  const item = all.find((entry) => entry.slug === slug);
  if (!item) return null;
  return {
    ...item,
    related: all.filter((entry) => entry.slug !== slug).slice(0, 3),
  };
}
