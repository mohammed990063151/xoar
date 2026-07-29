"use client";

import Image from "next/image";
import { XoraLogo } from "@/components/brand/XoraLogo";
import { cn } from "@/lib/cn";
import { isStorageImage, normalizeStorageImageUrl, useUnoptimizedImage } from "@/lib/image-url";

interface SiteLogoProps {
  readonly logoUrl?: string;
  readonly alt?: string;
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg" | "xl";
}

const sizeClass: Record<NonNullable<SiteLogoProps["size"]>, string> = {
  sm: "h-6 max-h-6 sm:h-7 sm:max-h-7",
  md: "h-7 max-h-7 sm:h-9 sm:max-h-9",
  lg: "h-9 max-h-9 sm:h-11 sm:max-h-11",
  xl: "h-11 max-h-11 sm:h-14 sm:max-h-14",
};

const maxW: Record<NonNullable<SiteLogoProps["size"]>, string> = {
  sm: "max-w-[7.5rem] sm:max-w-[8.5rem]",
  md: "max-w-[9.5rem] sm:max-w-[11rem]",
  lg: "max-w-[12rem] sm:max-w-[14rem]",
  xl: "max-w-[14rem] sm:max-w-[18rem]",
};

export function SiteLogo({
  logoUrl,
  alt = "Logo",
  className,
  size = "md",
}: SiteLogoProps): React.ReactElement {
  const src = logoUrl?.trim() ? normalizeStorageImageUrl(logoUrl.trim()) : "";

  if (!src) {
    return <XoraLogo size={size === "xl" ? "lg" : size} className={className} />;
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        sizeClass[size],
        maxW[size],
        className,
      )}
      dir="ltr"
    >
      <Image
        src={src}
        alt={alt}
        width={320}
        height={120}
        className="h-full w-auto max-w-full object-contain object-left"
        sizes="(max-width: 640px) 140px, 200px"
        unoptimized={useUnoptimizedImage(src) || isStorageImage(src)}
        priority={size === "md" || size === "lg"}
      />
    </span>
  );
}
