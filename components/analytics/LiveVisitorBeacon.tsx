"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api-base";

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

async function sendHeartbeat(): Promise<void> {
  const id = visitorId();
  if (!id) {
    return;
  }

  try {
    await fetch(`${getApiBaseUrl()}/api/presence/heartbeat`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitor_id: id,
        path: window.location.pathname,
      }),
      keepalive: true,
    });
  } catch {
    // Ignore network errors — next heartbeat will retry.
  }
}

export function LiveVisitorBeacon(): null {
  useEffect(() => {
    sendHeartbeat();

    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
