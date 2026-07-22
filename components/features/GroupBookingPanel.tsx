"use client";

import { useEffect, useMemo } from "react";
import {
  bookableIsoDaysInRange,
  calculateBookingTotal,
  formatMoney,
  parsePriceAmount,
} from "@/lib/booking";
import { resolveBookableIsoSet } from "@/lib/activity-schedule";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";

interface GroupBookingPanelProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly enabled: boolean;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly bookingTime?: string;
  /** When true, booking is treated as a paid group (adults synced below). */
  readonly active: boolean;
  readonly onActiveChange: (active: boolean) => void;
  /** Shared with main booking — changes update the paid total. */
  readonly membersCount?: number;
  readonly onMembersCountChange?: (count: number) => void;
}

export function GroupBookingPanel({
  activity,
  locale,
  enabled,
  dateFrom = "",
  dateTo = "",
  bookingTime = "",
  active,
  onActiveChange,
  membersCount,
  onMembersCountChange,
}: GroupBookingPanelProps): React.ReactElement | null {
  const ar = locale === "ar";

  const maxMembers =
    typeof membersCount === "number" && membersCount >= 2
      ? Math.min(20, membersCount)
      : 8;

  const bookableIsoSet = useMemo(() => resolveBookableIsoSet(activity, 60), [activity]);
  const selectedDays = useMemo(
    () => bookableIsoDaysInRange(dateFrom, dateTo || dateFrom, bookableIsoSet),
    [dateFrom, dateTo, bookableIsoSet],
  );
  const dayCount = Math.max(1, selectedDays.length || (dateFrom ? 1 : 0));

  const unitPrice = parsePriceAmount(
    activity.originalPrice ?? activity.original_price ?? activity.price,
  );
  const estimatedTotal =
    active && unitPrice > 0
      ? calculateBookingTotal(unitPrice, maxMembers, 0, dateFrom ? dayCount : 1)
      : 0;

  const periodLabel = dateFrom
    ? `${dateFrom}${(dateTo || dateFrom) !== dateFrom ? ` → ${dateTo || dateFrom}` : ""}${
        bookingTime ? ` · ${bookingTime}` : ""
      }`
    : null;

  function setMembers(count: number): void {
    const n = Math.max(2, Math.min(20, count));
    onMembersCountChange?.(n);
  }

  function toggleActive(next: boolean): void {
    onActiveChange(next);
    if (next) {
      onMembersCountChange?.(Math.max(2, membersCount && membersCount >= 2 ? membersCount : 8));
    } else {
      onMembersCountChange?.(1);
    }
  }

  useEffect(() => {
    if (!enabled || !active || !onMembersCountChange) return;
    if (typeof membersCount !== "number" || membersCount < 2) {
      onMembersCountChange(8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep size valid while group mode is on
  }, [enabled, active]);

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">
            {ar ? "حجز جماعي — ادعُ أصدقاءك" : "Group booking — invite friends"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {ar
              ? "فعّل الحجز الجماعي، ادفع بالأسفل، ثم يصلك رابط المشاركة."
              : "Enable group booking, pay below, then get your share link."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => toggleActive(!active)}
          className={
            active
              ? "shrink-0 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950"
              : "shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300"
          }
        >
          {active ? (ar ? "مفعّل" : "On") : ar ? "تفعيل" : "Enable"}
        </button>
      </div>

      {active ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs text-slate-300">
            {periodLabel ? (
              <>
                <span className="text-slate-500">{ar ? "الفترة من الحجز" : "From booking"}: </span>
                <span className="font-medium text-cyan-100">{periodLabel}</span>
              </>
            ) : (
              <span className="text-amber-200/90">
                {ar
                  ? "اختر الفترة أولاً من تقويم الحجز بالأسفل"
                  : "Pick dates in the booking calendar below first"}
              </span>
            )}
          </div>

          <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
            {ar ? "عدد الأشخاص" : "Number of people"}
            <input
              type="number"
              min={2}
              max={20}
              className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
              value={maxMembers}
              onChange={(e) => setMembers(Number(e.target.value) || 2)}
            />
          </label>

          <p className="rounded-xl border border-teal-400/25 bg-teal-500/10 px-3 py-2 text-xs text-teal-100">
            {ar ? "قيمة الحجز" : "Booking total"}:{" "}
            <span className="font-bold">
              {estimatedTotal > 0 ? formatMoney(estimatedTotal, locale) : "—"}
            </span>
            {estimatedTotal > 0 ? (
              <span className="text-slate-400">
                {" "}
                ({maxMembers} × {ar ? "شخص" : "people"}
                {dayCount > 1 ? ` × ${dayCount} ${ar ? "يوم" : "days"}` : ""})
              </span>
            ) : null}
          </p>

          <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
            {ar
              ? "رابط الدعوة ومشاركة واتساب يظهران فقط بعد إتمام الدفع بنجاح."
              : "The invite link and WhatsApp share appear only after successful payment."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
