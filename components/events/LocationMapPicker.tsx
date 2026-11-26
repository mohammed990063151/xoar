"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import "leaflet/dist/leaflet.css";

export type MapLocation = {
  lat: number;
  lng: number;
  label: string;
};

interface LocationMapPickerProps {
  readonly locale: Locale;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onCoordsChange?: (coords: MapLocation | null) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly optionalHint?: string;
  readonly className?: string;
  readonly inputClassName?: string;
  readonly required?: boolean;
}

const RIYADH: [number, number] = [24.7136, 46.6753];

const CITY_PRESETS: Array<{ labelAr: string; labelEn: string; lat: number; lng: number }> = [
  { labelAr: "الرياض", labelEn: "Riyadh", lat: 24.7136, lng: 46.6753 },
  { labelAr: "جدة", labelEn: "Jeddah", lat: 21.4858, lng: 39.1925 },
  { labelAr: "الدمام", labelEn: "Dammam", lat: 26.3927, lng: 49.9777 },
  { labelAr: "الخبر", labelEn: "Khobar", lat: 26.2172, lng: 50.1971 },
  { labelAr: "أبها", labelEn: "Abha", lat: 18.2164, lng: 42.5053 },
];

type SearchHit = { lat: number; lng: number; label: string };

async function reverseGeocode(lat: number, lng: number, ar: boolean): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${ar ? "ar" : "en"}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("geocode failed");
    const data = (await res.json()) as { display_name?: string };
    if (data.display_name?.trim()) return data.display_name.trim();
  } catch {
    // Fall through to coordinates label.
  }
  return ar
    ? `موقع على الخريطة (${lat.toFixed(5)}, ${lng.toFixed(5)})`
    : `Map location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

async function searchPlaces(query: string, ar: boolean): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}` +
      `&countrycodes=sa&limit=6&accept-language=${ar ? "ar" : "en"}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;
    return data
      .map((row) => {
        const lat = Number(row.lat);
        const lng = Number(row.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const label = row.display_name?.trim();
        if (!label) return null;
        return { lat, lng, label };
      })
      .filter((row): row is SearchHit => row !== null);
  } catch {
    return [];
  }
}

export function LocationMapPicker({
  locale,
  value,
  onChange,
  onCoordsChange,
  placeholder,
  label,
  optionalHint,
  className,
  inputClassName,
  required = false,
}: LocationMapPickerProps): React.ReactElement {
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MapLocation | null>(null);
  const [resolving, setResolving] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const pickRef = useRef<((lat: number, lng: number, label?: string) => Promise<void>) | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "event-location-map-pin",
        html: `<div style="width:18px;height:18px;border-radius:9999px;background:#10b981;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const placeMarker = (lat: number, lng: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current?.getLatLng();
            if (!pos) return;
            void pick(pos.lat, pos.lng);
          });
        }
        map.setView([lat, lng], Math.max(map.getZoom(), 15));
      };

      const pick = async (lat: number, lng: number, knownLabel?: string) => {
        setResolving(true);
        setGeoError("");
        placeMarker(lat, lng);
        const labelText = knownLabel?.trim() || (await reverseGeocode(lat, lng, ar));
        if (cancelled) return;
        setDraft({ lat, lng, label: labelText });
        setResolving(false);
      };
      pickRef.current = pick;

      map.on("click", (e) => {
        void pick(e.latlng.lat, e.latlng.lng);
      });

      const start = draft ? ([draft.lat, draft.lng] as [number, number]) : RIYADH;
      map.setView(start, draft ? 15 : 11);
      if (draft) placeMarker(draft.lat, draft.lng);

      const invalidate = () => {
        try {
          map.invalidateSize();
        } catch {
          // Map may already be torn down.
        }
      };
      requestAnimationFrame(invalidate);
      timeouts.push(setTimeout(invalidate, 200));
      timeouts.push(setTimeout(invalidate, 500));
    });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelled = true;
      pickRef.current = null;
      timeouts.forEach(clearTimeout);
      document.body.style.overflow = prevOverflow;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Re-init only when modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ar]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchHits([]);
      return;
    }
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setSearching(true);
      void searchPlaces(q, ar).then((hits) => {
        if (cancelled) return;
        setSearchHits(hits);
        setSearching(false);
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, open, ar]);

  function useMyLocation(): void {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError(ar ? "المتصفح لا يدعم تحديد الموقع." : "Geolocation is not supported.");
      return;
    }
    setResolving(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void pickRef.current?.(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setResolving(false);
        setGeoError(
          ar
            ? "تعذّر قراءة موقعك. اسمح بالصلاحية أو اختر يدوياً على الخريطة."
            : "Could not read your location. Allow permission or tap the map.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function confirm(): void {
    if (!draft) return;
    onChange(draft.label);
    onCoordsChange?.(draft);
    setOpen(false);
  }

  function clearMapSelection(): void {
    setDraft(null);
    onCoordsChange?.(null);
  }

  async function selectHit(hit: SearchHit): Promise<void> {
    setSearchQuery(hit.label);
    setSearchHits([]);
    await pickRef.current?.(hit.lat, hit.lng, hit.label);
  }

  async function jumpToCity(lat: number, lng: number, cityLabel: string): Promise<void> {
    await pickRef.current?.(lat, lng, cityLabel);
  }

  return (
    <div className={cn("block text-sm text-slate-200", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          {label}
          {optionalHint ? (
            <span className="ms-1 text-xs text-slate-500">{optionalHint}</span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/20"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {ar ? "اختر من الخريطة" : "Pick on map"}
        </button>
      </div>

      <input
        value={value}
        required={required}
        onChange={(e) => {
          onChange(e.target.value);
          if (draft && e.target.value !== draft.label) clearMapSelection();
        }}
        className={inputClassName}
        placeholder={placeholder}
      />

      {draft ? (
        <p className="mt-1.5 text-[11px] text-emerald-300/90" dir="ltr">
          📍 {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label={ar ? "إغلاق" : "Close"}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ar ? "اختيار الموقع من الخريطة" : "Pick location on map"}
            className="relative z-[81] flex max-h-[min(92dvh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="space-y-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">
                    {ar ? "اختر الموقع على الخريطة" : "Choose a location on the map"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {ar
                      ? "ابحث عن العنوان، أو اضغط على الخريطة، أو استخدم موقعك الحالي."
                      : "Search an address, tap the map, or use your current location."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/5"
                >
                  {ar ? "إغلاق" : "Close"}
                </button>
              </div>

              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={ar ? "ابحث عن حي، قاعة، عنوان…" : "Search neighborhood, hall, address…"}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  autoComplete="off"
                />
                {searching ? (
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                    {ar ? "بحث…" : "Searching…"}
                  </span>
                ) : null}
                {searchHits.length > 0 ? (
                  <ul className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-slate-900 shadow-xl">
                    {searchHits.map((hit) => (
                      <li key={`${hit.lat}-${hit.lng}-${hit.label}`}>
                        <button
                          type="button"
                          onClick={() => void selectHit(hit)}
                          className="w-full px-3 py-2.5 text-start text-xs leading-relaxed text-slate-200 hover:bg-white/5"
                        >
                          {hit.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.labelEn}
                    type="button"
                    onClick={() =>
                      void jumpToCity(city.lat, city.lng, ar ? city.labelAr : city.labelEn)
                    }
                    className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-500/10"
                  >
                    {ar ? city.labelAr : city.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-[280px] flex-1 bg-slate-900 sm:min-h-[380px]">
              <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />
              {resolving ? (
                <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
                  <span className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs text-slate-100">
                    {ar ? "جاري تحديد العنوان…" : "Resolving address…"}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-white/10 px-4 py-3 sm:px-5">
              {draft ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">{draft.label}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  {ar ? "لم يُحدَّد موقع بعد — ابحث أو اضغط على الخريطة." : "No pin yet — search or tap the map."}
                </p>
              )}
              {geoError ? <p className="text-xs text-rose-300">{geoError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/5"
                >
                  {ar ? "موقعي الحالي" : "My location"}
                </button>
                <button
                  type="button"
                  disabled={!draft || resolving}
                  onClick={confirm}
                  className="ms-auto rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ar ? "تأكيد الموقع" : "Confirm location"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
