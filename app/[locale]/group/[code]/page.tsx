"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-base";
import { portalPath } from "@/lib/portal-url";
import { getCustomerToken } from "@/services/customerService";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";

type GroupData = {
  inviteCode: string;
  inviteUrl?: string;
  whatsappUrl?: string;
  maxMembers: number;
  confirmedCount: number;
  status?: string;
  activity?: { title: string; slug: string; locale: string };
  members?: { name: string; confirmed: boolean }[];
};

export default function GroupJoinPage(): React.ReactElement {
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const code = params.code as string;
  const loc: Locale = isLocale(locale) ? locale : "ar";
  const ar = loc === "ar";

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  async function loadGroup(): Promise<void> {
    const res = await fetch(`${getApiBaseUrl()}/api/group-bookings/${code}`);
    if (!res.ok) {
      setLoadError(ar ? "رابط الدعوة غير صالح." : "Invalid invite link.");
      setGroup(null);
      return;
    }
    const json = (await res.json()) as { data?: GroupData };
    setGroup(json.data ?? null);
    setLoadError(null);
  }

  useEffect(() => {
    void loadGroup();
  }, [code]);

  async function join(): Promise<void> {
    if (!name.trim()) {
      setJoinError(ar ? "أدخل اسمك." : "Enter your name.");
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const token = getCustomerToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/api/group-bookings/${code}/join`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, locale: loc }),
      });
      const json = (await res.json()) as { data?: GroupData; message?: string };
      if (!res.ok) {
        setJoinError(json.message ?? (ar ? "تعذر التسجيل." : "Could not join."));
        return;
      }
      setGroup(json.data ?? null);
      setJoinSuccess(true);
      setName("");
      setEmail("");
    } finally {
      setJoining(false);
    }
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center text-slate-400">
        <p>{loadError}</p>
        <Link href={localizedPath(loc, "/activities")} className="mt-4 inline-block text-violet-400">
          {ar ? "الأنشطة" : "Activities"}
        </Link>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center text-slate-400">
        {ar ? "جاري التحميل…" : "Loading…"}
      </main>
    );
  }

  const isFull = group.confirmedCount >= group.maxMembers || group.status === "full";
  const activityPath = group.activity
    ? localizedPath(loc, `/activities/${group.activity.slug}`)
    : localizedPath(loc, "/activities");

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Link href={activityPath} className="text-sm text-violet-400 hover:underline">
        ← {group.activity?.title}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{group.activity?.title}</h1>
      <p className="mt-2 text-slate-400">
        {ar ? "مجموعة حجز" : "Group booking"} · {group.confirmedCount}/{group.maxMembers}{" "}
        {ar ? "مؤكد" : "confirmed"}
      </p>

      <ul className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        {group.members?.map((m, i) => (
          <li key={`${m.name}-${i}`} className="flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {m.name}
          </li>
        ))}
      </ul>

      {joinSuccess ? (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {ar ? "تم تأكيد حضورك! سيصل إشعار للقائد وللإدارة." : "You are confirmed! The leader and admin were notified."}
        </p>
      ) : null}

      {!isFull ? (
        <div className="mt-8 space-y-3 rounded-2xl border border-white/10 p-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            placeholder={ar ? "اسمك الكامل *" : "Your full name *"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            placeholder={ar ? "البريد (اختياري)" : "Email (optional)"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {joinError ? <p className="text-sm text-red-400">{joinError}</p> : null}
          <button
            type="button"
            onClick={() => void join()}
            disabled={joining}
            className="w-full rounded-full bg-violet-600 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {joining ? "…" : ar ? "تأكيد الحضور" : "Confirm attendance"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-center text-amber-300/90">
          {ar ? "المجموعة مكتملة." : "This group is full."}
        </p>
      )}

      {group.whatsappUrl ? (
        <a
          href={group.whatsappUrl}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-block text-emerald-400 underline"
        >
          {ar ? "مشاركة واتساب" : "Share on WhatsApp"}
        </a>
      ) : null}

      <p className="mt-8 text-center text-xs text-slate-500">
        {ar ? "مسجّل كعميل؟" : "Have an account?"}{" "}
        <Link href={portalPath("/group-bookings")} className="text-violet-400">
          {ar ? "مجموعاتي في البوابة" : "My groups in portal"}
        </Link>
      </p>
    </main>
  );
}
