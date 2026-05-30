export const AD_CATEGORIES = [
  "Jobs",
  "Food",
  "Shopping",
  "Jewellery",
  "Electronics",
  "Health",
  "Education",
  "Services",
] as const;

export type AdCategory = (typeof AD_CATEGORIES)[number];

export const OFFER_INTENTS = ["Job", "Discount", "Brand"] as const;

export type OfferIntent = (typeof OFFER_INTENTS)[number];

export type AdStatus = "active" | "paused" | "expired";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  businessName: string;
  category: AdCategory;
  intent: OfferIntent;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  websiteUrl: string;
  imageUrl: string;
  validUntil: string;
  isFeatured: boolean;
  tags: string[];
  status: AdStatus;
  createdAt: string;
}

export interface NewAdvertisementInput {
  title: string;
  description: string;
  businessName: string;
  category: AdCategory;
  intent: OfferIntent;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  websiteUrl?: string;
  imageUrl?: string;
  validUntil: string;
  isFeatured?: boolean;
  tags?: string[];
}

