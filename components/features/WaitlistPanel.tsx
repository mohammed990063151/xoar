"use client";

import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import { saveFormProfile } from "@/lib/form-profile-cookie";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import type { Locale } from "@/lib/i18n";

interface WaitlistPanelProps {
  readonly slug: string;
  readonly locale: Locale;
  readonly enabled: boolean;
}

export function WaitlistPanel({
  slug,
  locale,
  enabled,
}: WaitlistPanelProps): React.ReactElement | null {
  const ar = locale === "ar";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFormProfileAutofill({ setName, setEmail, setPhone });

  if (!enabled) return null;

  async function join(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/activities/${locale}/${slug}/waitlist`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone: phone || undefined }),
        },
      );
      const json = (await res.json()) as { data?: { message?: string } };
      if (res.ok) {
        saveFormProfile({ name, email, phone });
        setDone(json.data?.message ?? (ar ? "تم التسجيل" : "Joined"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="book"
      className="scroll-mt-28 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-slate-950 p-5 sm:p-6"
    >
      <h3 className="text-lg font-bold text-white">
        {ar ? "الفعالية ممتلئة — قائمة الانتظار" : "Sold out — join waitlist"}
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        {ar
          ? "سنُعلمك فوراً عند إلغاء أحد الحجوزات."
          : "We will notify you as soon as a spot opens."}
      </p>
      {done ? (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {done}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            placeholder={ar ? "الاسم" : "Name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            placeholder={ar ? "الجوال (اختياري)" : "Phone (optional)"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="button"
            disabled={loading || !name || !email}
            onClick={() => void join()}
            className="w-full rounded-2xl bg-gradient-to-l from-amber-600 to-orange-600 py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "…" : ar ? "انضم لقائمة الانتظار" : "Join waitlist"}
          </button>
        </div>
      )}
    </div>
  );
}
