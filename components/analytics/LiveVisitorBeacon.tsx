"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getPresenceApiBaseUrl } from "@/lib/api-base";
import { normalizePresencePath } from "@/lib/presence-path";

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

async function sendHeartbeat(path?: string): Promise<void> {
  const id = visitorId();
  if (!id) {
    return;
  }

  const payload: { visitor_id: string; path?: string } = { visitor_id: id };
  if (path) {
    payload.path = path;
  }

  try {
    await fetch(`${getPresenceApiBaseUrl()}/api/presence/heartbeat`, {
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

  useEffect(() => {
    let intervalId = 0;
    let idleId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const start = (): void => {
      const section = normalizePresencePath(window.location.pathname);
      lastPathRef.current = section;
      void sendHeartbeat(section);
      intervalId = window.setInterval(() => {
        const section = normalizePresencePath(window.location.pathname);
        void sendHeartbeat(section);
      }, HEARTBEAT_MS);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 5000 });
    } else {
      timeoutId = setTimeout(start, 2500);
    }

    const onVisible = (): void => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat(normalizePresencePath(window.location.pathname));
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
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
    void sendHeartbeat(section);
  }, [pathname]);

  return null;
}
