export type ActivityStatus = "draft" | "pending" | "approved" | "rejected";

export type ActivityWeekdayPrices = Record<
  string | number,
  { adult?: string; child?: string; adult_price?: string; child_price?: string }
>;

export interface ActivityBookingSlot {
  time: string;
  capacity?: number | null;
  seatsLeft?: number | null;
  available?: boolean;
  adultPrice?: string;
  childPrice?: string;
  adultPriceAmount?: number;
  childPriceAmount?: number;
}

export interface ActivitySchedulePayload {
  scheduleMode?: "explicit" | "generated";
  schedule_mode?: "explicit" | "generated";
  durationMinutes?: number | null;
  duration_minutes?: number | null;
  bufferMinutes?: number | null;
  buffer_minutes?: number | null;
  dayWindowStart?: string | null;
  day_window_start?: string | null;
  dayWindowEnd?: string | null;
  day_window_end?: string | null;
  slotCapacity?: number | null;
  slot_capacity?: number | null;
  availabilityStartsOn?: string | null;
  availability_starts_on?: string | null;
  availabilityEndsOn?: string | null;
  availability_ends_on?: string | null;
  adultPrice?: string | null;
  adult_price?: string | null;
  childPrice?: string | null;
  child_price?: string | null;
  weekdayPrices?: ActivityWeekdayPrices;
  weekday_prices?: ActivityWeekdayPrices;
  generatedTimes?: string[];
  recurringWeekdays?: number[];
  slotsPreview?: { date?: string | null; slots?: ActivityBookingSlot[] };
}

export interface TicketHighlight {
  icon?: string;
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Activity {
  id: number;
  slug: string;
  title: string;
  description: string;
  short_label?: string;
  badge?: string;
  badgeLabel?: string;
  city?: string;
  location?: string;
  promo_video_url?: string;
  promoVideoUrl?: string;
  promo_video_mobile_url?: string;
  promoVideoMobileUrl?: string;
  ticket_highlights?: TicketHighlight[];
  ticketHighlights?: TicketHighlight[];
  terms_conditions?: string;
  termsConditions?: string;
  organizer_bio?: string;
  organizerBio?: string;
  faq?: FaqItem[];
  available_times?: string[];
  availableTimes?: string[];
  /** 0=Sunday … 6=Saturday — weekly recurring booking days */
  recurring_weekdays?: number[];
  recurringWeekdays?: number[];
  latitude?: number | null;
  longitude?: number | null;
  price?: string;
  displayPrice?: string;
  originalPrice?: string;
  original_price?: string;
  compare_price?: string;
  comparePrice?: string;
  event_date?: string;
  eventDate?: string;
  organizer?: string;
  whats_included?: string;
  policies?: string;
  difficulty?: string;
  duration?: string;
  group_size?: string;
  status: ActivityStatus;
  rejection_reason?: string;
  image_url?: string;
  gallery_urls?: string[];
  gallery?: string[];
  rating?: number;
  reviews_count?: number;
  reviewsCount?: number;
  capacity?: number;
  endsAt?: string;
  isFull?: boolean;
  schedule_mode?: "explicit" | "generated";
  scheduleMode?: "explicit" | "generated";
  duration_minutes?: number | null;
  durationMinutes?: number | null;
  buffer_minutes?: number | null;
  bufferMinutes?: number | null;
  day_window_start?: string | null;
  dayWindowStart?: string | null;
  day_window_end?: string | null;
  dayWindowEnd?: string | null;
  slot_capacity?: number | null;
  slotCapacity?: number | null;
  availability_starts_on?: string | null;
  availabilityStartsOn?: string | null;
  availability_ends_on?: string | null;
  availabilityEndsOn?: string | null;
  adult_price?: string | null;
  adultPrice?: string | null;
  child_price?: string | null;
  childPrice?: string | null;
  weekday_prices?: ActivityWeekdayPrices;
  weekdayPrices?: ActivityWeekdayPrices;
  schedule?: ActivitySchedulePayload;
  socialProof?: {
    totalBookings?: number;
    bookingsLast24h?: number;
    seatsLeft?: number | null;
    messageAr?: string;
    messageEn?: string;
  };
  socialProofCard?: {
    show?: boolean;
    offerPeriod?: string | null;
    viewsCount?: number;
    rating?: number;
    reviewsCount?: number;
    monthlyBookings?: number;
    seatsLeft?: number | null;
    wishlistEnabled?: boolean;
    urgency?: { show?: boolean; message?: string } | null;
    highlight?: {
      label: string;
      hint?: string | null;
      variant?: string;
    } | null;
  };
  cardHighlight?: {
    label: string;
    hint?: string | null;
    variant?: string;
  } | null;
  activeCoupon?: {
    code?: string;
    label?: string | null;
    badge?: string;
    discountType?: string;
    discountValue?: number;
  } | null;
  countdown?: {
    show?: boolean;
    endsAt?: string | null;
    leadHours?: number;
  } | null;
  offerPeriod?: string | null;
  offerPeriodActive?: boolean;
  showWishlist?: boolean;
  provider_id?: number;
  provider?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  whatsapp?: string;
  email?: string;
  phone?: string;
  address?: string;
  social?: Record<string, string>;
}

export interface InquiryPayload {
  type: "booking" | "contact" | "service";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  activity_id?: number;
  booking_date?: string;
  booking_end_date?: string;
  booking_time?: string;
  is_gift?: boolean;
  gift_recipient_name?: string;
  gift_recipient_phone?: string;
  gift_recipient_email?: string;
  gift_message?: string;
  is_group?: boolean;
  group_members?: Array<{ name: string; phone: string }>;
  adults?: number;
  children?: number;
  total_amount?: string;
  coupon_code?: string;
  payment_method?: string;
  locale?: string;
  source?: string;
}

export interface BookingConfirmation {
  id: number;
  confirmationCode?: string;
  bookingDate?: string;
  totalAmount?: string;
  pdfUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
