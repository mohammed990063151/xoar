"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { CustomerGroupBooking } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";

function GroupCard({
  group,
  ar,
}: {
  readonly group: CustomerGroupBooking;
  readonly ar: boolean;
}): React.ReactElement {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#081526]/90 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {group.role === "leader"
              ? ar
                ? "قائد المجموعة"
                : "Group leader"
              : ar
                ? "عضو"
                : "Member"}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            {group.activity?.title ?? (ar ? "نشاط" : "Activity")}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {group.bookingDate ?? "—"}
            {group.bookingEndDate && group.bookingEndDate !== group.bookingDate
              ? ` → ${group.bookingEndDate}`
              : ""}
            {group.bookingTime ? ` · ${group.bookingTime}` : ""}
          </p>
          <p className="mt-2 text-sm text-cyan-200/90">
            {group.confirmedCount}/{group.maxMembers}{" "}
            {ar ? "أعضاء" : "members"} · {group.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.activity?.slug ? (
            <Link
              href={localizedPath(
                (group.activity.locale === "en" ? "en" : "ar") as Locale,
                `/activities/${group.activity.slug}`,
              )}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300"
            >
              {ar ? "النشاط" : "Activity"}
            </Link>
          ) : null}
          {group.whatsappUrl ? (
            <a
              href={group.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
      {group.inviteUrl ? (
        <input
          readOnly
          value={group.inviteUrl}
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-300"
          onClick={(e) => e.currentTarget.select()}
        />
      ) : null}
    </article>
  );
}

export default function AccountGroupBookingsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const [led, setLed] = useState<CustomerGroupBooking[]>([]);
  const [joined, setJoined] = useState<CustomerGroupBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void customerService.groupBookings().then((data) => {
      setLed(data.led);
      setJoined(data.joined);
      setLoading(false);
    });
  }, []);

  return (
    <CustomerSpace
      locale={locale}
      compact
      title={ar ? "مجموعات الحجز" : "Group bookings"}
      subtitle={
        ar
          ? "المجموعات التي أنشأتها أو انضممت إليها"
          : "Groups you created or joined"
      }
    >
      {loading ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : led.length === 0 && joined.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-lg text-slate-300">
            {ar ? "لا توجد مجموعات بعد" : "No groups yet"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {ar
              ? "أنشئ مجموعة من صفحة أي نشاط (قسم الحجز الجماعي)."
              : "Create a group from any activity page (group booking section)."}
          </p>
          <Link
            href={localizedPath(locale, "/activities")}
            className="mt-5 inline-flex rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            {ar ? "استكشف الأنشطة" : "Explore activities"}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {led.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400">
                {ar ? "أنشأتها" : "Created by you"}
              </h2>
              {led.map((g) => (
                <GroupCard key={`led-${g.id}`} group={g} ar={ar} />
              ))}
            </section>
          ) : null}
          {joined.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400">
                {ar ? "انضممت إليها" : "Joined"}
              </h2>
              {joined.map((g) => (
                <GroupCard key={`join-${g.id}`} group={g} ar={ar} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </CustomerSpace>
  );
}
