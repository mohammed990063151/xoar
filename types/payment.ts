export interface PaymentMethodOption {
  id: string;
  label: string;
  gateway: string;
}

export interface PaymentConfig {
  driver: string;
  currency: string;
  liveMode: boolean;
  requiresRedirect: boolean;
  methods: PaymentMethodOption[];
  publishableKey?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

export interface BookingCheckoutResult {
  id: number;
  confirmationCode?: string;
  bookingDate?: string;
  totalAmount?: string;
  paymentStatus?: string;
  paymentGateway?: string;
  requiresRedirect?: boolean;
  checkoutUrl?: string | null;
  pdfUrl?: string | null;
  liveMode?: boolean;
}
