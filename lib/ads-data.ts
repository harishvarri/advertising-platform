import { createClient } from "@supabase/supabase-js";

import { getCityProfile } from "@/lib/india-cities";
import { SAMPLE_ADVERTISEMENTS } from "@/lib/sample-ads";
import type { Advertisement, NewAdvertisementInput } from "@/lib/types";

type AdvertisementRow = {
  id: string;
  title: string;
  description: string;
  business_name: string;
  category: Advertisement["category"];
  intent: Advertisement["intent"];
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  website_url: string | null;
  image_url: string | null;
  valid_until: string;
  is_featured: boolean;
  tags: string[] | null;
  status: Advertisement["status"];
  created_at: string;
};

const defaultImageUrl =
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalizeRow(row: AdvertisementRow): Advertisement {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    businessName: row.business_name,
    category: row.category,
    intent: row.intent,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    latitude: row.latitude,
    longitude: row.longitude,
    contactPhone: row.contact_phone,
    websiteUrl: row.website_url ?? "",
    imageUrl: row.image_url ?? defaultImageUrl,
    validUntil: row.valid_until,
    isFeatured: row.is_featured,
    tags: row.tags ?? [],
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  if (!hasSupabaseEnv()) {
    return SAMPLE_ADVERTISEMENTS;
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    return SAMPLE_ADVERTISEMENTS;
  }

  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    console.error("Failed to fetch advertisements from Supabase.", error);
    return SAMPLE_ADVERTISEMENTS;
  }

  const normalized = (data ?? []).map((row) => normalizeRow(row as AdvertisementRow));
  return normalized.length > 0 ? normalized : SAMPLE_ADVERTISEMENTS;
}

export async function createAdvertisement(
  input: NewAdvertisementInput,
): Promise<Advertisement> {
  const cityProfile = getCityProfile(input.city);

  const payload = {
    title: input.title,
    description: input.description,
    business_name: input.businessName,
    category: input.category,
    intent: input.intent,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    latitude: cityProfile?.latitude ?? 17.385,
    longitude: cityProfile?.longitude ?? 78.4867,
    contact_phone: input.contactPhone,
    website_url: input.websiteUrl?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    valid_until: input.validUntil,
    is_featured: Boolean(input.isFeatured),
    tags: input.tags?.length ? input.tags : [],
    status: "active" as const,
  };

  if (!hasSupabaseEnv()) {
    return {
      id: `local-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      businessName: payload.business_name,
      category: payload.category,
      intent: payload.intent,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      latitude: payload.latitude,
      longitude: payload.longitude,
      contactPhone: payload.contact_phone,
      websiteUrl: payload.website_url ?? "",
      imageUrl: payload.image_url ?? defaultImageUrl,
      validUntil: payload.valid_until,
      isFeatured: payload.is_featured,
      tags: payload.tags,
      status: payload.status,
      createdAt: new Date().toISOString(),
    };
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const { data, error } = await supabase
    .from("advertisements")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRow(data as AdvertisementRow);
}

