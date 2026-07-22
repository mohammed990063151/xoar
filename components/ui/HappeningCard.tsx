"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ActivityCardMediaSlider } from "@/components/ui/ActivityCardMediaSlider";
import type { ActivityCardMediaSlide } from "@/components/ui/ActivityCardMediaSlider";
import { cn } from "@/lib/cn";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { HappeningItem } from "@/services/contentService";

interface HappeningCardProps {
  readonly locale: Locale;
  readonly item: HappeningItem;
  readonly cta: string;
  readonly className?: string;
}

function IconPin({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 17s5-4.5 5-9a5 5 0 1 0-10 0c0 4.5 5 9 5 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconCalendar({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function HappeningCard({
  locale,
  item,
  cta,
  className,
}: HappeningCardProps): React.ReactElement {
  const router = useRouter();
  const slug = item.slug || item.id;
  const path = localizedPath(locale, `/events/${slug}`);
  const cover = normalizeStorageImageUrl(item.image);
  const gallery = (item.gallery ?? [])
    .map((src) => normalizeStorageImageUrl(src))
    .filter(Boolean);
  const urls = gallery.length > 0 ? gallery : cover ? [cover] : [];
  const slides: ActivityCardMediaSlide[] = urls.map((url) => ({
    type: "image" as const,
    url,
  }));
  const dateLabel = formatDate(item.eventDate, locale);
  const ar = locale === "ar";

  return (
    <motion.div
      className={cn("gradient-border group h-full", className)}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex h-full flex-col overflow-hidden">
        <div className="relative w-full shrink-0">
          <ActivityCardMediaSlider
            slides={slides}
            title={item.title}
            locale={locale}
            onSlideClick={() => router.push(path)}
          />
          {item.categoryLabel || item.location ? (
            <span className="absolute start-3 top-3 z-20 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 backdrop-blur">
              {item.categoryLabel || item.location}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <Link href={path}>
            <h3 className="text-lg font-semibold text-white transition group-hover:text-cyan-200">
              {item.title}
            </h3>
          </Link>
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-400">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {item.location ? (
              <span className="inline-flex items-center gap-1.5">
                <IconPin className="h-3.5 w-3.5 text-cyan-400/80" />
                {item.location}
              </span>
            ) : null}
            {dateLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <IconCalendar className="h-3.5 w-3.5 text-cyan-400/80" />
                {dateLabel}
              </span>
            ) : null}
          </div>

          <Link
            href={path}
            className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-cyan-500 to-sky-600 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(34,211,238,0.25)] transition hover:brightness-110"
          >
            {cta || (ar ? "التفاصيل" : "Details")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
