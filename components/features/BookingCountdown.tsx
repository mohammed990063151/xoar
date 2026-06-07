"use client";



import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";



interface BookingCountdownProps {

  readonly endsAt?: string | null;

  readonly enabled: boolean;

  readonly locale: Locale;

  readonly compact?: boolean;

}



function parts(ms: number): { d: number; h: number; m: number; s: number } {

  const total = Math.max(0, Math.floor(ms / 1000));

  const d = Math.floor(total / 86400);

  const h = Math.floor((total % 86400) / 3600);

  const m = Math.floor((total % 3600) / 60);

  const s = total % 60;

  return { d, h, m, s };

}



export function BookingCountdown({

  endsAt,

  enabled,

  locale,

  compact = false,

}: BookingCountdownProps): React.ReactElement | null {

  const [left, setLeft] = useState<number | null>(null);



  useEffect(() => {

    if (!enabled || !endsAt) return;

    const end = new Date(endsAt).getTime();

    if (Number.isNaN(end)) return;

    const tick = () => setLeft(end - Date.now());

    tick();

    const id = window.setInterval(tick, 1000);

    return () => window.clearInterval(id);

  }, [endsAt, enabled]);



  if (!enabled || !endsAt || left === null || left <= 0) return null;



  const { d, h, m, s } = parts(left);

  const ar = locale === "ar";



  if (compact) {

    return (

      <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100">

        <span className="font-medium text-amber-200/90">

          {ar ? "ينتهي الحجز خلال" : "Ends in"}

        </span>

        <span className="mt-0.5 block font-bold tabular-nums">

          {d > 0 ? `${d}${ar ? "ي " : "d "}` : ""}

          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}

        </span>

      </div>

    );

  }



  return (

    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-amber-100">

      <p className="text-xs uppercase tracking-wider text-amber-300/90">

        {ar ? "ينتهي الحجز خلال" : "Booking ends in"}

      </p>

      <p className="mt-1 text-lg font-bold tabular-nums">

        {d > 0 && `${d} ${ar ? "يوم" : "d"} `}

        {h} {ar ? "ساعة" : "h"} {m} {ar ? "دقيقة" : "m"}{" "}

        <span className="text-sm font-semibold text-amber-200/80">

          {s} {ar ? "ث" : "s"}

        </span>

      </p>

    </div>

  );

}

