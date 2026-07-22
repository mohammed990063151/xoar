"use client";

import { ShowcaseGallerySlider } from "@/components/ui/ShowcaseGallerySlider";
import type { Locale } from "@/lib/i18n";

interface MediaGallerySliderProps {
  readonly images: readonly string[];
  readonly locale: Locale;
  readonly title: string;
  readonly emptyHint?: string;
  readonly className?: string;
  readonly aspect?: string;
  readonly autoplayMs?: number;
  readonly size?: "default" | "hero";
}

/** @deprecated Use ShowcaseGallerySlider — kept as alias for older imports */
export function MediaGallerySlider({
  images,
  locale,
  title,
  emptyHint,
  className,
  autoplayMs,
}: MediaGallerySliderProps): React.ReactElement {
  return (
    <ShowcaseGallerySlider
      images={images}
      locale={locale}
      title={title}
      emptyHint={emptyHint}
      className={className}
      autoplayMs={autoplayMs}
    />
  );
}
