"use client";

import { useMemo, useState } from "react";

import { AdCard } from "@/components/ad-card";
import { PostAdForm } from "@/components/post-ad-form";
import { DEFAULT_CITY, INDIA_CITY_PROFILES, distanceInKm } from "@/lib/india-cities";
import { AD_CATEGORIES, OFFER_INTENTS, type Advertisement } from "@/lib/types";

type SortMode = "nearest" | "latest" | "expiring";

type FeedRecord = {
  ad: Advertisement;
  distanceKm: number;
};

type AdsExplorerProps = {
  initialAds: Advertisement[];
};

function nearestCityByCoordinates(latitude: number, longitude: number) {
  return INDIA_CITY_PROFILES.reduce((best, current) => {
    const currentDistance = distanceInKm(
      latitude,
      longitude,
      current.latitude,
      current.longitude,
    );

    if (!best || currentDistance < best.distanceKm) {
      return { city: current.city, distanceKm: currentDistance };
    }

    return best;
  }, null as null | { city: string; distanceKm: number });
}

export function AdsExplorer({ initialAds }: AdsExplorerProps) {
  const [ads, setAds] = useState(initialAds);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY.city);
  const [radiusKm, setRadiusKm] = useState(250);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | Advertisement["category"]>("All");
  const [selectedIntent, setSelectedIntent] = useState<"All" | Advertisement["intent"]>("All");
  const [sortMode, setSortMode] = useState<SortMode>("nearest");
  const [locationStatus, setLocationStatus] = useState<string>("");

  const cityProfile = INDIA_CITY_PROFILES.find((profile) => profile.city === selectedCity) ?? DEFAULT_CITY;

  const processedAds = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    const rows = ads
      .filter((ad) => ad.status === "active")
      .map<FeedRecord>((ad) => ({
        ad,
        distanceKm: distanceInKm(
          cityProfile.latitude,
          cityProfile.longitude,
          ad.latitude,
          ad.longitude,
        ),
      }))
      .filter((record) => {
        if (record.distanceKm > radiusKm) {
          return false;
        }

        if (selectedCategory !== "All" && record.ad.category !== selectedCategory) {
          return false;
        }

        if (selectedIntent !== "All" && record.ad.intent !== selectedIntent) {
          return false;
        }

        if (!loweredSearch) {
          return true;
        }

        const searchableText = [
          record.ad.title,
          record.ad.description,
          record.ad.businessName,
          record.ad.city,
          record.ad.state,
          ...record.ad.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(loweredSearch);
      });

    rows.sort((left, right) => {
      if (sortMode === "latest") {
        return (
          new Date(right.ad.createdAt).getTime() -
          new Date(left.ad.createdAt).getTime()
        );
      }

      if (sortMode === "expiring") {
        return (
          new Date(left.ad.validUntil).getTime() -
          new Date(right.ad.validUntil).getTime()
        );
      }

      return left.distanceKm - right.distanceKm;
    });

    return rows;
  }, [ads, cityProfile.latitude, cityProfile.longitude, radiusKm, selectedCategory, selectedIntent, search, sortMode]);

  const topFeatured = processedAds.filter((record) => record.ad.isFeatured).slice(0, 3);

  const stats = useMemo(() => {
    return OFFER_INTENTS.reduce(
      (accumulator, intent) => {
        accumulator[intent] = processedAds.filter((record) => record.ad.intent === intent).length;
        return accumulator;
      },
      { Job: 0, Discount: 0, Brand: 0 } as Record<Advertisement["intent"], number>,
    );
  }, [processedAds]);

  function appendAdvertisement(ad: Advertisement) {
    setAds((current) => [ad, ...current]);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not available in this browser.");
      return;
    }

    setLocationStatus("Detecting your nearest city...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = nearestCityByCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );

        if (!nearest) {
          setLocationStatus("Unable to map your coordinates to a supported city.");
          return;
        }

        setSelectedCity(nearest.city);
        setLocationStatus(
          `Detected near ${nearest.city} (${nearest.distanceKm.toFixed(1)} km from city center).`,
        );
      },
      () => {
        setLocationStatus("Location permission denied. Select city manually.");
      },
      { timeout: 10000 },
    );
  }

  return (
    <div className="ads-shell">
      <section className="hero-panel">
        <p className="kicker">India-First Hyperlocal Advertising Network</p>
        <h1>BharatAd Pulse</h1>
        <p className="hero-copy">
          Discover nearby job openings, food deals, shopping discounts, jewellery promotions,
          and trusted local business campaigns in Indian cities.
        </p>

        <div className="stats-row">
          <article>
            <span>{processedAds.length}</span>
            <p>Ads in radius</p>
          </article>
          <article>
            <span>{stats.Job}</span>
            <p>Nearby jobs</p>
          </article>
          <article>
            <span>{stats.Discount}</span>
            <p>Discount offers</p>
          </article>
          <article>
            <span>{stats.Brand}</span>
            <p>Brand campaigns</p>
          </article>
        </div>
      </section>

      <section className="controls-panel">
        <div className="control-line">
          <label>
            City
            <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
              {INDIA_CITY_PROFILES.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>
          </label>

          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as typeof selectedCategory)}
            >
              <option value="All">All</option>
              {AD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select
              value={selectedIntent}
              onChange={(event) => setSelectedIntent(event.target.value as typeof selectedIntent)}
            >
              <option value="All">All</option>
              {OFFER_INTENTS.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
              <option value="nearest">Nearest</option>
              <option value="latest">Latest</option>
              <option value="expiring">Expiring soon</option>
            </select>
          </label>
        </div>

        <div className="control-line second">
          <label className="radius-control">
            Radius: {radiusKm} km
            <input
              type="range"
              min={10}
              max={1500}
              step={10}
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
            />
          </label>

          <label className="search-control">
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by business, city, tags, or offer"
            />
          </label>

          <button className="ghost-btn" type="button" onClick={detectLocation}>
            Detect My City
          </button>
        </div>

        {locationStatus ? <p className="location-status">{locationStatus}</p> : null}
      </section>

      <section className="featured-strip">
        <h2>Festival Spotlight</h2>
        <div className="featured-list">
          {topFeatured.length ? (
            topFeatured.map((record) => (
              <article key={`spot-${record.ad.id}`}>
                <h3>{record.ad.title}</h3>
                <p>
                  {record.ad.city} · {record.ad.category} · {record.distanceKm.toFixed(1)} km
                </p>
              </article>
            ))
          ) : (
            <article>
              <h3>No featured ads in your current radius</h3>
              <p>Increase radius or choose another city.</p>
            </article>
          )}
        </div>
      </section>

      <section className="content-grid">
        <div className="feed-panel">
          <h2>Nearby Advertisement Feed</h2>
          <p>
            {processedAds.length} active ads around {selectedCity}. Updated for jobs, offers, and local promotions.
          </p>
          <div className="ads-grid">
            {processedAds.map((record) => (
              <AdCard key={record.ad.id} ad={record.ad} distanceKm={record.distanceKm} />
            ))}
          </div>
        </div>

        <PostAdForm onPublished={appendAdvertisement} />
      </section>
    </div>
  );
}

