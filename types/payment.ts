export interface PaymentMethodOption {
  id: string;
  label: string;
  gateway: string;
  brands?: string[];
}

export interface PaymentConfig {
  driver: string;
  currency: string;
  liveMode: boolean;
  configured?: boolean;
  requiresRedirect: boolean;
  methods: PaymentMethodOption[];
  hppScriptUrl?: string | null;
  publishableKey?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

export interface BookingCheckoutResult {
  id: number;
  confirmationCode?: string;
  bookingDate?: string;
  bookingEndDate?: string;
  bookingTime?: string | null;
  adults?: number;
  children?: number;
  isGift?: boolean;
  giftRecipientName?: string | null;
  activity?: { title?: string; slug?: string; image?: string | null } | null;
  totalAmount?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentMethodLabel?: string;
  paymentGateway?: string;
  paymentGatewayLabel?: string;
  requiresRedirect?: boolean;
  checkoutUrl?: string | null;
  sessionId?: string | null;
  pdfUrl?: string | null;
  liveMode?: boolean;
  isGroup?: boolean;
  groupInviteCode?: string | null;
  inviteUrl?: string | null;
  whatsappUrl?: string | null;
}
