import type { Locale } from "@/lib/i18n";

export function bookingLabels(locale: Locale) {
  const ar = locale === "ar";

  return {
    steps: ar
      ? ["اكتشاف", "التفاصيل", "التاريخ", "الدفع", "التأكيد"]
      : ["Discover", "Details", "Date", "Payment", "Confirm"],
    viewDetails: ar ? "عرض التفاصيل" : "View details",
    bookNow: ar ? "احجز الآن" : "Book now",
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
