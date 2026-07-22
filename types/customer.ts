export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  locale: string;
  membershipTier: string;
  bookingsCount: number;
  walletBalanceSar?: number;
  pointsBalance?: number;
  referralCode?: string;
  activityPreferences: string[];
  city?: string;
  partnerStatus?: string;
  partnerBusinessName?: string;
  isPartner?: boolean;
  isPartnerPending?: boolean;
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

export interface CustomerNotification {
  id: number;
  type: string;
  typeLabel: string;
  title: string;
  body?: string;
  actionUrl?: string;
  readAt?: string | null;
  createdAt?: string;
}

export interface PartnerApplyStatus {
  status: string;
  businessName?: string;
  activityType?: string;
  city?: string;
  phone?: string;
  message?: string;
  requestedAt?: string;
  rejectionReason?: string;
  isPartner: boolean;
  isPending: boolean;
  isRejected: boolean;
  portalUrl?: string | null;
}

export interface CustomerWallet {
  balanceSar: number;
  transactions: Array<{
    type: string;
    amount_sar: number;
    balance_after_sar: number;
    description?: string;
    created_at?: string;
  }>;
}

export interface CustomerGroupBooking {
  id: number;
  inviteCode: string;
  inviteUrl?: string;
  whatsappUrl?: string;
  role: "leader" | "member";
  maxMembers: number;
  confirmedCount: number;
  status: string;
  bookingDate?: string | null;
  bookingEndDate?: string | null;
  bookingTime?: string | null;
  totalAmountSar?: number | string | null;
  activity?: {
    id: number;
    title: string;
    slug: string;
    locale?: string;
  } | null;
}

export interface CustomerReferral {
  code: string;
  inviteUrl?: string;
  shareUrl?: string;
  registerUrl?: string;
  whatsappUrl?: string;
  shareMessage?: string;
  rewardSar?: number;
  invitedCount?: number;
}

export interface CustomerInquiry {
  id: number;
  type: string;
  status: string;
  message?: string;
  createdAt?: string;
}
