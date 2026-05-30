"use client";

import { useState } from "react";

import { INDIA_CITY_PROFILES } from "@/lib/india-cities";
import { AD_CATEGORIES, OFFER_INTENTS, type Advertisement, type NewAdvertisementInput } from "@/lib/types";

type PostAdFormProps = {
  onPublished: (ad: Advertisement) => void;
};

const initialCity = INDIA_CITY_PROFILES[0];

export function PostAdForm({ onPublished }: PostAdFormProps) {
  const [form, setForm] = useState<NewAdvertisementInput>({
    title: "",
    description: "",
    businessName: "",
    category: AD_CATEGORIES[0],
    intent: OFFER_INTENTS[1],
    city: initialCity.city,
    state: initialCity.state,
    pincode: "",
    contactPhone: "",
    websiteUrl: "",
    imageUrl: "",
    validUntil: "",
    isFeatured: false,
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = <K extends keyof NewAdvertisementInput>(
    field: K,
    value: NewAdvertisementInput[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const tags = tagsInput
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);

    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      });

      const payload = (await response.json()) as { error?: string; data?: Advertisement };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Could not publish advertisement.");
      }

      onPublished(payload.data);
      setMessage("Advertisement published successfully.");
      setTagsInput("");
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        businessName: "",
        pincode: "",
        contactPhone: "",
        websiteUrl: "",
        imageUrl: "",
        validUntil: "",
        isFeatured: false,
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2>Publish Your Advertisement</h2>
      <p>Post your Indian business offer, job opening, or local promotion in minutes.</p>

      <label>
        Business Name
        <input
          required
          value={form.businessName}
          onChange={(event) => updateField("businessName", event.target.value)}
          placeholder="e.g., Royal Jewellery House"
        />
      </label>

      <label>
        Advertisement Title
        <input
          required
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="e.g., Diwali Gold Offer Up To 30%"
        />
      </label>

      <label>
        Description
        <textarea
          required
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Describe the offer, role, or business campaign"
          rows={4}
        />
      </label>

      <div className="form-grid-2">
        <label>
          Category
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value as NewAdvertisementInput["category"])}
          >
            {AD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ad Type
          <select
            value={form.intent}
            onChange={(event) => updateField("intent", event.target.value as NewAdvertisementInput["intent"])}
          >
            {OFFER_INTENTS.map((intent) => (
              <option key={intent} value={intent}>
                {intent}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid-2">
        <label>
          City
          <select
            value={form.city}
            onChange={(event) => {
              const selected = INDIA_CITY_PROFILES.find((city) => city.city === event.target.value);
              if (!selected) {
                return;
              }
              setForm((current) => ({
                ...current,
                city: selected.city,
                state: selected.state,
              }));
            }}
          >
            {INDIA_CITY_PROFILES.map((city) => (
              <option key={city.city} value={city.city}>
                {city.city}
              </option>
            ))}
          </select>
        </label>

        <label>
          State
          <input value={form.state} readOnly />
        </label>
      </div>

      <div className="form-grid-3">
        <label>
          Pincode
          <input
            required
            value={form.pincode}
            onChange={(event) => updateField("pincode", event.target.value)}
            placeholder="500081"
          />
        </label>

        <label>
          Contact Number
          <input
            required
            value={form.contactPhone}
            onChange={(event) => updateField("contactPhone", event.target.value)}
            placeholder="+91 98xxxxxx"
          />
        </label>

        <label>
          Valid Until
          <input
            required
            type="date"
            value={form.validUntil}
            onChange={(event) => updateField("validUntil", event.target.value)}
          />
        </label>
      </div>

      <label>
        Website URL (optional)
        <input
          value={form.websiteUrl}
          onChange={(event) => updateField("websiteUrl", event.target.value)}
          placeholder="https://your-business.example"
        />
      </label>

      <label>
        Image URL (optional)
        <input
          value={form.imageUrl}
          onChange={(event) => updateField("imageUrl", event.target.value)}
          placeholder="https://..."
        />
      </label>

      <label>
        Tags (comma separated)
        <input
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="festival, hiring, jewellery"
        />
      </label>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) => updateField("isFeatured", event.target.checked)}
        />
        Mark as featured ad
      </label>

      <button disabled={isSaving} type="submit" className="publish-btn">
        {isSaving ? "Publishing..." : "Publish Advertisement"}
      </button>

      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}

