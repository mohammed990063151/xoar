"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import { activityImageUrl } from "@/lib/activity";
import { getApiBaseUrl } from "@/lib/api-base";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { Activity } from "@/types/api";
import "leaflet/dist/leaflet.css";

export type ActivityMapPin = {
  slug: string;
  title: string;
  lat: number;
  lng: number;
  image: string;
  price?: string;
  location?: string;
};

function toMapPins(activities: Activity[]): ActivityMapPin[] {
  return activities
    .map((a) => {
      const lat = a.latitude ?? null;
      const lng = a.longitude ?? null;
      if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
      }
      return {
        slug: a.slug,
        title: a.title,
        lat,
        lng,
        image: activityImageUrl(a),
        price: a.price,
        location: a.location ?? a.city,
      };
    })
    .filter((p): p is ActivityMapPin => p !== null);
}

function pinsFromMapApi(
  items: {
    slug: string;
    title: string;
    latitude: number;
    longitude: number;
    image?: string;
    price?: string;
    shortLabel?: string;
  }[],
): ActivityMapPin[] {
  return items.map((item) => ({
    slug: item.slug,
    title: item.title,
    lat: item.latitude,
    lng: item.longitude,
    image: item.image ?? "",
    price: item.price,
    location: item.shortLabel,
  }));
}

const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface ActivitiesLocationsMapProps {
  readonly locale: Locale;
  readonly activities?: readonly Activity[];
  readonly enabled?: boolean;
}

export function ActivitiesLocationsMap({
  locale,
  activities = [],
  enabled = true,
}: ActivitiesLocationsMapProps): React.ReactElement | null {
  const ar = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [apiPins, setApiPins] = useState<ActivityMapPin[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const pinsFromList = useMemo(() => toMapPins([...activities]), [activities]);
  const pins = pinsFromList.length > 0 ? pinsFromList : apiPins;

  useEffect(() => {
    if (!enabled) return;

    const fromList = toMapPins([...activities]);
    if (fromList.length > 0) {
      setApiPins([]);
      return;
    }

    fetch(`${getApiBaseUrl()}/api/activities/${locale}/map`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((json: { data?: Parameters<typeof pinsFromMapApi>[0] }) => {
        setApiPins(pinsFromMapApi(json.data ?? []));
      })
      .catch(() => setApiPins([]));
  }, [locale, enabled, activities]);

  const buildMap = useCallback(() => {
    if (!containerRef.current || pins.length === 0) return;

    void import("leaflet").then((L) => {
      if (!containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const bounds: LatLngExpression[] = [];

      for (const pin of pins) {
        bounds.push([pin.lat, pin.lng]);
        const href = localizedPath(locale, `/activities/${pin.slug}`);
        const imgSrc = pin.image || "/images/xora-logo.png";

        const icon = L.divIcon({
          className: "activity-map-pin-icon",
          html: `<div class="activity-map-pin" title="${escapeHtml(pin.title)}"><img src="${escapeHtml(imgSrc)}" alt="" /></div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48],
        });

        const dir = locale === "ar" ? "rtl" : "ltr";
        const ctaLabel = locale === "ar" ? "عرض التفاصيل" : "View details";
        const perPerson = locale === "ar" ? "للشخص" : "per person";
        const popupHtml = `
          <div class="activity-map-popup" dir="${dir}">
            <a href="${href}" class="activity-map-popup-link">
              <div class="activity-map-popup-media">
                <img src="${escapeHtml(imgSrc)}" alt="" class="activity-map-popup-img" />
              </div>
              <div class="activity-map-popup-content">
                <h3 class="activity-map-popup-title">${escapeHtml(pin.title)}</h3>
                ${
                  pin.location
                    ? `<p class="activity-map-popup-loc"><span class="activity-map-popup-pin" aria-hidden="true">📍</span>${escapeHtml(pin.location)}</p>`
                    : ""
                }
                <div class="activity-map-popup-footer">
                  ${
                    pin.price
                      ? `<div class="activity-map-popup-price-wrap"><span class="activity-map-popup-price">${escapeHtml(pin.price)}</span><span class="activity-map-popup-per">${perPerson}</span></div>`
                      : "<span></span>"
                  }
                  <span class="activity-map-popup-cta">${ctaLabel}</span>
                </div>
              </div>
            </a>
          </div>
        `;

        L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, {
            maxWidth: 300,
            minWidth: 260,
            className: "activity-map-popup-wrap",
          });
      }

      if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48], maxZoom: 12 });
      } else {
        map.setView(DEFAULT_CENTER, 6);
      }

      requestAnimationFrame(() => {
        map.invalidateSize();
        setMapReady(true);
      });

      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);
    });
  }, [pins, locale]);

  useEffect(() => {
    if (!enabled || pins.length === 0) {
      setMapReady(false);
      return;
    }

    buildMap();

    return () => {
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [enabled, pins, buildMap]);

  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [mapReady]);

  if (!enabled) return null;

  if (pins.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-8 text-center">
        <h2 className="text-lg font-bold text-white">
          {ar ? "خريطة الأنشطة" : "Activities map"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {ar
            ? "لا توجد أنشطة بموقع محدد. من لوحة الإدارة: عدّل النشاط ← الموقع على الخريطة."
            : "No geolocated activities yet. In admin: edit activity → map location."}
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/80">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-bold text-white">
          {ar ? "خريطة الأنشطة" : "Activities map"}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {ar
            ? `${pins.length} نشاط على الخريطة — اضغط العلامة لعرض التفاصيل`
            : `${pins.length} activities on the map — tap a marker for details`}
        </p>
      </div>
      <div
        ref={containerRef}
        className="activity-map-canvas relative h-[min(420px,55vh)] w-full min-h-[280px] sm:h-[480px]"
        role="application"
        aria-label={ar ? "خريطة مواقع الأنشطة" : "Activities location map"}
      />
      {!mapReady ? (
        <p className="border-t border-white/10 px-5 py-3 text-center text-xs text-slate-500">
          {ar ? "جاري تحميل الخريطة…" : "Loading map…"}
        </p>
      ) : null}
      <ul className="flex gap-3 overflow-x-auto border-t border-white/10 px-4 py-3">
        {pins.map((pin) => (
          <li key={pin.slug} className="shrink-0">
            <Link
              href={localizedPath(locale, `/activities/${pin.slug}`)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 pe-3 ps-1 py-1 hover:border-cyan-400/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pin.image || "/images/xora-logo.png"}
                alt=""
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="max-w-[120px] truncate text-xs font-medium text-white">
                {pin.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
