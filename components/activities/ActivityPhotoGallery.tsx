"use client";

import Image from "next/image";
import { isStorageImage } from "@/lib/image-url";

interface ActivityPhotoGalleryProps {
  readonly images: readonly string[];
  readonly title: string;
  readonly activeIndex?: number;
  readonly onSelect?: (index: number) => void;
}

export function ActivityPhotoGallery({
  images,
  title,
  activeIndex,
  onSelect,
}: ActivityPhotoGalleryProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((src, index) => {
        const isActive = activeIndex === index;
        const interactive = typeof onSelect === "function";

        const inner = (
          <>
            <Image
              src={src}
              alt={`${title} — ${index + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              unoptimized={isStorageImage(src)}
              sizes="(max-width:640px) 50vw, 33vw"
            />
            {isActive ? (
              <span className="absolute inset-0 ring-2 ring-cyan-400 ring-inset" aria-hidden />
            ) : null}
          </>
        );

        const className =
          "group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 " +
          (interactive ? "cursor-pointer hover:border-cyan-500/40" : "");

        if (interactive) {
          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              className={className}
              aria-label={`${title} ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
            >
              {inner}
            </button>
          );
        }

        return (
          <div key={`${src}-${index}`} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
