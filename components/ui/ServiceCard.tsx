"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { normalizeStorageImageUrl, useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface ServiceCardProps {
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
  readonly imageSrc?: string;
  readonly icon?: React.ReactNode;
  readonly indexLabel?: string;
  readonly className?: string;
}

export function ServiceCard({
  locale,
  title,
  description,
  href,
  cta,
  imageSrc,
  icon,
  indexLabel,
  className,
}: ServiceCardProps): React.ReactElement {
  const path = localizedPath(locale, href);
  const imageUrl = imageSrc ? normalizeStorageImageUrl(imageSrc) : "";

  return (
    <motion.div
      className={cn("gradient-border group h-full", className)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href={path} className="inner flex h-full flex-col overflow-hidden">
        {imageUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
              unoptimized={useUnoptimizedImage(imageUrl)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent opacity-85" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-6 pt-6">
            {icon ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/25 text-cyan-300 ring-1 ring-white/10 transition group-hover:scale-105">
                {icon}
              </span>
            ) : null}
            {indexLabel ? (
              <span className="text-xs font-medium text-slate-500">{indexLabel}</span>
            ) : null}
          </div>
        )}
        <div className={cn("flex flex-1 flex-col p-6", imageUrl && "pt-5")}>
          {!imageUrl && indexLabel && !icon ? (
            <span className="text-xs font-medium text-slate-500">{indexLabel}</span>
          ) : null}
          {imageUrl && icon ? (
            <span className="-mt-10 mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/90 text-cyan-300 shadow-lg backdrop-blur">
              {icon}
            </span>
          ) : null}
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3">
            {description}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:gap-3">
            {cta}
            <span aria-hidden className="rtl:rotate-180">
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
