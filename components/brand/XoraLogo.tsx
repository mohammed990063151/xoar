"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

/** Official mark: `public/logo-xora.png` — used everywhere via this component. */
interface XoraLogoProps {
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<XoraLogoProps["size"]>, string> = {
  sm: "h-6 max-h-6 sm:h-7 sm:max-h-7",
  md: "h-7 max-h-7 sm:h-9 sm:max-h-9",
  lg: "h-9 max-h-9 sm:h-11 sm:max-h-11",
};

const maxW: Record<NonNullable<XoraLogoProps["size"]>, string> = {
  sm: "max-w-[7.5rem] sm:max-w-[8.5rem]",
  md: "max-w-[9.5rem] sm:max-w-[11rem]",
  lg: "max-w-[12rem] sm:max-w-[14rem]",
};

export function XoraLogo({
  className,
  size = "md",
}: XoraLogoProps): React.ReactElement {
  return (
    <span
      className={cn(
        "xora-logo relative inline-flex shrink-0 items-center justify-center",
        sizeClass[size],
        maxW[size],
        className,
      )}
      dir="ltr"
    >
      <Image
        src="/logo-xora.png"
        alt=""
        width={320}
        height={120}
        className="h-full w-auto object-contain object-left"
        sizes="(max-width: 640px) 120px, 180px"
        priority
      />
    </span>
  );
}
