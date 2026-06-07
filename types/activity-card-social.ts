export type ActivityCardSocialProofData = {
  show?: boolean;
  offerPeriod?: string | null;
  viewsCount?: number;
  rating?: number;
  reviewsCount?: number;
  monthlyBookings?: number;
  urgency?: { show?: boolean; message?: string } | null;
};
