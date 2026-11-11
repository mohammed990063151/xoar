export type EventOfferingAudience = "individual" | "corporate";

export interface EventOfferingPackageWork {
  title: string;
  description?: string | null;
  image?: string | null;
}

export interface EventOfferingPackage {
  id: number;
  title: string;
  description?: string | null;
  /** Longer content shown in the package details modal */
  details?: string | null;
  features?: string[];
  works?: EventOfferingPackageWork[];
  image?: string | null;
  badge?: string | null;
  sortOrder?: number;
}

export interface EventOfferingHighlight {
  title: string;
  description?: string | null;
}

export interface EventOfferingFaq {
  question: string;
  answer: string;
}

export interface EventOfferingPortfolioProject {
  title: string;
  description?: string | null;
  year?: string | null;
  image?: string | null;
}

export interface EventOffering {
  id: number;
  slug: string;
  locale: string;
  audience: EventOfferingAudience;
  title: string;
  shortLabel?: string | null;
  description?: string | null;
  image?: string | null;
  gallery?: string[];
  location?: string | null;
  /** fixed = admin venue; customer_choice = customer provides venue */
  locationMode?: "fixed" | "customer_choice";
  city?: string | null;
  duration?: string | null;
  capacity?: number | null;
  organizerName?: string | null;
  organizerBio?: string | null;
  whatsIncluded?: string | null;
  termsConditions?: string | null;
  highlights?: EventOfferingHighlight[];
  faq?: EventOfferingFaq[];
  portfolioProjects?: EventOfferingPortfolioProject[];
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactEmail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  packages: EventOfferingPackage[];
}
