"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { isStorageImage, normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

export interface ActivityCardData {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly organizer?: string;
  readonly location?: string;
  readonly eventDate?: string;
  readonly price?: string;
}

interface ActivityCardProps {
  readonly locale: Locale;
  readonly activity: ActivityCardData;
  readonly bookCta: string;
  /** Override CTA destination (e.g. direct to /book) */
  readonly bookHref?: string;
  readonly className?: string;
  /** CSS aspect-ratio — default 4/3 for home showcase */
  readonly imageAspect?: string;
  readonly onBook?: () => void;
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

function IconPrice({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 6.5v7M8 8.5h3.2a1.2 1.2 0 0 1 0 2.4H8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetaItem({
  icon,
  value,
}: {
  readonly icon: React.ReactElement;
  readonly value: string;
}): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-300">
      <span className="text-purple-400">{icon}</span>
      <span className="text-xs sm:text-sm">{value}</span>
    </span>
  );
}

export function ActivityCard({
  locale,
  activity,
  bookCta,
  bookHref,
  className,
  imageAspect = "4 / 3",
  onBook,
}: ActivityCardProps): React.ReactElement {
  const path = localizedPath(locale, `/activities/${activity.slug}`);
  const ctaPath = bookHref ?? path;
  const imageUrl = normalizeStorageImageUrl(activity.image);
  const organizerLabel = locale === "ar" ? "تنظيم:" : "By:";

  const meta: React.ReactElement[] = [];
  if (activity.location?.trim()) {
    meta.push(
      <MetaItem key="loc" icon={<IconPin className="h-4 w-4 shrink-0" />} value={activity.location} />,
    );
  }
  if (activity.eventDate?.trim()) {
    meta.push(
      <MetaItem
        key="date"
        icon={<IconCalendar className="h-4 w-4 shrink-0" />}
        value={activity.eventDate}
      />,
    );
  }
  if (activity.price?.trim()) {
    meta.push(
      <MetaItem key="price" icon={<IconPrice className="h-4 w-4 shrink-0" />} value={activity.price} />,
    );
  }

  const bookButtonClass =
    "mt-1 flex w-full items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)] transition hover:brightness-110";

  return (
    <motion.div
      className={cn("gradient-border group h-full", className)}
      whileHover={{
        y: -8,
        scale: 1.015,
        rotateZ: locale === "ar" ? 0.35 : -0.35,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex h-full flex-col overflow-hidden">
        <Link href={path} className="relative block w-full shrink-0">
          <div
            className="relative w-full overflow-hidden bg-slate-950"
            style={{ aspectRatio: imageAspect }}
          >
            <Image
              src={imageUrl}
              alt={activity.title}
              fill
              unoptimized={isStorageImage(imageUrl)}
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent opacity-90"
              aria-hidden
            />
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
          <p className="text-xs text-slate-500">
            {organizerLabel}{" "}
            <span className="text-slate-400">{activity.organizer?.trim() || "Xora"}</span>
          </p>

          <Link href={path} className="group/title">
            <h3 className="text-lg font-bold leading-snug text-white transition group-hover/title:text-purple-200 sm:text-xl">
              {activity.title}
            </h3>
          </Link>

          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-400">
            {activity.description}
          </p>

          {meta.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl border border-white/[0.06] bg-slate-950/80 px-3 py-2.5 sm:gap-x-3 sm:px-4 sm:py-3">
              {meta.map((item, index) => (
                <span key={item.key} className="inline-flex items-center gap-2">
                  {index > 0 ? (
                    <span className="text-slate-600 select-none" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {onBook ? (
            <button type="button" onClick={onBook} className={bookButtonClass}>
              {bookCta}
            </button>
          ) : (
            <Link href={ctaPath} className={bookButtonClass}>
              {bookCta}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
