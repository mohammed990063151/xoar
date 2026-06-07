export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  locale: string;
  membershipTier: string;
  bookingsCount: number;
  activityPreferences: string[];
}

export interface CustomerAuthResponse {
  customer: Customer;
  token: string;
}

export interface CustomerBooking {
  id: number;
  confirmationCode?: string;
  bookingDate?: string;
  bookingTime?: string;
  totalAmount?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  adults?: number;
  children?: number;
  isGift?: boolean;
  status?: string;
  pdfUrl?: string;
  activity?: {
    id: number;
    slug: string;
    title: string;
    image?: string;
    location?: string;
  };
  createdAt?: string;
}
