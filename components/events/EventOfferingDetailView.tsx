"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActivityLocationMap } from "@/components/activities/ActivityLocationMap";
import { EventBookingCalendar } from "@/components/events/EventBookingCalendar";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import type { EventOfferingPackage } from "@/types/event-offering";
import {
  GeideaPaymentModal,
  type GeideaPaymentSession,
} from "@/components/payment/GeideaPaymentModal";
import { GeideaWordmark, PaymentBrandMark } from "@/components/payment/PaymentBrandMark";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney, parsePriceAmount } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { formProfileDefaults } from "@/lib/form-profile-cookie";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, scrollRow, siteContainer } from "@/lib/layout";
import { whatsappHref } from "@/lib/whatsapp";
import { paymentService } from "@/services/paymentService";
import type { EventOffering, EventOfferingAudience } from "@/types/event-offering";
import type { PaymentConfig, PaymentMethodOption } from "@/types/payment";

interface EventOfferingDetailViewProps {
  readonly locale: Locale;
  readonly audience: EventOfferingAudience;
  readonly offering: EventOffering;
}

type TabId = "description" | "portfolio" | "terms" | "organizer" | "faq" | "location";

export function EventOfferingDetailView({
  locale,
  audience,
  offering,
}: EventOfferingDetailViewProps): React.ReactElement {
  const ar = locale === "ar";
  const basePath = audience === "individual" ? "/individual-events" : "/corporate-events";
  const profile = formProfileDefaults();
  const organizer = offering.organizerName?.trim() || "Xora";
  const categoryLabel = offering.shortLabel?.trim() || (audience === "corporate"
    ? ar ? "شركات" : "Corporate"
    : ar ? "أفراد" : "Individual");

  const galleryImages = useMemo(() => {
    const urls = [offering.image, ...(offering.gallery ?? [])]
      .filter((url): url is string => Boolean(url && url.trim()))
      .map((url) => url.trim());
    return urls.length > 0 ? Array.from(new Set(urls)) : [ACTIVITY_FALLBACK_IMAGE];
  }, [offering.gallery, offering.image]);

  const portfolio = offering.portfolioProjects ?? [];
  const faqItems = offering.faq ?? [];
  const highlights = offering.highlights ?? [];
  const terms = offering.termsConditions?.trim() || "";
  const whatsIncluded = offering.whatsIncluded?.trim() || "";
  const locationMode = offering.locationMode === "customer_choice" ? "customer_choice" : "fixed";
  const customerChoosesVenue = locationMode === "customer_choice";
  const hasCoords =
    !customerChoosesVenue &&
    typeof offering.latitude === "number" &&
    !Number.isNaN(offering.latitude) &&
    typeof offering.longitude === "number" &&
    !Number.isNaN(offering.longitude);
  const hasLocationSection =
    customerChoosesVenue || hasCoords || Boolean(offering.location?.trim());
  const locationLabel = customerChoosesVenue
    ? ar
      ? "الموقع يحدده العميل"
      : "Venue set by customer"
    : offering.location?.trim() || null;

  const contactWhatsapp = offering.contactWhatsapp || null;
  const contactPhone = offering.contactPhone || null;
  const contactEmail = offering.contactEmail || null;
  const waHref = whatsappHref(contactWhatsapp);
  const phoneHref = contactPhone
    ? `tel:${contactPhone.replace(/[^\d+]/g, "")}`
    : null;
  const mailHref = contactEmail ? `mailto:${contactEmail}` : null;

  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<TabId>("description");
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [detailsPackage, setDetailsPackage] = useState<EventOfferingPackage | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [guests, setGuests] = useState(1);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [geideaSession, setGeideaSession] = useState<GeideaPaymentSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    paymentService
      .getConfig(locale)
      .then((cfg) => {
        if (cancelled) return;
        setPaymentConfig(cfg);
        setPaymentMethod(cfg.methods?.[0]?.id ?? "");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [offering.slug]);

  const packagesTotal = useMemo(
    () =>
      offering.packages
        .filter((pkg) => selectedPackages.includes(pkg.id))
        .reduce((sum, pkg) => sum + (pkg.priceAmount || 0), 0),
    [offering.packages, selectedPackages],
  );
  const total = (offering.basePriceAmount || 0) + packagesTotal;
  const totalLabel = formatMoney(total, locale);

  const tabs = (
    [
      { id: "description" as const, label: ar ? "الوصف" : "Description", show: true },
      {
        id: "portfolio" as const,
        label: ar ? "نماذج مشاريع" : "Past projects",
        show: portfolio.length > 0,
      },
      { id: "terms" as const, label: ar ? "الشروط" : "Terms", show: Boolean(terms) },
      {
        id: "organizer" as const,
        label: ar ? "المنظّم" : "Organizer",
        show: Boolean(organizer) || Boolean(offering.organizerBio?.trim()),
      },
      { id: "faq" as const, label: ar ? "أسئلة شائعة" : "FAQ", show: faqItems.length > 0 },
      {
        id: "location" as const,
        label: ar ? "الموقع" : "Location",
        show: hasLocationSection,
      },
    ] as const
  ).filter((t) => t.show);

  function togglePackage(id: number): void {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    if (!dateFrom) {
      setError(ar ? "اختر يوم إقامة الفعالية." : "Choose the event day.");
      return;
    }
    const bookable = new Set(offering.availability?.bookableDates ?? []);
    if (bookable.size > 0) {
      const end = dateTo || dateFrom;
      const a = dateFrom <= end ? dateFrom : end;
      const b = dateFrom <= end ? end : dateFrom;
      let cursor = a;
      while (cursor <= b) {
        if (!bookable.has(cursor)) {
          setError(
            ar
              ? "أحد الأيام في الفترة غير متاح (مقفل أو مكتمل)."
              : "One day in the range is unavailable (locked or full).",
          );
          return;
        }
        const d = new Date(`${cursor}T12:00:00`);
        d.setDate(d.getDate() + 1);
        cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
    }
    if (!paymentMethod) {
      setError(ar ? "اختر طريقة الدفع." : "Choose a payment method.");
      return;
    }
    if (total <= 0) {
      setError(ar ? "السعر غير متاح للحجز." : "This offering is not bookable yet.");
      return;
    }
    if (offering.capacity && guests > offering.capacity) {
      setError(
        ar
          ? `الحد الأقصى للضيوف هو ${offering.capacity}.`
          : `Maximum guests is ${offering.capacity}.`,
      );
      return;
    }
    const venue = preferredLocation.trim();
    if (customerChoosesVenue && !venue) {
      setError(
        ar
          ? "اكتب موقع الفعالية الذي تريده (عنوانك أو مكانك)."
          : "Enter where you want the event to take place.",
      );
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await paymentService.submitEventBooking({
        type: "event_booking",
        event_offering_id: offering.id,
        event_package_ids: selectedPackages,
        locale,
        source: `event-offering-${audience}`,
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        booking_date: dateFrom,
        booking_end_date: dateTo || dateFrom,
        adults: guests,
        children: 0,
        total_amount: String(total.toFixed(2)),
        payment_method: paymentMethod,
        location: venue || undefined,
        message: [
          `${ar ? "الفعالية" : "Event"}: ${offering.title}`,
          `${ar ? "يوم الفعالية" : "Event day"}: ${dateFrom}${dateTo && dateTo !== dateFrom ? ` → ${dateTo}` : ""}`,
          `${ar ? "الضيوف" : "Guests"}: ${guests}`,
          selectedPackages.length
            ? `${ar ? "باقات" : "Packages"}: ${selectedPackages.join(",")}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      });

      if (result.sessionId && result.confirmationCode) {
        const charged = parsePriceAmount(result.totalAmount ?? "");
        setGeideaSession({
          sessionId: result.sessionId,
          confirmationCode: result.confirmationCode,
          checkoutUrl: result.checkoutUrl,
          amountLabel: charged > 0 ? formatMoney(charged, locale) : totalLabel,
        });
        return;
      }
      if (result.requiresRedirect && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setConfirmationCode(result.confirmationCode ?? `EV${result.id}`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر الحجز." : "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={cn(siteContainer, pageBottom, "py-16 text-center")}>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          {ar ? "تم تأكيد الحجز" : "Booking confirmed"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {ar ? "شكراً لك" : "Thank you"}
        </h1>
        <p className="mt-4 text-slate-300">
          {ar ? "رمز التأكيد" : "Confirmation code"}:{" "}
          <span className="font-semibold text-white">{confirmationCode}</span>
        </p>
        <Link
          href={localizedPath(locale, basePath)}
          className="mt-8 inline-flex rounded-full bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {ar ? "العودة للقائمة" : "Back to catalog"}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(siteContainer, pageBottom, "relative py-8 sm:py-10 lg:py-12")}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_-20%,rgba(16,185,129,0.16),transparent)]"
        aria-hidden
      />

      <nav className="relative mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={localizedPath(locale, basePath)} className="hover:text-white">
          {audience === "corporate"
            ? ar
              ? "فعاليات الشركات"
              : "Corporate events"
            : ar
              ? "فعاليات الأفراد"
              : "Individual events"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-300">{offering.title}</span>
      </nav>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:items-start xl:gap-10">
        <div className="min-w-0 space-y-6">
          <div id="event-hero" className="relative scroll-mt-24 space-y-4">
            <AccordionImageGallery
              images={galleryImages}
              locale={locale}
              title={offering.title}
              eyebrow={`${ar ? "المنظّم" : "Organizer"}: ${organizer}`}
              subtitle={[
                locationLabel,
                offering.basePrice ? formatSarPrice(offering.basePrice, locale) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
              activeIndex={activeImage}
              onActiveChange={setActiveImage}
              variant="dark"
              showCaption={false}
              autoplay={galleryImages.length > 1}
            />
          </div>

          <header className="space-y-2">
            <h1 className="text-[clamp(1.35rem,5.2vw,2.125rem)] font-bold leading-tight tracking-tight text-white text-balance">
              {offering.title}
            </h1>
            <p className="text-sm text-slate-400">
              {ar ? "المنظّم" : "Organizer"}:{" "}
              <span className="text-slate-200">{organizer}</span>
              <span className="mx-1.5 text-slate-600" aria-hidden>
                ·
              </span>
              <span className="text-emerald-300">{categoryLabel}</span>
            </p>
          </header>

          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-2.5">
            {locationLabel ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-3 min-[400px]:col-span-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-lg" aria-hidden>
                  📍
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/70">
                    {ar ? "الموقع" : "Location"}
                  </p>
                  <p className="truncate text-sm font-medium text-white" title={locationLabel}>
                    {locationLabel}
                  </p>
                  {customerChoosesVenue ? (
                    <p className="mt-0.5 text-xs text-rose-100/70">
                      {ar
                        ? "اكتب عنوانك أو مكانك عند الحجز."
                        : "Enter your venue address when booking."}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {offering.duration ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg" aria-hidden>
                  ⏱
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {ar ? "المدة" : "Duration"}
                  </p>
                  <p className="text-sm font-medium text-slate-200">{offering.duration}</p>
                </div>
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-lg" aria-hidden>
                ✦
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
                  {ar ? "التصنيف" : "Category"}
                </p>
                <p className="text-sm font-medium text-violet-100">{categoryLabel}</p>
              </div>
            </div>
            {offering.capacity ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-lg" aria-hidden>
                  👥
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">
                    {ar ? "السعة" : "Capacity"}
                  </p>
                  <p className="text-sm font-medium text-amber-50">
                    {ar ? `حتى ${offering.capacity} ضيف` : `Up to ${offering.capacity} guests`}
                  </p>
                </div>
              </div>
            ) : null}
            {hasCoords ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-lg" aria-hidden>
                  🗺
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                    {ar ? "الخريطة" : "Map"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("location");
                      window.requestAnimationFrame(() => {
                        document
                          .getElementById("event-tabs")
                          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      });
                    }}
                    className="text-start text-sm font-medium text-emerald-100 underline-offset-2 hover:underline"
                  >
                    {ar ? "عرض على الخريطة" : "View on map"}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-3 min-[400px]:col-span-2 sm:col-span-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-xs font-bold text-cyan-100" aria-hidden>
                {ar ? "ر.س" : "SAR"}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80">
                  {ar ? "السعر الأساسي" : "Base price"}
                </p>
                <p className="text-sm font-semibold text-white">
                  {formatMoney(offering.basePriceAmount || 0, locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-500/20"
            >
              <span aria-hidden>💬</span>
              {ar ? "واتساب الإدارة" : "WhatsApp management"}
            </a>
            {phoneHref ? (
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/30"
              >
                <span aria-hidden>📞</span>
                {ar ? "اتصال" : "Call"}
              </a>
            ) : null}
            {mailHref ? (
              <a
                href={mailHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/30"
              >
                <span aria-hidden>✉️</span>
                {ar ? "بريد" : "Email"}
              </a>
            ) : null}
            <Link
              href={localizedPath(locale, "/contact")}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/45"
            >
              {ar ? "نموذج التواصل" : "Contact form"}
            </Link>
          </div>

          <a
            href="#book"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-l from-cyan-600/90 to-violet-600/90 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/40 transition hover:brightness-110 lg:hidden"
          >
            {ar ? "احجز الآن" : "Book now"}
            <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold">
              {totalLabel}
            </span>
          </a>

          <div
            id="event-tabs"
            className="event-tabs-panel scroll-mt-24 rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6"
          >
            <div className={cn(scrollRow, "border-b border-white/10 pb-px")}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "shrink-0 border-b-2 border-cyan-400 px-3 py-2.5 text-sm font-semibold text-cyan-100 sm:px-4"
                      : "shrink-0 px-3 py-2.5 text-sm text-slate-500 transition hover:text-slate-300 sm:px-4"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              {tab === "description" ? (
                <div className="space-y-6">
                  {highlights.length > 0 ? (
                    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
                      <h3 className="mb-3 text-sm font-bold text-emerald-100">
                        {ar ? "أبرز ما تشمله الفعالية" : "Highlights"}
                      </h3>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {highlights.map((item) => (
                          <li
                            key={item.title}
                            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-3"
                          >
                            <p className="font-semibold text-white">{item.title}</p>
                            {item.description ? (
                              <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {offering.description?.trim() ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {ar ? "عن الفعالية" : "About this event"}
                      </h3>
                      <p className="whitespace-pre-line">{offering.description}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      {ar ? "لا يوجد وصف بعد." : "No description yet."}
                    </p>
                  )}
                  {whatsIncluded ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {ar ? "ما يتوفر / يشمله السعر" : "What's included"}
                      </h3>
                      <p className="whitespace-pre-line text-slate-400">{whatsIncluded}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "portfolio" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.map((project) => (
                    <article
                      key={`${project.title}-${project.year ?? ""}`}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                      <div className="relative min-h-[160px] bg-white/5">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width:768px) 100vw, 40vw"
                          />
                        ) : null}
                      </div>
                      <div className="space-y-1 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">{project.title}</h3>
                          {project.year ? (
                            <span className="text-xs text-emerald-300">{project.year}</span>
                          ) : null}
                        </div>
                        {project.description ? (
                          <p className="text-sm text-slate-400">{project.description}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {tab === "terms" ? <p className="whitespace-pre-line">{terms}</p> : null}

              {tab === "organizer" ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-white">{organizer}</p>
                  <p className="whitespace-pre-line text-slate-400">
                    {offering.organizerBio?.trim() ||
                      (ar
                        ? "فريق إكزورا يتولى التخطيط والتنفيذ حتى يوم الفعالية."
                        : "The Xora team handles planning through event day.")}
                  </p>
                </div>
              ) : null}

              {tab === "faq" ? (
                <div className="space-y-4">
                  {faqItems.map((item, i) => (
                    <details
                      key={`faq-${i}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <summary className="cursor-pointer font-semibold text-white marker:content-none">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-slate-400">{item.answer}</p>
                    </details>
                  ))}
                </div>
              ) : null}

              {tab === "location" ? (
                <div className="space-y-4">
                  {customerChoosesVenue ? (
                    <p className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-50">
                      {ar
                        ? "هذه الفعالية تُقام في مكانك — عند الحجز اكتب العنوان أو وصف الموقع (استراحة، حديقة منزل، قاعة…)."
                        : "This event happens at your venue — enter the address or a short description when booking."}
                    </p>
                  ) : null}
                  {locationLabel ? (
                    <p className="flex items-start gap-2 text-base text-white">
                      <span className="text-lg" aria-hidden>
                        📍
                      </span>
                      <span>{locationLabel}</span>
                    </p>
                  ) : null}
                  {!customerChoosesVenue ? (
                    <ActivityLocationMap
                      locale={locale}
                      latitude={hasCoords ? offering.latitude : null}
                      longitude={hasCoords ? offering.longitude : null}
                      locationText={offering.location ?? undefined}
                      title={offering.title}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside
          id="book"
          className="scroll-mt-24 space-y-4 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
            {ar
              ? "حدّد يوم إقامتك للفعالية من التقويم — أنت تختار الموعد المناسب."
              : "Pick your event day on the calendar — you choose when it happens."}
          </div>

          <div className="booking-panel rounded-[1.35rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-slate-400">{ar ? "ملخص الحجز" : "Booking summary"}</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalLabel}</p>
            <p className="mt-1 text-xs text-slate-500">
              {ar ? "أساسي" : "Base"} {formatMoney(offering.basePriceAmount || 0, locale)}
              {packagesTotal > 0
                ? ` + ${ar ? "باقات" : "packages"} ${formatMoney(packagesTotal, locale)}`
                : ""}
            </p>

            {offering.packages.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-200">
                  {ar ? "باقات إضافية" : "Optional packages"}
                </p>
                {offering.packages.map((pkg) => {
                  const checked = selectedPackages.includes(pkg.id);
                  return (
                    <div
                      key={pkg.id}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-xl border px-2.5 py-2.5 transition",
                        checked
                          ? "border-emerald-400/50 bg-emerald-500/10"
                          : "border-white/10",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => togglePackage(pkg.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-0.5 py-0.5 text-start hover:opacity-95"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                            checked
                              ? "border-emerald-400 bg-emerald-400 text-slate-950"
                              : "border-white/30",
                          )}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-white">{pkg.title}</span>
                            {pkg.badge ? (
                              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                                {pkg.badge}
                              </span>
                            ) : null}
                          </span>
                          {pkg.description ? (
                            <span className="mt-0.5 block text-xs text-slate-400 line-clamp-2">
                              {pkg.description}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-emerald-200">
                          +{formatMoney(pkg.priceAmount || 0, locale)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsPackage(pkg)}
                        title={ar ? "عرض التفاصيل" : "View details"}
                        aria-label={ar ? `تفاصيل ${pkg.title}` : `Details for ${pkg.title}`}
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200 transition hover:border-cyan-300/55 hover:bg-cyan-500/20 hover:text-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 10v6" strokeLinecap="round" />
                          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-200">
                  {ar ? "① اختر يوم الفعالية" : "① Choose event day"}
                </p>
                <EventBookingCalendar
                  locale={locale}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onChange={({ dateFrom: from, dateTo: to }) => {
                    setDateFrom(from);
                    setDateTo(to);
                  }}
                  availability={offering.availability}
                  daysAhead={offering.bookingDaysAhead ?? offering.availability?.bookingDaysAhead ?? 180}
                />
              </div>

              <label className="block text-sm text-slate-300">
                {ar ? "عدد الضيوف" : "Guests"}
                <input
                  type="number"
                  min={1}
                  max={offering.capacity || 5000}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>

              {customerChoosesVenue ? (
                <label className="block text-sm text-slate-300">
                  {ar ? "أين تريد إقامة الفعالية؟" : "Where should the event take place?"}
                  <textarea
                    required
                    rows={3}
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    placeholder={
                      ar
                        ? "مثال: استراحة العائلة — حي الياسمين، الرياض"
                        : "e.g. Family farm — Al Yasmin, Riyadh"
                    }
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-slate-500"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    {ar
                      ? "اكتب العنوان أو وصفاً واضحاً لمكانك — سنؤكد التفاصيل معك."
                      : "Share a clear address or venue description — we’ll confirm details with you."}
                  </span>
                </label>
              ) : null}

              <label className="block text-sm text-slate-300">
                {ar ? "الاسم الكامل" : "Full name"}
                <input
                  name="name"
                  required
                  defaultValue={profile.name}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                {ar ? "البريد" : "Email"}
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={profile.email}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                {ar ? "الجوال" : "Phone"}
                <input
                  name="phone"
                  defaultValue={profile.phone}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>

              {paymentConfig?.methods?.length ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">{ar ? "طريقة الدفع" : "Payment method"}</p>
                  <div className="space-y-2">
                    {paymentConfig.methods.map((method: PaymentMethodOption) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm",
                          paymentMethod === method.id
                            ? "border-emerald-400/50 bg-emerald-500/10 text-white"
                            : "border-white/10 text-slate-300",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {method.gateway === "geidea" ? (
                            <GeideaWordmark />
                          ) : (
                            <PaymentBrandMark id={method.id} />
                          )}
                          {method.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(99,102,241,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading
                  ? ar
                    ? "جاري المعالجة…"
                    : "Processing…"
                  : ar
                    ? `ادفع ${totalLabel}`
                    : `Pay ${totalLabel}`}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm font-semibold text-white">
              {ar ? "تحتاج استشارة قبل الحجز؟" : "Need advice before booking?"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {ar
                ? "تواصل مباشرة مع الإدارة لتخصيص الفعالية."
                : "Contact management directly to customize the event."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
              >
                WhatsApp
              </a>
              {phoneHref ? (
                <a href={phoneHref} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  {ar ? "اتصال" : "Call"}
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {geideaSession ? (
        <GeideaPaymentModal
          session={geideaSession}
          locale={locale}
          scriptUrl={paymentConfig?.hppScriptUrl}
          onClose={() => {
            setGeideaSession(null);
            setError(
              ar
                ? "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى."
                : "Payment cancelled. You can try again.",
            );
          }}
          onError={(message) => {
            setGeideaSession(null);
            setError(message);
          }}
        />
      ) : null}

      <PackageDetailsModal
        locale={locale}
        pkg={detailsPackage}
        selected={detailsPackage ? selectedPackages.includes(detailsPackage.id) : false}
        onClose={() => setDetailsPackage(null)}
        onToggleSelect={() => {
          if (detailsPackage) togglePackage(detailsPackage.id);
        }}
      />
    </div>
  );
}
