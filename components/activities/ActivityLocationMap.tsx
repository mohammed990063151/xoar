"use client";

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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
      <iframe
        title={title ?? place ?? "Map"}
        src={embedSrc}
        className="h-56 w-full border-0 sm:h-72"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        {hasCoords ? (
          <p className="text-xs text-slate-500">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        ) : (
          <p className="text-xs text-slate-400">{place}</p>
        )}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          {locale === "ar" ? "فتح في خرائط Google ↗" : "Open in Google Maps ↗"}
        </a>
      </div>
    </div>
  );
}
