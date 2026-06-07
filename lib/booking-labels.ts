import type { Locale } from "@/lib/i18n";

/** رسالة واحدة في قسم الإهداء بعد التأكيد — بدون تكرار */
export function giftConfirmedMessage(locale: Locale, recipientName: string): string {
  const ar = locale === "ar";
  return ar
    ? `تم إهداء هذا الحجز إلى ${recipientName}. ثم أكمل التاريخ والدفع.`
    : `This booking is gifted to ${recipientName}. Then complete the date and payment.`;
}

export function bookingLabels(locale: Locale) {
  const ar = locale === "ar";

  return {
    steps: ar
      ? ["اكتشاف", "التفاصيل", "التاريخ", "الدفع", "التأكيد"]
      : ["Discover", "Details", "Date", "Payment", "Confirm"],
    viewDetails: ar ? "عرض التفاصيل" : "View details",
    bookNow: ar ? "احجز الآن" : "Book now",
    terms: ar ? "الشروط والأحكام" : "Terms & conditions",
    organizerTab: ar ? "المنظم" : "Organizer",
    faq: ar ? "الأسئلة الشائعة" : "FAQ",
    selectTime: ar ? "اختر الوقت" : "Select time",
    giftBooking: ar ? "إهداء الحجز" : "Gift this booking",
    giftBookingType: ar ? "نوع الحجز" : "Booking type",
    giftModeSelf: ar ? "حجز لنفسي" : "Book for myself",
    giftModeSelfHint: ar ? "بدون إهداء" : "Standard booking",
    giftModeGift: ar ? "إهداء النشاط" : "Gift this activity",
    giftModeGiftHint: ar ? "لشخص آخر" : "For someone else",
    giftModalTitle: ar ? "بيانات المهدى إليه" : "Recipient details",
    giftModalHint: ar
      ? "أدخل بيانات الشخص الذي تهديه — لن تُكرَّر هذه الخطوة بعد التأكيد."
      : "Enter the recipient details — you will not repeat this step after confirming.",
    giftRecipientName: ar ? "اسم المهدى إليه" : "Recipient name",
    giftRecipientPhone: ar ? "جوال المهدى إليه" : "Recipient phone",
    giftRecipientEmail: ar ? "بريد المهدى إليه (اختياري)" : "Recipient email (optional)",
    giftMessage: ar ? "رسالة شخصية" : "Personal message",
    giftSave: ar ? "تأكيد الإهداء والمتابعة" : "Confirm gift & continue",
    giftConfirmedBanner: ar
      ? "تم إهداء هذا الحجز إلى"
      : "This booking is gifted to",
    giftThenContinue: ar
      ? "أكمل الآن اختيار التاريخ والدفع لإتمام الحجز"
      : "Now choose the date and complete payment to finish booking",
    giftStepTitle: ar ? "إهداء الحجز" : "Gift this booking",
    giftCancel: ar ? "إلغاء" : "Cancel",
    giftEdit: ar ? "تعديل" : "Edit",
    giftSummary: ar ? "إهداء إلى" : "Gift for",
    giftCompleteHint: ar ? "أكمل بيانات المهدى إليه للمتابعة" : "Complete recipient details to continue",
    giftRequiredOnSubmit: ar
      ? "يرجى إدخال بيانات المهدى إليه قبل إتمام الحجز"
      : "Please add recipient details before completing booking",
    ticketIncludes: ar ? "ما تشمله التذكرة" : "Ticket includes",
    promoVideo: ar ? "فيديو تعريفي" : "Promo video",
    filterCity: ar ? "المدينة" : "City",
    filterDate: ar ? "التاريخ" : "Date",
    addWishlist: ar ? "أضف للمفضلة" : "Add to wishlist",
    perPerson: ar ? "للشخص" : "per person",
    description: ar ? "الوصف" : "Description",
    gallery: ar ? "معرض الصور" : "Photo gallery",
    included: ar ? "ما يشمله" : "What's included",
    policies: ar ? "السياسات" : "Policies",
    recommended: ar ? "قد يعجبك أيضاً" : "Recommended for you",
    selectDate: ar ? "اختر التاريخ والمشاركين" : "Select date & guests",
    adults: ar ? "بالغون" : "Adults",
    children: ar ? "أطفال" : "Children",
    total: ar ? "الإجمالي" : "Total",
    continuePayment: ar ? "متابعة للدفع" : "Continue to payment",
    checkout: ar ? "الدفع والحجز" : "Checkout",
    securePayment: ar ? "بوابة دفع آمنة" : "Secure payment gateway",
    proceed: ar ? "إتمام الحجز" : "Proceed to booking",
    card: ar ? "بطاقة" : "Card",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    successTitle: ar ? "تم الحجز بنجاح!" : "Booking success!",
    successSubtitle: ar
      ? "تم إرسال رمز التأكيد والإيصال إلى بريدك الإلكتروني."
      : "Confirmation code and receipt sent to your email.",
    successGiftSubtitle: ar
      ? "تم تسجيل الإهداء — يتضمن PDF بيانات المهدى إليه. وصل إشعار للإدارة ولحسابك إن كنت مسجّلاً."
      : "Gift registered — PDF includes recipient details. Admin and your account were notified if logged in.",
    proceedGift: ar ? "إتمام حجز الإهداء" : "Complete gift booking",
    giftIncludedInPdf: ar
      ? "سيظهر في PDF: اسم المهدى، الجوال، والرسالة"
      : "PDF will show recipient name, phone, and message",
    ticket: ar ? "تذكرة" : "Ticket",
    confirmed: ar ? "مؤكد" : "Confirmed",
    backActivities: ar ? "العودة للأنشطة" : "Back to activities",
    location: ar ? "الموقع" : "Location",
    duration: ar ? "المدة" : "Duration",
    difficulty: ar ? "المستوى" : "Difficulty",
    groupSize: ar ? "حجم المجموعة" : "Group size",
    organizer: ar ? "المنظّم" : "Organizer",
    search: ar ? "ابحث عن نشاط..." : "Search activities...",
    filterLocation: ar ? "الموقع" : "Location",
    filterCategory: ar ? "الفئة" : "Category",
    all: ar ? "الكل" : "All",
    noResults: ar ? "لا توجد أنشطة مطابقة" : "No matching activities",
    loading: ar ? "جاري التحميل..." : "Loading...",
    downloadPdf: ar ? "تحميل تأكيد الحجز (PDF)" : "Download booking PDF",
  };
}
