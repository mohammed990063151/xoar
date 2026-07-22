import type { Locale } from "@/lib/i18n";
import type { ServiceDetail, ServiceListItem } from "@/services/contentService";

const CATALOG: Array<{
  slug: string;
  iconKey: string;
  image: string;
  gallery: string[];
  ar: {
    title: string;
    shortLabel: string;
    description: string;
    body: string;
    highlights: string[];
  };
  en: {
    title: string;
    shortLabel: string;
    description: string;
    body: string;
    highlights: string[];
  };
}> = [
  {
    slug: "event-strategy",
    iconKey: "strategy",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d4666e?w=1200&q=80",
    ],
    ar: {
      title: "استراتيجية الفعالية",
      shortLabel: "استراتيجية",
      description: "أهداف، جمهور، رسائل، وجدول زمني واقعي يضمن نجاح الحدث منذ البداية.",
      body: "نبدأ بفهم هدفك التجاري والجمهور المستهدف، ثم نبني مفهوم الفعالية والرسائل والجدول الزمني.\n\nيشمل العمل: ورشة اكتشاف، خريطة أصحاب المصلحة، مؤشرات نجاح قابلة للقياس، وخطة مخاطر واضحة قبل التنفيذ.",
      highlights: [
        "ورشة اكتشاف وتحديد الأهداف",
        "خطة زمنية وميزانية واقعية",
        "مؤشرات نجاح قابلة للقياس",
      ],
    },
    en: {
      title: "Event strategy",
      shortLabel: "Strategy",
      description:
        "Goals, audience, messaging, and a realistic timeline that sets the event up for success.",
      body: "We start by understanding your business goal and audience, then shape the event concept, messaging, and timeline.\n\nThis includes a discovery workshop, stakeholder map, measurable success metrics, and a clear risk plan before production begins.",
      highlights: [
        "Discovery workshop and goal setting",
        "Realistic timeline and budget",
        "Measurable success metrics",
      ],
    },
  },
  {
    slug: "production-delivery",
    iconKey: "production",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    ],
    ar: {
      title: "الإنتاج والتنفيذ",
      shortLabel: "إنتاج",
      description: "موردون معتمدون، جداول تشغيل دقيقة، وإدارة مخاطر على أرض الواقع.",
      body: "ندير الإنتاج من الفكرة إلى الإغلاق: موردون موثوقون، جداول تشغيل دقيقة، وتنسيق فرق العمل على الموقع.\n\nفريقنا يتابع الجودة لحظة بلحظة ويضمن تسليماً سلساً دون مفاجآت.",
      highlights: [
        "إدارة موردين وتشغيل ميداني",
        "جداول دقيقة لكل مرحلة",
        "متابعة جودة لحظية يوم الحدث",
      ],
    },
    en: {
      title: "Production & delivery",
      shortLabel: "Production",
      description: "Trusted vendors, precise run-of-show, and on-site risk management.",
      body: "We manage production from concept to closeout: trusted vendors, precise run-of-show, and on-site team coordination.\n\nOur crew monitors quality in real time and keeps delivery smooth without surprises.",
      highlights: [
        "Vendor and on-site operations",
        "Precise stage-by-stage schedules",
        "Live quality control on event day",
      ],
    },
  },
  {
    slug: "content-experience",
    iconKey: "content",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
      "https://images.unsplash.com/photo-1527529482834-994875700de4?w=1200&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
    ],
    ar: {
      title: "المحتوى والتجربة",
      shortLabel: "تجربة",
      description: "سيناريوهات، أركان تفاعلية، وورش عمل ترفع تفاعل الحضور.",
      body: "نصمم تجربة الحضور من لحظة الوصول حتى المغادرة: سيناريو، إيقاع، وأركان تفاعلية.\n\nالمحتوى يخدم الرسالة، والتجربة تبقى في الذاكرة بعد انتهاء الحدث.",
      highlights: [
        "سيناريو وإيقاع للفعالية",
        "أركان تفاعلية وورش",
        "تجربة متماسكة من الدخول للخروج",
      ],
    },
    en: {
      title: "Content & experience",
      shortLabel: "Experience",
      description: "Scenarios, interactive zones, and workshops that raise guest engagement.",
      body: "We design the guest journey from arrival to departure: narrative, pacing, and interactive moments.\n\nContent serves the message, and the experience stays memorable after the event ends.",
      highlights: [
        "Event narrative and pacing",
        "Interactive zones and workshops",
        "Cohesive journey from entry to exit",
      ],
    },
  },
  {
    slug: "coverage-broadcast",
    iconKey: "media",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1af244dba?w=1200&q=80",
    ],
    ar: {
      title: "التغطية والبث",
      shortLabel: "تغطية",
      description: "تصوير، بث مباشر، ومونتاج مختصر للترويج بعد الحدث.",
      body: "نغطي لحظات الحدث بصرياً: تصوير احترافي، بث مباشر عند الحاجة، ومونتاج يصلح للنشر فوراً.\n\nالمحتوى يصبح أصل تسويقي يمتد أثر الفعالية بعد انتهائها.",
      highlights: [
        "تصوير فوتوغرافي وفيديو",
        "بث مباشر عند الحاجة",
        "مقاطع جاهزة للنشر بعد الحدث",
      ],
    },
    en: {
      title: "Coverage & broadcast",
      shortLabel: "Coverage",
      description:
        "Photography, live streaming, and short edits ready for post-event promotion.",
      body: "We capture the event visually: professional photography, live streaming when needed, and edits ready to publish.\n\nThe content becomes a marketing asset that extends the event’s impact after it ends.",
      highlights: [
        "Photo and video coverage",
        "Live streaming when needed",
        "Publish-ready post-event clips",
      ],
    },
  },
];

export function fallbackServices(locale: Locale): ServiceListItem[] {
  return CATALOG.map((item) => {
    const copy = item[locale];
    return {
      id: item.slug,
      slug: item.slug,
      title: copy.title,
      shortLabel: copy.shortLabel,
      description: copy.description,
      body: copy.body,
      highlights: copy.highlights,
      iconKey: item.iconKey,
      image: item.image,
      gallery: item.gallery,
    };
  });
}

export function fallbackServiceBySlug(
  locale: Locale,
  slug: string,
): ServiceDetail | null {
  const all = fallbackServices(locale);
  const item = all.find((service) => service.slug === slug);
  if (!item) return null;

  return {
    ...item,
    related: all.filter((service) => service.slug !== slug).slice(0, 3),
  };
}
