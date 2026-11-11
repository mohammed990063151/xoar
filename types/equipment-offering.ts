export type EquipmentAudience = "individual" | "corporate" | "both" | "all";

export type EquipmentCategory =
  | "sound"
  | "lighting"
  | "screens"
  | "staging"
  | "bundle"
  | "other";

export type EquipmentDayStatus = "available" | "blocked" | "full" | "past";

export interface EquipmentDayAvailability {
  status: EquipmentDayStatus;
  bookings: number;
  remaining: number;
}

export interface EquipmentOfferingAvailability {
  maxBookingsPerDay: number;
  bookingDaysAhead: number;
  blockedDates: string[];
  bookableDates: string[];
  dayStatuses: Record<string, EquipmentDayAvailability>;
}

export interface EquipmentPackageWork {
  title: string;
  description?: string | null;
  image?: string | null;
}

export interface EquipmentPackage {
  id: number;
  title: string;
  description?: string | null;
  details?: string | null;
  features?: string[];
  works?: EquipmentPackageWork[];
  image?: string | null;
  price?: string | null;
  comparePrice?: string | null;
  priceAmount: number;
  badge?: string | null;
  sortOrder?: number;
}

export interface EquipmentCustomizationChoice {
  value: string;
  label: string;
}

export interface EquipmentCustomizationOption {
  key: string;
  label: string;
  required?: boolean;
  choices: EquipmentCustomizationChoice[];
}

export interface EquipmentHighlight {
  title: string;
  description?: string | null;
}

export interface EquipmentFaq {
  question: string;
  answer: string;
}

export interface EquipmentOffering {
  id: number;
  slug: string;
  locale: string;
  audience: EquipmentAudience;
  category: EquipmentCategory;
  title: string;
  shortLabel?: string | null;
  description?: string | null;
  image?: string | null;
  gallery?: string[];
  location?: string | null;
  city?: string | null;
  duration?: string | null;
  capacity?: number | null;
  minQuantity?: number;
  quantityStep?: number;
  customizationOptions?: EquipmentCustomizationOption[];
  specs?: string | null;
  organizerName?: string | null;
  organizerBio?: string | null;
  whatsIncluded?: string | null;
  termsConditions?: string | null;
  highlights?: EquipmentHighlight[];
  faq?: EquipmentFaq[];
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  basePrice?: string | null;
  comparePrice?: string | null;
  basePriceAmount: number;
  maxBookingsPerDay?: number;
  bookingDaysAhead?: number;
  blockedDates?: string[];
  availability?: EquipmentOfferingAvailability;
  packages: EquipmentPackage[];
}

export interface EquipmentQuote {
  ok: boolean;
  base: number;
  packages: number;
  total: number;
  packageIds: number[];
  message?: string;
}
