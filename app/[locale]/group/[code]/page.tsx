"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-base";
import { getCustomerToken } from "@/services/customerService";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";

type GroupActivity = {
  title: string;
  slug: string;
  locale: string;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  image?: string | null;
  price?: string | null;
  duration?: string | null;
  shortLabel?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
  detailUrl?: string | null;
};

type JoinedMember = {
  name?: string;
  phone?: string;
  ticketCode?: string;
  pdfUrl?: string | null;
};

type GroupData = {
  inviteCode: string;
  inviteUrl?: string;
  whatsappUrl?: string;
  activityUrl?: string;
  mapsUrl?: string | null;
  maxMembers: number;
  confirmedCount: number;
  status?: string;
  bookingDate?: string | null;
  bookingEndDate?: string | null;
  bookingTime?: string | null;
  activity?: GroupActivity;
  members?: { name: string; confirmed: boolean; phone?: string | null }[];
  joinedMember?: JoinedMember;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyPhone(value: string): boolean {
  const digits = value.replace(/\D+/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export default function GroupJoinPage(): React.ReactElement {
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const code = params.code as string;
  const loc: Locale = isLocale(locale) ? locale : "ar";
  const ar = loc === "ar";

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedTicket, setJoinedTicket] = useState<JoinedMember | null>(null);

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
    if (!isLikelyPhone(phone)) {
      setJoinError(ar ? "أدخل رقم جوال صحيح." : "Enter a valid phone number.");
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
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), locale: loc }),
      });
      const json = (await res.json()) as { data?: GroupData; message?: string };
      if (!res.ok) {
        setJoinError(json.message ?? (ar ? "تعذر التسجيل." : "Could not join."));
        return;
      }
      setGroup(json.data ?? null);
      setJoinedTicket(json.data?.joinedMember ?? null);
      setName("");
      setPhone("");
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

  const activity = group.activity;
  const isFull = group.confirmedCount >= group.maxMembers || group.status === "full";
  const activityPath = activity
    ? localizedPath(loc, `/activities/${activity.slug}`)
    : localizedPath(loc, "/activities");
  const place = activity?.location || activity?.city || "";
  const mapsUrl = group.mapsUrl || activity?.mapsUrl || null;
  const description = activity?.description ? stripHtml(activity.description) : "";
  const period =
    group.bookingDate &&
    (group.bookingEndDate && group.bookingEndDate !== group.bookingDate
      ? `${group.bookingDate} → ${group.bookingEndDate}`
      : group.bookingDate);

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <Link href={activityPath} className="text-sm text-cyan-300 hover:underline">
        ← {ar ? "صفحة النشاط الكاملة" : "Full activity page"}
      </Link>

      {activity?.image ? (
        <div
          className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center"
          style={{ backgroundImage: `url(${activity.image})` }}
          role="img"
          aria-label={activity.title}
        />
      ) : null}

      <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">{activity?.title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {ar ? "مجموعة حجز" : "Group booking"} · {group.confirmedCount}/{group.maxMembers}{" "}
        {ar ? "مؤكد" : "confirmed"}
      </p>

      <section className="mt-5 space-y-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">
          {ar ? "تفاصيل النشاط" : "Activity details"}
        </h2>
        <dl className="space-y-2 text-sm">
          {place ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-500">📍 {ar ? "الموقع" : "Location"}</dt>
              <dd className="text-slate-200">{place}</dd>
            </div>
          ) : null}
          {period ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-500">📅 {ar ? "الموعد" : "Date"}</dt>
              <dd className="text-slate-200">
                {period}
                {group.bookingTime ? ` · ${group.bookingTime}` : ""}
              </dd>
            </div>
          ) : null}
          {activity?.duration ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-500">⏱ {ar ? "المدة" : "Duration"}</dt>
              <dd className="text-slate-200">{activity.duration}</dd>
            </div>
          ) : null}
          {activity?.price ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-500">💰 {ar ? "السعر" : "Price"}</dt>
              <dd className="text-slate-200">{activity.price}</dd>
            </div>
          ) : null}
          {activity?.shortLabel ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-500">🏷 {ar ? "الفئة" : "Category"}</dt>
              <dd className="text-slate-200">{activity.shortLabel}</dd>
            </div>
          ) : null}
        </dl>

        {description ? (
          <p className="border-t border-white/10 pt-3 text-sm leading-relaxed text-slate-300 line-clamp-5">
            {description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={activityPath}
            className="rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950"
          >
            {ar ? "عرض كل التفاصيل" : "View full details"}
          </Link>
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400/40"
            >
              {ar ? "فتح الموقع على الخريطة" : "Open location on map"}
            </a>
          ) : null}
        </div>
      </section>

      <ul className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <li className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {ar ? "المشاركون" : "Participants"}
        </li>
        {group.members?.map((m, i) => (
          <li key={`${m.name}-${i}`} className="flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {m.name}
          </li>
        ))}
      </ul>

      {joinedTicket ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-100">
            {ar ? "تم تأكيد حضورك!" : "Attendance confirmed!"}
          </p>
          <p className="text-xs text-emerald-200/80">
            {ar
              ? "حمّل تذكرتك واعرض رمز الدخول عند الوصول للفعالية."
              : "Download your ticket and show the entry code at check-in."}
          </p>
          {joinedTicket.ticketCode ? (
            <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center font-mono text-lg font-bold tracking-widest text-cyan-200">
              {joinedTicket.ticketCode}
            </p>
          ) : null}
          {joinedTicket.pdfUrl ? (
            <a
              href={joinedTicket.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950"
            >
              {ar ? "تحميل تذكرة PDF" : "Download PDF ticket"}
            </a>
          ) : null}
        </div>
      ) : null}

      {!joinedTicket && !isFull ? (
        <div className="mt-8 space-y-3 rounded-2xl border border-white/10 p-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            placeholder={ar ? "اسمك الكامل *" : "Your full name *"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            type="tel"
            inputMode="tel"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            placeholder={ar ? "رقم الجوال *" : "Phone number *"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <p className="text-[11px] text-slate-500">
            {ar
              ? "بعد التأكيد تصلك تذكرة PDF برمز دخول للفعالية."
              : "After confirming you’ll get a PDF ticket with an entry code."}
          </p>
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
      ) : null}

      {!joinedTicket && isFull ? (
        <p className="mt-6 text-center text-amber-300/90">
          {ar ? "المجموعة مكتملة." : "This group is full."}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {group.whatsappUrl ? (
          <a
            href={group.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            {ar ? "مشاركة في قروب واتساب" : "Share to WhatsApp group"}
          </a>
        ) : null}
        <Link
          href={localizedPath(loc, "/account/group-bookings")}
          className="inline-flex rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-300"
        >
          {ar ? "مجموعاتي" : "My groups"}
        </Link>
      </div>
    </main>
  );
}
