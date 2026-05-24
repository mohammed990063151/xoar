export type ActivityStatus = "draft" | "pending" | "approved" | "rejected";

export interface Activity {
  id: number;
  slug: string;
  title: string;
  description: string;
  short_label?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  price?: string;
  event_date?: string;
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
  adults?: number;
  children?: number;
  total_amount?: string;
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
