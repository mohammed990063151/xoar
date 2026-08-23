export type VisitorGeo = {
  lat: number;
  lng: number;
  accuracy?: number;
};

const STORAGE_KEY = "xora_visitor_geo";
const GEO_MAX_AGE_MS = 10 * 60 * 1000;

type StoredGeo = VisitorGeo & { at: number };

function readStored(): StoredGeo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredGeo;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      !Number.isFinite(parsed.lat) ||
      !Number.isFinite(parsed.lng)
    ) {
      return null;
    }

    if (Date.now() - (parsed.at ?? 0) > GEO_MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function storeGeo(geo: VisitorGeo): VisitorGeo {
  const payload: StoredGeo = { ...geo, at: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return geo;
}

/** Cached browser coordinates for this tab session (if available). */
export function readCachedVisitorGeo(): VisitorGeo | null {
  const stored = readStored();
  if (!stored) {
    return null;
  }

  return {
    lat: stored.lat,
    lng: stored.lng,
    accuracy: stored.accuracy,
  };
}

/**
 * Ask the browser for the visitor's coordinates (requires user permission once).
 * Falls back to cached coords or null when denied/unavailable.
 */
export function requestVisitorGeo(): Promise<VisitorGeo | null> {
  const cached = readCachedVisitorGeo();
  if (cached) {
    return Promise.resolve(cached);
  }

  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          storeGeo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        );
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 5_000,
      },
    );
  });
}
