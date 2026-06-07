"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import { customerService, getCustomerToken } from "@/services/customerService";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";

interface GroupBookingPanelProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly enabled: boolean;
}

type GroupResult = {
  inviteUrl?: string;
  whatsappUrl?: string;
  confirmedCount?: number;
  maxMembers?: number;
};

export function GroupBookingPanel({
  activity,
  locale,
  enabled,
}: GroupBookingPanelProps): React.ReactElement | null {
  const ar = locale === "ar";
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [maxMembers, setMaxMembers] = useState(8);
  const [result, setResult] = useState<GroupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void customerService.me().then((customer) => {
      if (!customer) return;
      setLeaderName((prev) => prev || customer.name);
      setLeaderEmail((prev) => prev || customer.email);
    });
  }, []);

  if (!enabled) return null;

  async function createGroup(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const token = getCustomerToken();
      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/api/group-bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          activity_id: activity.id,
          leader_name: leaderName.trim(),
          leader_email: leaderEmail.trim(),
          max_members: maxMembers,
          locale,
        }),
      });
      const json = (await res.json()) as { data?: GroupResult; message?: string };
      if (!res.ok) {
        setError(json.message ?? (ar ? "تعذر إنشاء المجموعة." : "Could not create group."));
        return;
      }
      setResult(json.data ?? null);
    } catch {
      setError(ar ? "خطأ في الاتصال بالخادم." : "Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
      <h3 className="text-base font-bold text-white">
        {ar ? "حجز جماعي — ادعُ أصدقاءك" : "Group booking — invite friends"}
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        {ar
          ? "أنشئ مجموعة — يُشعر القائد والإدارة عند كل انضمام"
          : "Create a group — leader and admin get notified on each join"}
      </p>
      {!result ? (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder={ar ? "اسمك *" : "Your name *"}
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
          />
          <input
            type="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder={ar ? "البريد *" : "Email *"}
            value={leaderEmail}
            onChange={(e) => setLeaderEmail(e.target.value)}
          />
          <label className="flex items-center justify-between text-sm text-slate-300">
            {ar ? "عدد الأعضاء" : "Group size"}
            <input
              type="number"
              min={2}
              max={20}
              className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
            />
          </label>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button
            type="button"
            onClick={() => void createGroup()}
            disabled={loading || !leaderName.trim() || !leaderEmail.trim()}
            className="w-full rounded-full bg-gradient-to-l from-cyan-600 to-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "…" : ar ? "إنشاء رابط الدعوة" : "Create invite link"}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-emerald-300/90 text-xs">
            {ar ? "تم الإنشاء — شارك الرابط مع أصدقائك" : "Created — share the link"}
            {result.confirmedCount != null && result.maxMembers != null
              ? ` (${result.confirmedCount}/${result.maxMembers})`
              : ""}
          </p>
          <input
            readOnly
            value={result.inviteUrl ?? ""}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-white text-xs"
            onClick={(e) => e.currentTarget.select()}
          />
          {result.whatsappUrl ? (
            <a
              href={result.whatsappUrl}
              target="_blank"
              rel="noopener"
              className="inline-block rounded-full bg-emerald-600 px-4 py-2 text-white"
            >
              {ar ? "مشاركة واتساب" : "Share on WhatsApp"}
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
