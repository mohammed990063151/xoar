"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-base";
import { normalizePresencePath } from "@/lib/presence-path";
import {
  readCachedVisitorGeo,
  requestVisitorGeo,
  type VisitorGeo,
} from "@/lib/visitor-geo";

const STORAGE_KEY = "xora_visitor_id";
const HEARTBEAT_MS = 45_000;

function visitorId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }

  return id;
}

type HeartbeatPayload = {
  visitor_id: string;
  path?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
};

async function sendHeartbeat(path?: string, geo?: VisitorGeo | null): Promise<void> {
  const id = visitorId();
  if (!id) {
    return;
  }

  const payload: HeartbeatPayload = { visitor_id: id };
  if (path) {
    payload.path = path;
  }

  const coords = geo ?? readCachedVisitorGeo();
  if (coords) {
    payload.lat = coords.lat;
    payload.lng = coords.lng;
    if (coords.accuracy != null) {
      payload.accuracy = coords.accuracy;
    }
  }

  try {
    await fetch(`${getApiBaseUrl()}/api/presence/heartbeat`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ignore network errors — next heartbeat will retry.
  }
}

export function LiveVisitorBeacon(): null {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const geoRef = useRef<VisitorGeo | null>(null);

  useEffect(() => {
    let intervalId = 0;
    let idleId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const start = (): void => {
      const section = normalizePresencePath(window.location.pathname);
      lastPathRef.current = section;

      void sendHeartbeat(section, readCachedVisitorGeo());

      void requestVisitorGeo().then((geo) => {
        if (cancelled) {
          return;
        }
        geoRef.current = geo;
        void sendHeartbeat(section, geo);
      });

      intervalId = window.setInterval(() => {
        const currentSection = normalizePresencePath(window.location.pathname);
        void sendHeartbeat(currentSection, geoRef.current);
      }, HEARTBEAT_MS);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => {
        void start();
      }, { timeout: 5000 });
    } else {
      timeoutId = setTimeout(() => {
        void start();
      }, 2500);
    }

    const onVisible = (): void => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat(
          normalizePresencePath(window.location.pathname),
          geoRef.current,
        );
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const section = normalizePresencePath(pathname);
    if (lastPathRef.current === section) {
      return;
    }
    lastPathRef.current = section;
    void sendHeartbeat(section, geoRef.current);
  }, [pathname]);

  return null;
}
