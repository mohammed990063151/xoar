"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookingDatePicker } from "@/components/activities/booking/BookingDatePicker";
import {
  GiftBookingModal,
  type GiftRecipientDetails,
} from "@/components/activities/booking/GiftBookingModal";
import {
  bookableIsoDaysInRange,
  formatDisplayDate,
  formatMoney,
  parsePriceAmount,
  toIsoDate,
} from "@/lib/booking";
import {
  calculateGuestBookingTotal,
  guestUnitPricesForDate,
  resolveAvailableTimesForDate,
  resolveBookableDays,
  resolveBookableIsoSet,
  type LiveBookingSlot,
} from "@/lib/activity-schedule";
import { bookingLabels, giftConfirmedMessage } from "@/lib/booking-labels";
import type { Activity, ActivityBookingSlot } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { BookingInvoiceCard } from "@/components/booking/BookingInvoiceCard";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import { bookingPdfUrl } from "@/lib/booking-pdf-url";
import { getApiBaseUrl } from "@/lib/api-base";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import { localizedPath } from "@/lib/i18n";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";
import { paymentService } from "@/services/paymentService";
import { formProfileDefaults } from "@/lib/form-profile-cookie";
import { couponService, type CouponValidationResult } from "@/services/couponService";
import { ActivityPriceDisplay } from "@/components/ui/ActivityPriceDisplay";
import type { PaymentConfig, PaymentMethodOption } from "@/types/payment";

type BookingMode = "self" | "gift";

export interface BookingScheduleSelection {
  dateFrom: string;
  dateTo: string;
  bookingTime: string;
}

interface ActivityBookingPanelProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly giftBookingEnabled?: boolean;
  /** When true, this checkout is a paid group booking (invite after payment). */
  readonly forceGroup?: boolean;
  readonly onScheduleChange?: (schedule: BookingScheduleSelection) => void;
  /** Party size shared with group-invite panel (drives booking total). */
  readonly partySize?: number;
  readonly onPartySizeChange?: (count: number) => void;
}

function GuestStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (n: number) => void;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-lg text-white hover:bg-white/10"
          aria-label="-"
        >
          −
        </button>
        <span className="min-w-[2ch] text-center font-semibold text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-lg text-white hover:bg-white/10"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  );
}

function StepBadge({ n }: { readonly n: number }): React.ReactElement {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs text-violet-200">
      {n}
    </span>
  );
}

export function ActivityBookingPanel({
  activity,
  locale,
  giftBookingEnabled = true,
  forceGroup = false,
  onScheduleChange,
  partySize,
  onPartySizeChange,
}: ActivityBookingPanelProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const ar = locale === "ar";
  const theme = useDocumentTheme();
  const bookableDays = useMemo(() => resolveBookableDays(activity, 90), [activity]);
  const bookableIsoSet = useMemo(() => resolveBookableIsoSet(activity, 90), [activity]);
  const [bookingMode, setBookingMode] = useState<BookingMode>("self");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  useEffect(() => {
    if (bookableDays.length === 0) {
      if (dateFrom || dateTo) {
        setDateFrom("");
        setDateTo("");
      }
      return;
    }
    const firstIso = toIsoDate(bookableDays[0]);
    if (!dateFrom || !bookableIsoSet.has(dateFrom)) {
      setDateFrom(firstIso);
      setDateTo(firstIso);
      return;
    }
    if (dateTo && !bookableIsoSet.has(dateTo)) {
      setDateTo(dateFrom);
    }
  }, [bookableDays, bookableIsoSet, dateFrom, dateTo]);
  const selectedDate = useMemo(() => {
    const iso = dateFrom || (bookableDays[0] ? toIsoDate(bookableDays[0]) : toIsoDate(new Date()));
    return new Date(`${iso}T12:00:00`);
  }, [dateFrom, bookableDays]);
  const selectedDays = useMemo(
    () => bookableIsoDaysInRange(dateFrom, dateTo || dateFrom, bookableIsoSet),
    [dateFrom, dateTo, bookableIsoSet],
  );
  const dayCount = Math.max(1, selectedDays.length);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    if (typeof partySize === "number" && partySize >= 1 && partySize !== adults) {
      setAdults(partySize);
    }
  }, [partySize, adults]);

  const localTimes = useMemo(
    () => resolveAvailableTimesForDate(activity, selectedDate),
    [activity, selectedDate],
  );
  const [liveSlots, setLiveSlots] = useState<LiveBookingSlot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const iso = dateFrom;
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      setLiveSlots(null);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    const url = `${getApiBaseUrl()}/api/activities/${locale}/${encodeURIComponent(activity.slug)}/slots?date=${iso}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error("slots");
        return (await res.json()) as { data?: { slots?: ActivityBookingSlot[] } };
      })
      .then((json) => {
        if (cancelled) return;
        const slots = (json.data?.slots ?? []).map((slot) => ({
          ...slot,
          time: String(slot.time ?? "").slice(0, 5),
        }));
        setLiveSlots(slots);
      })
      .catch(() => {
        if (!cancelled) setLiveSlots(null);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activity.slug, dateFrom, locale]);

  const slotOptions = useMemo((): LiveBookingSlot[] => {
    if (liveSlots && liveSlots.length > 0) return liveSlots;
    return localTimes.map((time) => ({
      time,
      available: true,
      seatsLeft: null,
      capacity: null,
      adultPrice: "",
      childPrice: "",
      adultPriceAmount: undefined,
      childPriceAmount: undefined,
    }));
  }, [liveSlots, localTimes]);

  const [selectedTime, setSelectedTime] = useState("");
  useEffect(() => {
    const firstOpen = slotOptions.find((s) => s.available !== false)?.time ?? slotOptions[0]?.time ?? "";
    setSelectedTime((current) => {
      const stillValid = slotOptions.some((s) => s.time === current && s.available !== false);
      return stillValid ? current : firstOpen;
    });
  }, [slotOptions]);

  const selectedSlot = useMemo(
    () => slotOptions.find((s) => s.time === selectedTime) ?? null,
    [slotOptions, selectedTime],
  );

  const dayPrices = useMemo(() => guestUnitPricesForDate(activity, selectedDate), [activity, selectedDate]);
  const adultUnit =
    typeof selectedSlot?.adultPriceAmount === "number" && selectedSlot.adultPriceAmount > 0
      ? selectedSlot.adultPriceAmount
      : dayPrices.adult;
  const childUnit =
    typeof selectedSlot?.childPriceAmount === "number" && selectedSlot.childPriceAmount >= 0
      ? selectedSlot.childPriceAmount
      : dayPrices.child;
  const unitPrice = adultUnit > 0 ? adultUnit : parsePriceAmount(activity.displayPrice ?? activity.price);

  const seatsLeft = selectedSlot?.seatsLeft ?? null;
  const maxParty =
    seatsLeft !== null && seatsLeft !== undefined ? Math.max(1, seatsLeft) : 30;

  useEffect(() => {
    if (adults + children > maxParty) {
      const nextAdults = Math.min(adults, maxParty);
      const nextChildren = Math.max(0, maxParty - nextAdults);
      if (nextAdults !== adults) setAdults(nextAdults);
      if (nextChildren !== children) setChildren(nextChildren);
    }
  }, [maxParty, adults, children]);

  const [giftDetails, setGiftDetails] = useState<GiftRecipientDetails | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [groupInviteUrl, setGroupInviteUrl] = useState<string | null>(null);
  const [groupWhatsappUrl, setGroupWhatsappUrl] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const loginReturnPath = localizedPath(locale, `/activities/${activity.slug}#book`);
  const loginHref = `${localizedPath(locale, "/account/login")}?returnTo=${encodeURIComponent(loginReturnPath)}`;
  const registerHref = `${localizedPath(locale, "/account/login")}?mode=register&returnTo=${encodeURIComponent(loginReturnPath)}`;

  const isGift = bookingMode === "gift";
  const giftReady = isGift && giftDetails !== null;
  const showBookingSteps = bookingMode === "self" || giftReady;
  const dateStepNum = isGift ? 2 : 1;
  const checkoutStepNum = isGift ? 3 : 2;
  const isGroupParty = forceGroup || adults >= 2;

  const subtotal = calculateGuestBookingTotal(adultUnit || unitPrice, childUnit, adults, children, dayCount);
  const discountAmount =
    appliedCoupon?.valid && typeof appliedCoupon.discount === "number"
      ? appliedCoupon.discount
      : 0;
  const total =
    appliedCoupon?.valid && typeof appliedCoupon.total === "number"
      ? appliedCoupon.total
      : subtotal;
  const totalLabel =
    unitPrice > 0
      ? formatMoney(total, locale)
      : (activity.displayPrice ?? activity.price ?? "—");

  const paymentMethods: PaymentMethodOption[] = paymentConfig?.methods ?? [];
  const livePayments = paymentConfig?.liveMode ?? false;
  const guestDefaults = formProfileDefaults({
    name: customer?.name,
    email: customer?.email,
    phone: customer?.phone ?? undefined,
    city: customer?.city ?? undefined,
  });

  useEffect(() => {
    onScheduleChange?.({
      dateFrom,
      dateTo: dateTo || dateFrom,
      bookingTime: selectedTime,
    });
  }, [dateFrom, dateTo, selectedTime, onScheduleChange]);

  useEffect(() => {
    paymentService.getConfig(locale).then((config) => {
      setPaymentConfig(config);
      if (config.methods[0]) {
        setPaymentMethod(config.methods[0].id);
      }
    });
  }, [locale]);

  useEffect(() => {
    let active = true;
    void customerService.me().then((profile) => {
      if (active) {
        setCustomer(profile);
        setAuthChecking(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const refreshAuth = () => {
      void customerService.me().then(setCustomer);
    };
    window.addEventListener("focus", refreshAuth);
    return () => window.removeEventListener("focus", refreshAuth);
  }, []);

  useEffect(() => {
    const code = activity.activeCoupon?.code;
    if (!code) return;
    setCouponInput(code);
    setCouponLoading(true);
    couponService
      .validate(locale, activity.slug, code, adults, children, dayCount)
      .then((result) => {
        if (result.valid) {
          setAppliedCoupon(result);
          setCouponError("");
        }
      })
      .catch(() => {
        setAppliedCoupon(null);
      })
      .finally(() => setCouponLoading(false));
  }, [activity.slug, activity.activeCoupon?.code, locale, adults, children, dayCount]);

  async function applyCouponCode(): Promise<void> {
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await couponService.validate(
        locale,
        activity.slug,
        couponInput,
        adults,
        children,
        dayCount,
      );
      if (!result.valid) {
        setAppliedCoupon(null);
        setCouponError(result.message ?? (ar ? "كود غير صالح" : "Invalid code"));
        return;
      }
      setAppliedCoupon(result);
    } catch {
      setAppliedCoupon(null);
      setCouponError(ar ? "تعذّر التحقق من الكوبون" : "Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }
  function clearCoupon(): void {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError("");
  }
  const methodIcons: Record<string, string> = {
    card: "💳",
    apple: "",
    google: "G",
    tamara: "T",
    tabby: "B",
  };
  function selectSelfBooking(): void {
    setBookingMode("self");
    setGiftDetails(null);
    setGiftModalOpen(false);
    setError("");
  }
  function setPartyAdults(count: number): void {
    const min = forceGroup ? 2 : 1;
    const n = Math.max(min, Math.min(20, count));
    setAdults(n);
    onPartySizeChange?.(n);
  }
  function selectGiftBooking(): void {
    setBookingMode("gift");
    setGiftModalOpen(true);
    setError("");
  }
  function handleGiftModalClose(): void {
    setGiftModalOpen(false);
    if (!giftDetails) {
      setBookingMode("self");
    }
  }
  function handleGiftSaved(details: GiftRecipientDetails): void {
    setGiftDetails(details);
    setBookingMode("gift");
    setGiftModalOpen(false);
    setError("");
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    if (isGift && !giftDetails?.name.trim()) {
      setError(labels.giftRequiredOnSubmit);
      setGiftModalOpen(true);
      return;
    }
    if (!dateFrom) {
      setError(ar ? "اختر فترة الحجز." : "Please select a booking date range.");
      return;
    }
    if (selectedDays.length < 1) {
      setError(ar ? "لا توجد أيام متاحة ضمن الفترة المختارة." : "No bookable days in the selected range.");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await paymentService.submitBooking({
        type: "booking",
        activity_id: activity.id,
        locale,
        source: "activity-detail",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        booking_date: dateFrom || toIsoDate(selectedDate),
        booking_end_date: (dateTo || dateFrom) || toIsoDate(selectedDate),
        booking_time: selectedTime || undefined,
        is_gift: isGift,
        gift_recipient_name: isGift ? giftDetails?.name : undefined,
        gift_recipient_phone: isGift ? giftDetails?.phone : undefined,
        gift_recipient_email: isGift ? giftDetails?.email || undefined : undefined,
        gift_message: isGift ? giftDetails?.message || undefined : undefined,
        is_group: isGroupParty,
        adults,
        children,
        total_amount: totalLabel,
        coupon_code: appliedCoupon?.valid ? appliedCoupon.code : undefined,
        payment_method: paymentMethod,
        message: [
          isGift && giftDetails
            ? `${labels.giftBooking}: ${giftDetails.name} (${giftDetails.phone})`
            : null,
          isGift && giftDetails?.message ? `${labels.giftMessage}: ${giftDetails.message}` : null,
          isGroupParty ? `${labels.groupBadge}: ${adults} ${ar ? "أشخاص" : "people"}` : null,
          `${labels.adults}: ${adults}`,
          `${labels.children}: ${children}`,
          `${ar ? "الفترة" : "Period"}: ${dateFrom}${(dateTo || dateFrom) !== dateFrom ? ` → ${dateTo || dateFrom}` : ""} (${dayCount} ${ar ? "يوم" : "day(s)"})`,
          selectedTime ? `${labels.selectTime}: ${selectedTime}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      });
      if (result.requiresRedirect && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      const code = result.confirmationCode ?? `XRA${result.id}`;
      setConfirmationCode(code);
      setPdfUrl(result.pdfUrl ?? bookingPdfUrl(code, theme));
      setGroupInviteUrl(result.inviteUrl ?? null);
      setGroupWhatsappUrl(result.whatsappUrl ?? null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إتمام الحجز" : "Booking failed");
    } finally {
      setLoading(false);
    }
  }
  if (success) {
    const heroImage = activity.image_url ? normalizeStorageImageUrl(activity.image_url) : undefined;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="booking-success-panel rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-950 p-4 text-center sm:p-6"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-300">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">{labels.successTitle}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {giftReady ? labels.successGiftSubtitle : labels.successSubtitle}
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <BookingInvoiceCard
            locale={locale}
            confirmationCode={confirmationCode}
            activityTitle={activity.title}
            activityImage={heroImage}
            bookingDate={dateFrom}
            bookingDateTo={dateTo || dateFrom}
            guests={adults + children}
            totalAmount={totalLabel}
            isGift={giftReady}
            isGroup={isGroupParty}
            isPaid
          />
          {giftReady && giftDetails ? (
            <p className="mt-3 text-start text-xs font-medium text-violet-200">
              {giftConfirmedMessage(locale, giftDetails.name)}
            </p>
          ) : null}
        </div>
        {confirmationCode ? (
          <a
            href={bookingPdfUrl(confirmationCode, theme)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="booking-success-download mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 py-3.5 text-sm font-semibold shadow-md transition hover:bg-slate-800"
          >
            <span aria-hidden>⬇</span>
            {labels.downloadPdf}
          </a>
        ) : null}
        {groupInviteUrl ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-start">
            <p className="text-sm font-semibold text-cyan-100">
              {ar
                ? "تم الدفع — شارك رابط الدعوة مع أصدقائك"
                : "Paid — share the invite link with friends"}
            </p>
            <input
              readOnly
              value={groupInviteUrl}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
              onClick={(e) => e.currentTarget.select()}
            />
            {groupWhatsappUrl ? (
              <a
                href={groupWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {ar ? "مشاركة واتساب" : "Share on WhatsApp"}
              </a>
            ) : null}
          </div>
        ) : isGroupParty ? (
          <p className="mt-5 text-xs text-amber-200/90">
            {ar
              ? "رابط الدعوة يظهر بعد تأكيد الدفع. إن لم يظهر، راجع مجموعاتك في الحساب."
              : "The invite link appears after payment is confirmed. Otherwise check My Groups in your account."}
          </p>
        ) : null}
      </motion.div>
    );
  }
  return (
    <div
      id="book"
      className="booking-panel scroll-mt-24 rounded-3xl border border-violet-500/20 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950 p-4 shadow-2xl shadow-black/40 ring-1 ring-white/5 sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{activity.title}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/90">
            {ar ? "احجز تجربتك" : "Book your experience"}
          </p>
          <ActivityPriceDisplay
            locale={locale}
            price={
              activity.activeCoupon
                ? (activity.displayPrice ?? activity.price)
                : (activity.originalPrice ?? activity.original_price ?? activity.price)
            }
            comparePrice={
              activity.activeCoupon
                ? (activity.originalPrice ?? activity.original_price ?? activity.comparePrice)
                : undefined
            }
            showCompare={Boolean(activity.activeCoupon)}
            perPerson
            size="md"
          />
        </div>
        <span className="inline-flex w-fit shrink-0 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
          {labels.securePayment}
        </span>
      </div>
      {authChecking ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-center text-xs text-slate-500">
          {ar ? "جاري التحقق من حسابك…" : "Checking your account…"}
        </div>
      ) : null}
      <form className="mt-5 space-y-5" onSubmit={(e) => void handleSubmit(e)}>
        {!authChecking && customer ? (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {ar ? "مسجّل الدخول كـ" : "Signed in as"}{" "}
          <strong className="text-white">{customer.name}</strong>
          <span className="mx-1.5 text-emerald-300/60" aria-hidden>
            ·
          </span>
          <span className="text-emerald-200/80">{customer.email}</span>
        </div>
        ) : !authChecking ? (
        <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          <p>
            {ar
              ? "يمكنك إتمام الحجز مباشرة بدون حساب. تسجيل الدخول اختياري لمتابعة حجوزاتك."
              : "Complete your booking as a guest. Sign in optionally to track your bookings."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              {ar ? "تسجيل الدخول (اختياري)" : "Sign in (optional)"}
            </Link>
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              {ar ? "إنشاء حساب (اختياري)" : "Create account (optional)"}
            </Link>
          </div>
        </div>
        ) : null}
        {giftBookingEnabled ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <StepBadge n={1} />
              {giftReady
                ? ar
                  ? "تم الإهداء"
                  : "Gift completed"
                : labels.giftBookingType}
            </h3>
            {!giftReady ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={selectSelfBooking}
                    className={
                      bookingMode === "self"
                        ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-3 text-start"
                        : "rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-start hover:border-white/20"
                    }
                  >
                    <span className="block text-sm font-semibold text-white">{labels.giftModeSelf}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{labels.giftModeSelfHint}</span>
                  </button>
                  {giftBookingEnabled ? (
                    <button
                      type="button"
                      onClick={selectGiftBooking}
                      className={
                        isGift
                          ? "rounded-xl border border-violet-400/50 bg-violet-500/15 px-4 py-3 text-start"
                          : "rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-start hover:border-white/20"
                      }
                    >
                      <span className="block text-sm font-semibold text-white">
                        🎁 {labels.giftModeGift}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {labels.giftModeGiftHint}
                      </span>
                    </button>
                  ) : null}
                </div>
                {isGift && !giftDetails ? (
                  <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-4 text-center">
                    <p className="text-sm text-violet-100">{labels.giftCompleteHint}</p>
                    <button
                      type="button"
                      onClick={() => setGiftModalOpen(true)}
                      className="mt-3 rounded-full bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white"
                    >
                      🎁 {labels.giftModalTitle}
                    </button>
                  </div>
                ) : null}
              </>
            ) : giftDetails ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-violet-400/40 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 px-4 py-4"
              >
                <p className="text-sm font-semibold leading-relaxed text-violet-50">
                  {giftConfirmedMessage(locale, giftDetails.name)}
                </p>
                <button
                  type="button"
                  onClick={() => setGiftModalOpen(true)}
                  className="mt-3 text-xs font-medium text-violet-300 underline-offset-2 hover:text-violet-100 hover:underline"
                >
                  {labels.giftEdit}
                </button>
              </motion.div>
            ) : null}
          </section>
        ) : null}
        <AnimatePresence mode="wait">
          {showBookingSteps ? (
            <motion.div
              key="booking-steps"
              initial={false}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-5 overflow-hidden"
            >
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <StepBadge n={giftBookingEnabled ? dateStepNum : 1} />
                  {labels.selectDate}
                </h3>
                <BookingDatePicker
                  locale={locale}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onChange={({ dateFrom: nextFrom, dateTo: nextTo }) => {
                    setDateFrom(nextFrom);
                    setDateTo(nextTo);
                  }}
                  bookableIsoSet={bookableIsoSet}
                />
                {slotOptions.length > 0 ? (
                  <div className="mt-4" role="group" aria-labelledby="booking-time-label">
                    <p id="booking-time-label" className="mb-2 text-xs font-medium text-slate-400">
                      {labels.selectTime}
                      <span className="mx-1 text-slate-600">·</span>
                      <span className="text-slate-500">{formatDisplayDate(selectedDate, locale)}</span>
                      {slotsLoading ? (
                        <span className="ms-2 text-slate-500">{ar ? "تحديث المقاعد…" : "Updating seats…"}</span>
                      ) : null}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slotOptions.map((slot) => {
                        const full = slot.available === false;
                        const active = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={full}
                            onClick={() => setSelectedTime(slot.time)}
                            className={
                              full
                                ? "cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-600 line-through"
                                : active
                                  ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100"
                                  : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:border-white/20"
                            }
                          >
                            <span className="block">{slot.time}</span>
                            {typeof slot.seatsLeft === "number" ? (
                              <span className="mt-0.5 block text-[10px] opacity-80">
                                {full
                                  ? ar
                                    ? "مكتمل"
                                    : "Full"
                                  : ar
                                    ? `${slot.seatsLeft} مقاعد`
                                    : `${slot.seatsLeft} left`}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    {adultUnit > 0 ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {ar ? "بالغ" : "Adult"} {formatMoney(adultUnit, locale)}
                        {" · "}
                        {ar ? "طفل" : "Child"} {formatMoney(childUnit, locale)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>
              <section className="grid gap-3 sm:grid-cols-2">
                <GuestStepper
                  label={labels.adults}
                  value={adults}
                  min={forceGroup ? 2 : 1}
                  max={Math.max(forceGroup ? 2 : 1, Math.min(20, maxParty))}
                  onChange={setPartyAdults}
                />
                <GuestStepper
                  label={labels.children}
                  value={children}
                  min={0}
                  max={Math.max(0, Math.min(10, maxParty - adults))}
                  onChange={setChildren}
                />
              </section>
              {isGroupParty ? (
                <p className="rounded-xl border border-teal-400/25 bg-teal-500/10 px-3 py-2 text-xs text-teal-100">
                  {labels.groupBadge}: {adults} {ar ? "أشخاص" : "people"} · {labels.total}{" "}
                  {totalLabel}
                </p>
              ) : null}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {ar ? "كود خصم" : "Coupon code"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder={ar ? "أدخل الكود" : "Enter code"}
                    className="min-w-[140px] flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void applyCouponCode()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {couponLoading ? "…" : ar ? "تطبيق" : "Apply"}
                  </button>
                  {appliedCoupon?.valid ? (
                    <button
                      type="button"
                      onClick={clearCoupon}
                      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-300"
                    >
                      {ar ? "إزالة" : "Remove"}
                    </button>
                  ) : null}
                </div>
                {couponError ? (
                  <p className="mt-2 text-xs text-red-300">{couponError}</p>
                ) : null}
                {appliedCoupon?.valid ? (
                  <p className="mt-2 text-xs text-emerald-300">
                    {ar ? "تم تطبيق الكود" : "Coupon applied"}: {appliedCoupon.code}
                    {appliedCoupon.label ? ` — ${appliedCoupon.label}` : ""}
                  </p>
                ) : null}
              </section>
              <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-200/80">{labels.total}</span>
                  <span className="text-2xl font-bold text-white">{totalLabel}</span>
                </div>
                {discountAmount > 0 ? (
                  <p className="mt-1 text-xs text-emerald-300">
                    {ar ? "خصم" : "Discount"}: −{formatMoney(discountAmount, locale)}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {dateFrom}
                  {(dateTo || dateFrom) !== dateFrom ? ` → ${dateTo || dateFrom}` : ""}
                  {` · ${dayCount} ${ar ? "يوم" : "days"} · `}
                  {adults + children}{" "}
                  {ar ? "مشارك" : "guests"}
                </p>
              </div>
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <StepBadge n={giftBookingEnabled ? checkoutStepNum : 2} />
                  {labels.checkout}
                  {giftReady ? (
                    <span className="text-xs font-normal text-slate-500">
                      ({ar ? "بيانات المُهدي" : "Giver details"})
                    </span>
                  ) : null}
                </h3>
                <div className="space-y-3">
                  <input
                    name="name"
                    required
                    defaultValue={guestDefaults.name}
                    key={`booking-name-${customer?.id ?? "guest"}-${guestDefaults.name}`}
                    placeholder={
                      giftReady
                        ? ar
                          ? "اسمك أنت (المُهدي) *"
                          : "Your name (gift giver) *"
                        : ar
                          ? "الاسم الكامل *"
                          : "Full name *"
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={guestDefaults.email}
                    key={`booking-email-${customer?.id ?? "guest"}-${guestDefaults.email}`}
                    placeholder={ar ? "البريد الإلكتروني *" : "Email *"}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={guestDefaults.phone}
                    key={`booking-phone-${customer?.id ?? "guest"}-${guestDefaults.phone}`}
                    placeholder={ar ? "رقم الجوال *" : "Phone *"}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </div>
              </section>
              <section>
                <p className="mb-2 text-xs text-slate-500">
                  {ar ? "بوابة الدفع" : "Payment gateway"}
                </p>
                {!livePayments ? (
                  <p className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
                    {ar
                      ? "وضع تجريبي —   "
                      : "Demo mode — add gateway keys in .env to enable live payments."}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={
                        paymentMethod === method.id
                          ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 py-3 text-xs font-semibold text-cyan-100"
                          : "rounded-xl border border-white/10 bg-white/5 py-3 text-xs text-slate-400 hover:border-white/20"
                      }
                    >
                      <span className="block text-base">{methodIcons[method.id] ?? "●"}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
                  <span className="text-emerald-400">🔒</span>
                  {labels.securePayment}
                </p>
              </section>
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading
                  ? ar
                    ? "جاري المعالجة..."
                    : "Processing..."
                  : giftReady
                    ? labels.proceedGift
                    : labels.proceed}
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
      <GiftBookingModal
        open={giftModalOpen}
        locale={locale}
        activityTitle={activity.title}
        initial={giftDetails}
        onClose={handleGiftModalClose}
        onSave={handleGiftSaved}
      />
    </div>
  );
}
