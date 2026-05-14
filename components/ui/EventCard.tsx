"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface EventCardProps {
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly href: string;
  readonly cta: string;
  readonly className?: string;
  /** CSS aspect-ratio value, e.g. `"16 / 11"` */
  readonly imageAspect?: string;
  readonly imageObjectFit?: "cover" | "contain";
}

export function EventCard({
  locale,
  title,
  description,
  imageSrc,
  href,
  cta,
  className,
  imageAspect = "60 / 100",
  imageObjectFit = "cover",
}: EventCardProps): React.ReactElement {
  const path = href.startsWith("/") ? localizedPath(locale, href) : href;
  const isContain = imageObjectFit === "contain";

  return (
    <motion.div
      className={cn("gradient-border group h-full", className)}
      whileHover={{
        y: -10,
        scale: 1.02,
        rotateZ: locale === "ar" ? 0.4 : -0.4,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex h-full flex-col overflow-hidden">
        <Link href={path} className="relative block w-full shrink-0">
          <div
            className={cn(
              "relative w-full overflow-hidden",
              isContain ? "bg-slate-900/90" : "bg-slate-950",
            )}
            style={{ aspectRatio: imageAspect }}
          >
            <Image
              src={imageSrc}
              alt={title}
              fill
              className={cn(
                "transition duration-700 group-hover:scale-105",
                isContain ? "object-contain" : "object-cover",
              )}
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent",
                isContain ? "opacity-50" : "opacity-90",
              )}
            />
          </div>
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="line-clamp-3 flex-1 text-sm text-slate-400">
            {description}
          </p>
          <Link
            href={path}
            className="mt-auto inline-flex items-center justify-center rounded-full bg-gradient-to-l from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25"
          >
            {cta}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
