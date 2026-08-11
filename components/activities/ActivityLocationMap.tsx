"use client";

import { useDocumentTheme } from "@/hooks/useDocumentTheme";

interface ActivityLocationMapProps {
  readonly locale?: "ar" | "en";
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly locationText?: string;
  readonly title?: string;
}

export function ActivityLocationMap({
  locale = "ar",
  latitude,
  longitude,
  locationText,
  title,
}: ActivityLocationMapProps): React.ReactElement | null {
  const light = useDocumentTheme() === "light";
  const hasCoords =
    typeof latitude === "number" &&
    !Number.isNaN(latitude) &&
    typeof longitude === "number" &&
    !Number.isNaN(longitude);
  const place = locationText?.trim() ?? "";

  if (!hasCoords && !place) {
    return null;
  }

  const embedSrc = hasCoords
    ? (() => {
        const bbox = `${longitude - 0.02},${latitude - 0.015},${longitude + 0.02},${latitude + 0.015}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
      })()
    : `https://www.google.com/maps?q=${encodeURIComponent(place)}&hl=${locale}&z=14&output=embed`;

  const mapsLink = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: light ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.1)",
        backgroundColor: light ? "#ffffff" : "rgba(2,6,23,0.8)",
        boxShadow: light ? "0 12px 36px rgba(15,23,42,0.08)" : undefined,
      }}
    >
      <iframe
        title={title ?? place ?? "Map"}
        src={embedSrc}
        className="h-56 w-full border-0 sm:h-72 lg:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
        style={{ borderColor: light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)" }}
      >
        {hasCoords ? (
          <p className="text-xs" style={{ color: light ? "#64748b" : "#64748b" }}>
            {place ? `${place} · ` : ""}
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        ) : (
          <p className="text-xs" style={{ color: light ? "#475569" : "#94a3b8" }}>
            {place}
          </p>
        )}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium transition"
          style={{ color: light ? "#0e7490" : "#22d3ee" }}
        >
          {locale === "ar" ? "فتح في خرائط Google ↗" : "Open in Google Maps ↗"}
        </a>
      </div>
    </div>
  );
}
