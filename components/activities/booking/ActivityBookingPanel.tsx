"use client";



import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { BookingDatePicker } from "@/components/activities/booking/BookingDatePicker";

import {

  GiftBookingModal,

  type GiftRecipientDetails,

} from "@/components/activities/booking/GiftBookingModal";

import {

  calculateBookingTotal,

  formatDisplayDate,

  formatMoney,

  parsePriceAmount,

  toIsoDate,

} from "@/lib/booking";

import {
  resolveAvailableTimesForDate,
  resolveBookableDays,
  resolveBookableIsoSet,
} from "@/lib/activity-schedule";

import { bookingLabels, giftConfirmedMessage } from "@/lib/booking-labels";

import type { Activity } from "@/types/api";

import type { Locale } from "@/lib/i18n";

import { getApiBaseUrl } from "@/lib/api-base";

import { paymentService } from "@/services/paymentService";

import type { PaymentConfig, PaymentMethodOption } from "@/types/payment";



type BookingMode = "self" | "gift";



interface ActivityBookingPanelProps {

  readonly activity: Activity;

  readonly locale: Locale;

  readonly giftBookingEnabled?: boolean;

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

}: ActivityBookingPanelProps): React.ReactElement {

  const labels = bookingLabels(locale);

  const ar = locale === "ar";

  const unitPrice = parsePriceAmount(activity.price);

  const bookableDays = useMemo(() => resolveBookableDays(activity, 60), [activity]);

  const bookableIsoSet = useMemo(() => resolveBookableIsoSet(activity, 60), [activity]);

  const initialDate = bookableDays[0] ?? new Date();

  const [bookingMode, setBookingMode] = useState<BookingMode>("self");

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const [adults, setAdults] = useState(1);

  const [children, setChildren] = useState(0);

  const timesForDate = useMemo(
    () => resolveAvailableTimesForDate(activity, selectedDate),
    [activity, selectedDate],
  );

  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    setSelectedTime(timesForDate[0] ?? "");
  }, [timesForDate]);

  const [giftDetails, setGiftDetails] = useState<GiftRecipientDetails | null>(null);

  const [giftModalOpen, setGiftModalOpen] = useState(false);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [confirmationCode, setConfirmationCode] = useState("");

  const [pdfUrl, setPdfUrl] = useState("");



  const isGift = bookingMode === "gift";

  const giftReady = isGift && giftDetails !== null;

  const showBookingSteps = bookingMode === "self" || giftReady;

  const dateStepNum = isGift ? 2 : 1;

  const checkoutStepNum = isGift ? 3 : 2;



  const total = calculateBookingTotal(unitPrice, adults, children);

  const totalLabel = unitPrice > 0 ? formatMoney(total, locale) : activity.price ?? "—";

  const unitLabel = unitPrice > 0 ? formatMoney(unitPrice, locale) : activity.price ?? "—";



  const paymentMethods: PaymentMethodOption[] = paymentConfig?.methods ?? [];

  const livePayments = paymentConfig?.liveMode ?? false;



  useEffect(() => {

    paymentService.getConfig(locale).then((config) => {

      setPaymentConfig(config);

      if (config.methods[0]) {

        setPaymentMethod(config.methods[0].id);

      }

    });

  }, [locale]);



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

        booking_date: toIsoDate(selectedDate),

        booking_time: selectedTime || undefined,

        is_gift: isGift,

        gift_recipient_name: isGift ? giftDetails?.name : undefined,

        gift_recipient_phone: isGift ? giftDetails?.phone : undefined,

        gift_recipient_email: isGift ? giftDetails?.email || undefined : undefined,

        gift_message: isGift ? giftDetails?.message || undefined : undefined,

        adults,

        children,

        total_amount: totalLabel,

        payment_method: paymentMethod,

        message: [

          isGift && giftDetails

            ? `${labels.giftBooking}: ${giftDetails.name} (${giftDetails.phone})`

            : null,

          isGift && giftDetails?.message ? `${labels.giftMessage}: ${giftDetails.message}` : null,

          `${labels.adults}: ${adults}`,

          `${labels.children}: ${children}`,

          `${ar ? "التاريخ" : "Date"}: ${formatDisplayDate(selectedDate, locale)}`,

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

      setPdfUrl(

        result.pdfUrl ??

          `${getApiBaseUrl()}/api/bookings/${encodeURIComponent(code)}/pdf`,

      );

      setSuccess(true);

    } catch (err) {

      setError(err instanceof Error ? err.message : ar ? "تعذّر إتمام الحجز" : "Booking failed");

    } finally {

      setLoading(false);

    }

  }



  if (success) {

    return (

      <motion.div

        initial={{ opacity: 0, y: 8 }}

        animate={{ opacity: 1, y: 0 }}

        className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-950 p-6 text-center"

      >

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-300">

          ✓

        </div>

        <h2 className="mt-4 text-xl font-bold text-white">{labels.successTitle}</h2>

        <p className="mt-2 text-sm text-slate-400">

          {giftReady ? labels.successGiftSubtitle : labels.successSubtitle}

        </p>



        <div className="mx-auto mt-6 max-w-xs rotate-[-1deg] rounded-2xl border border-dashed border-cyan-400/40 bg-slate-900/90 p-5 shadow-xl">

          <p className="text-[10px] uppercase tracking-widest text-slate-500">{labels.ticket}</p>

          <p className="mt-2 font-mono text-2xl font-bold text-cyan-300">{confirmationCode}</p>

          <span className="mt-2 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-300">

            {labels.confirmed}

          </span>

          <p className="mt-4 text-sm font-medium text-white">{activity.title}</p>

          <p className="text-xs text-slate-500">{formatDisplayDate(selectedDate, locale)}</p>

          <p className="mt-1 text-xs text-slate-400">

            {adults} {labels.adults}

            {children > 0 ? ` · ${children} ${labels.children}` : ""}

          </p>

          <p className="mt-2 text-lg font-bold text-white">{totalLabel}</p>

          {giftReady && giftDetails ? (

            <p className="mt-3 text-start text-xs font-medium text-violet-200">

              {giftConfirmedMessage(locale, giftDetails.name)}

            </p>

          ) : null}

        </div>



        {pdfUrl ? (

          <a

            href={pdfUrl}

            download

            target="_blank"

            rel="noopener noreferrer"

            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-cyan-500/15 py-3.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"

          >

            <span aria-hidden>⬇</span>

            {labels.downloadPdf}

          </a>

        ) : null}

      </motion.div>

    );

  }



  return (

    <div

      id="book"

      className="scroll-mt-28 rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950 p-5 shadow-2xl shadow-black/40 sm:p-6"

    >

      <div className="flex items-baseline justify-between gap-2 border-b border-white/10 pb-4">

        <div>

          <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/90">

            {ar ? "احجز تجربتك" : "Book your experience"}

          </p>

          <p className="mt-1 text-3xl font-bold text-white">{unitLabel}</p>

          <p className="text-xs text-slate-500">{labels.perPerson}</p>

        </div>

        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">

          {labels.securePayment}

        </span>

      </div>



      <form className="mt-5 space-y-5" onSubmit={(e) => void handleSubmit(e)}>

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

                    <span className="mt-0.5 block text-xs text-slate-400">{labels.giftModeGiftHint}</span>

                  </button>

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

              initial={{ opacity: 0, height: 0 }}

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
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  bookableIsoSet={bookableIsoSet}
                />

                {timesForDate.length > 0 ? (

                  <div className="mt-4" role="group" aria-labelledby="booking-time-label">

                    <p id="booking-time-label" className="mb-2 text-xs font-medium text-slate-400">

                      {labels.selectTime}

                      <span className="mx-1 text-slate-600">·</span>

                      <span className="text-slate-500">{formatDisplayDate(selectedDate, locale)}</span>

                    </p>

                    <div className="flex flex-wrap gap-2">

                      {timesForDate.map((time) => (

                        <button

                          key={time}

                          type="button"

                          onClick={() => setSelectedTime(time)}

                          className={

                            selectedTime === time

                              ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100"

                              : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:border-white/20"

                          }

                        >

                          {time}

                        </button>

                      ))}

                    </div>

                  </div>

                ) : null}

              </section>



              <section className="grid gap-3 sm:grid-cols-2">

                <GuestStepper

                  label={labels.adults}

                  value={adults}

                  min={1}

                  max={20}

                  onChange={setAdults}

                />

                <GuestStepper

                  label={labels.children}

                  value={children}

                  min={0}

                  max={10}

                  onChange={setChildren}

                />

              </section>



              <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-cyan-200/80">{labels.total}</span>

                  <span className="text-2xl font-bold text-white">{totalLabel}</span>

                </div>

                <p className="mt-1 text-xs text-slate-500">

                  {formatDisplayDate(selectedDate, locale)} · {adults + children}{" "}

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

                    placeholder={

                      giftReady

                        ? ar

                          ? "اسمك أنت (المُهدي) *"

                          : "Your name (gift giver) *"

                        : ar

                          ? "الاسم الكامل"

                          : "Full name"

                    }

                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"

                  />

                  <input

                    name="email"

                    type="email"

                    required

                    placeholder={ar ? "البريد الإلكتروني" : "Email"}

                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"

                  />

                  <input

                    name="phone"

                    type="tel"

                    required

                    placeholder={ar ? "رقم الجوال" : "Phone"}

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


