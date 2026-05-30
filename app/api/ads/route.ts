import { NextResponse } from "next/server";

import { createAdvertisement, fetchAdvertisements } from "@/lib/ads-data";
import { AD_CATEGORIES, OFFER_INTENTS, type NewAdvertisementInput } from "@/lib/types";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validatePayload(payload: Partial<NewAdvertisementInput>): string | null {
  const requiredTextFields: Array<keyof NewAdvertisementInput> = [
    "title",
    "description",
    "businessName",
    "city",
    "state",
    "pincode",
    "contactPhone",
    "validUntil",
  ];

  for (const field of requiredTextFields) {
    const value = payload[field];
    if (!value || typeof value !== "string" || value.trim().length < 2) {
      return `Invalid or missing field: ${field}`;
    }
  }

  if (!payload.category || !AD_CATEGORIES.includes(payload.category)) {
    return "Invalid category.";
  }

  if (!payload.intent || !OFFER_INTENTS.includes(payload.intent)) {
    return "Invalid advertisement intent.";
  }

  if (payload.websiteUrl && !payload.websiteUrl.startsWith("http")) {
    return "Website URL must start with http or https.";
  }

  const validDate = new Date(payload.validUntil ?? "");
  if (Number.isNaN(validDate.getTime())) {
    return "validUntil must be a valid date.";
  }

  return null;
}

export async function GET() {
  const data = await fetchAdvertisements();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<NewAdvertisementInput>;
  const validationError = validatePayload(payload);

  if (validationError) {
    return badRequest(validationError);
  }

  try {
    const created = await createAdvertisement(payload as NewAdvertisementInput);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create ad.", error);
    return NextResponse.json(
      { error: "Unable to publish advertisement right now." },
      { status: 500 },
    );
  }
}

