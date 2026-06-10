"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type QuickFilterId = "festival" | "openings" | "branches" | "flash" | "trusted";

const LIVE_TICKER_MESSAGES = [
  "Festival season live: curated discounts from malls, jewellery showrooms, and food chains.",
  "New branch announcements and grand opening campaigns are now highlighted in the feed.",
  "Local job openings are verified by city and displayed by nearest-first discovery.",
  "Use radius + category controls to discover hyperlocal promotions around your area.",
];

const QUICK_FILTERS: Array<{ id: QuickFilterId; label: string; blurb: string }> = [
  {
    id: "festival",
    label: "Festival Offers",
    blurb: "Seasonal campaigns, shopping, and celebration discounts.",
  },
  {
    id: "openings",
    label: "New Openings",
    blurb: "Nearby jobs, hiring events, and urgent vacancies.",
  },
  {
    id: "branches",
    label: "New Branches",
    blurb: "Brand expansions, new outlets, and launch promotions.",
  },
  {
    id: "flash",
    label: "Flash Discounts",
    blurb: "Fast expiring promotions sorted by urgency.",
  },
  {
    id: "trusted",
    label: "Trusted Local",
    blurb: "Featured businesses with active local engagement.",
  },
];

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 6;

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

function isBranchCampaign(ad: Advertisement): boolean {
  const text = `${ad.title} ${ad.description} ${ad.tags.join(" ")}`.toLowerCase();
  const branchTerms = ["branch", "outlet", "launch", "opening", "showroom", "new store"];
  return branchTerms.some((term) => text.includes(term));
}

function isFestivalCampaign(ad: Advertisement): boolean {
  const text = `${ad.title} ${ad.description} ${ad.tags.join(" ")}`.toLowerCase();
  const festivalTerms = ["festival", "diwali", "dussehra", "ramzan", "christmas", "new year"];
  return festivalTerms.some((term) => text.includes(term));
}

function getTopTags(records: FeedRecord[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    record.ad.tags.forEach((tag) => {
      const normalizedTag = tag.trim().toLowerCase();
      if (!normalizedTag) {
        return;
      }
      counts.set(normalizedTag, (counts.get(normalizedTag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
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
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterId | "">("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [activeCardId, setActiveCardId] = useState("");
  const [selectedAd, setSelectedAd] = useState<FeedRecord | null>(null);

  const feedScrollerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const cityProfile =
    INDIA_CITY_PROFILES.find((profile) => profile.city === selectedCity) ?? DEFAULT_CITY;

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
        return right.ad.createdAt.localeCompare(left.ad.createdAt);
      }

      if (sortMode === "expiring") {
        return left.ad.validUntil.localeCompare(right.ad.validUntil);
      }

      return left.distanceKm - right.distanceKm;
    });

    return rows;
  }, [
    ads,
    cityProfile.latitude,
    cityProfile.longitude,
    radiusKm,
    search,
    selectedCategory,
    selectedIntent,
    sortMode,
  ]);

  const visibleAds = useMemo(
    () => processedAds.slice(0, Math.min(visibleCount, processedAds.length)),
    [processedAds, visibleCount],
  );

  const topFeatured = useMemo(
    () => processedAds.filter((record) => record.ad.isFeatured).slice(0, 4),
    [processedAds],
  );

  const stats = useMemo(() => {
    return OFFER_INTENTS.reduce(
      (accumulator, intent) => {
        accumulator[intent] = processedAds.filter(
          (record) => record.ad.intent === intent,
        ).length;
        return accumulator;
      },
      { Job: 0, Discount: 0, Brand: 0 } as Record<Advertisement["intent"], number>,
    );
  }, [processedAds]);

  const topTags = useMemo(() => getTopTags(processedAds), [processedAds]);

  const categoryDistribution = useMemo(
    () =>
      AD_CATEGORIES.map((category) => ({
        category,
        count: processedAds.filter((record) => record.ad.category === category).length,
      }))
        .filter((entry) => entry.count > 0)
        .sort((left, right) => right.count - left.count),
    [processedAds],
  );

  const festivalHighlights = useMemo(
    () =>
      processedAds
        .filter(
          (record) =>
            record.ad.intent === "Discount" ||
            record.ad.isFeatured ||
            isFestivalCampaign(record.ad),
        )
        .slice(0, 10),
    [processedAds],
  );

  const branchHighlights = useMemo(
    () => processedAds.filter((record) => isBranchCampaign(record.ad)).slice(0, 4),
    [processedAds],
  );

  const canLoadMore = visibleAds.length < processedAds.length;
  const currentActiveId = activeCardId || visibleAds[0]?.ad.id || "";
  const activeRecord = visibleAds.find((record) => record.ad.id === currentActiveId) ?? visibleAds[0];

  function resetFeedWindow() {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setActiveCardId("");
  }

  function applyQuickFilter(filterId: QuickFilterId) {
    setActiveQuickFilter(filterId);
    resetFeedWindow();

    if (filterId === "festival") {
      setSelectedIntent("Discount");
      setSelectedCategory("All");
      setSearch("festival");
      setSortMode("expiring");
      return;
    }

    if (filterId === "openings") {
      setSelectedIntent("Job");
      setSelectedCategory("All");
      setSearch("");
      setSortMode("latest");
      return;
    }

    if (filterId === "branches") {
      setSelectedIntent("All");
      setSelectedCategory("All");
      setSearch("branch");
      setSortMode("latest");
      return;
    }

    if (filterId === "flash") {
      setSelectedIntent("Discount");
      setSelectedCategory("All");
      setSearch("offer");
      setSortMode("expiring");
      return;
    }

    setSelectedIntent("All");
    setSelectedCategory("All");
    setSearch("");
    setSortMode("nearest");
  }

  function clearQuickDiscovery() {
    setActiveQuickFilter("");
    setSearch("");
    setSelectedCategory("All");
    setSelectedIntent("All");
    setSortMode("nearest");
    resetFeedWindow();
  }

  function appendAdvertisement(ad: Advertisement) {
    setAds((current) => [ad, ...current]);
    setSelectedCity(ad.city);
    setSelectedCategory("All");
    setSelectedIntent("All");
    setSearch("");
    setActiveQuickFilter("");
    setSortMode("latest");
    resetFeedWindow();
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
        setActiveQuickFilter("");
        resetFeedWindow();
        setLocationStatus(
          `Detected near ${nearest.city} (${nearest.distanceKm.toFixed(
            1,
          )} km from city center).`,
        );
      },
      () => {
        setLocationStatus("Location permission denied. Select city manually.");
      },
      { timeout: 10000 },
    );
  }

  useEffect(() => {
    const root = feedScrollerRef.current;
    const sentinel = loadMoreRef.current;

    if (!root || !sentinel || !canLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(current + LOAD_MORE_STEP, processedAds.length),
        );
      },
      {
        root,
        rootMargin: "220px 0px 160px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, processedAds.length]);

  useEffect(() => {
    const root = feedScrollerRef.current;

    if (!root || visibleAds.length === 0) {
      return;
    }

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-ad-id]"));
    if (cards.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        const topEntry = visibleEntries.reduce((best, candidate) =>
          candidate.intersectionRatio > best.intersectionRatio ? candidate : best,
        );

        const candidateId = (topEntry.target as HTMLElement).dataset.adId;
        if (candidateId) {
          setActiveCardId(candidateId);
        }
      },
      {
        root,
        threshold: [0.35, 0.6, 0.85],
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [visibleAds]);

  return (
    <div className="ads-shell">
      <section className="hero-panel">
        <div>
          <p className="kicker">India-First Hyperlocal Advertising Network</p>
          <h1>BharatAd Pulse</h1>
          <p className="hero-copy">
            Local advertising platform for nearby offers, new job openings, special discounts,
            and new branch campaigns. Built for Indian city-level discovery and high engagement.
          </p>
        </div>

        <div className="stats-row">
          <article>
            <span>{processedAds.length}</span>
            <p>Ads in radius</p>
          </article>
          <article>
            <span>{stats.Job}</span>
            <p>Active job openings</p>
          </article>
          <article>
            <span>{stats.Discount}</span>
            <p>Discount campaigns</p>
          </article>
          <article>
            <span>{stats.Brand}</span>
            <p>Brand promotions</p>
          </article>
        </div>
      </section>

      <section className="ticker-panel" aria-label="Live local campaign stream">
        <div className="ticker-track">
          {[...LIVE_TICKER_MESSAGES, ...LIVE_TICKER_MESSAGES].map((message, index) => (
            <p key={`ticker-${index}`}>{message}</p>
          ))}
        </div>
      </section>

      <section className="controls-panel">
        <div className="control-line">
          <label>
            City
            <select
              value={selectedCity}
              onChange={(event) => {
                setSelectedCity(event.target.value);
                setActiveQuickFilter("");
                resetFeedWindow();
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
            Category
            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value as typeof selectedCategory);
                setActiveQuickFilter("");
                resetFeedWindow();
              }}
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
              onChange={(event) => {
                setSelectedIntent(event.target.value as typeof selectedIntent);
                setActiveQuickFilter("");
                resetFeedWindow();
              }}
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
            <select
              value={sortMode}
              onChange={(event) => {
                setSortMode(event.target.value as SortMode);
                setActiveQuickFilter("");
                resetFeedWindow();
              }}
            >
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
              onChange={(event) => {
                setRadiusKm(Number(event.target.value));
                resetFeedWindow();
              }}
            />
          </label>

          <label className="search-control">
            Search
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveQuickFilter("");
                resetFeedWindow();
              }}
              placeholder="Search by business, city, tags, festival, branch, hiring"
            />
          </label>

          <button className="ghost-btn" type="button" onClick={detectLocation}>
            Detect My City
          </button>

          <button
            className="ghost-btn"
            style={{ borderColor: "#ffbaba", color: "#a94442", backgroundColor: "#f2dede" }}
            type="button"
            onClick={() => {
              throw new Error("Sample Test Error: Analytics integration verification");
            }}
          >
            Trigger Test Error
          </button>
        </div>

        {locationStatus ? <p className="location-status">{locationStatus}</p> : null}
      </section>

      <section className="quick-filter-panel">
        <div className="quick-filter-header">
          <h2>Instant Discovery</h2>
          <button type="button" className="ghost-btn small" onClick={clearQuickDiscovery}>
            Reset
          </button>
        </div>
        <div className="quick-filter-list">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`quick-filter-chip ${activeQuickFilter === filter.id ? "is-active" : ""}`}
              onClick={() => applyQuickFilter(filter.id)}
            >
              <span>{filter.label}</span>
              <p>{filter.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="featured-strip">
        <h2>Festival Spotlight</h2>
        <div className="featured-list rail">
          {festivalHighlights.length ? (
            festivalHighlights.map((record) => (
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

      <section className="insight-grid">
        <article>
          <h3>Top Categories in {selectedCity}</h3>
          <div className="insight-items">
            {categoryDistribution.slice(0, 5).map((item) => (
              <p key={item.category}>
                <span>{item.category}</span>
                <strong>{item.count}</strong>
              </p>
            ))}
          </div>
        </article>

        <article>
          <h3>Trending Tags</h3>
          <div className="tag-cloud">
            {topTags.length ? (
              topTags.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => {
                    setSearch(item.tag);
                    setActiveQuickFilter("");
                    resetFeedWindow();
                  }}
                >
                  #{item.tag} ({item.count})
                </button>
              ))
            ) : (
              <p>No trending tags yet in this radius.</p>
            )}
          </div>
        </article>

        <article>
          <h3>Branch & Launch Highlights</h3>
          <div className="insight-items concise">
            {(branchHighlights.length ? branchHighlights : topFeatured).slice(0, 4).map((record) => (
              <p key={`branch-${record.ad.id}`}>
                <span>{record.ad.businessName}</span>
                <strong>{record.ad.city}</strong>
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <div className="feed-panel">
          <div className="feed-header">
            <div>
              <h2>Nearby Advertisement Feed</h2>
              <p>
                Scroll through live ads for offers, openings, and local campaigns around {selectedCity}.
              </p>
            </div>
            {activeRecord ? (
              <aside className="active-ad-pulse">
                <p>Now Viewing</p>
                <h3>{activeRecord.ad.businessName}</h3>
                <span>
                  {activeRecord.ad.city} · {activeRecord.distanceKm.toFixed(1)} km
                </span>
              </aside>
            ) : null}
          </div>

          <div className="ads-grid scroll-mode" ref={feedScrollerRef}>
            {visibleAds.map((record, index) => (
              <div key={record.ad.id} data-ad-id={record.ad.id} className="feed-item">
                <AdCard
                  ad={record.ad}
                  distanceKm={record.distanceKm}
                  sequence={index + 1}
                  isActive={currentActiveId === record.ad.id}
                  onOpen={() => setSelectedAd(record)}
                />
              </div>
            ))}
            <div ref={loadMoreRef} className="feed-sentinel" />
          </div>

          {canLoadMore ? (
            <p className="load-hint">Loading more advertisements as you scroll...</p>
          ) : (
            <p className="load-hint">You have reached the end of the current feed.</p>
          )}
        </div>

        <PostAdForm onPublished={appendAdvertisement} />
      </section>

      {selectedAd ? (
        <div className="details-modal" role="dialog" aria-modal="true" aria-label="Advertisement details">
          <div className="details-card">
            <button className="close-modal" type="button" onClick={() => setSelectedAd(null)}>
              Close
            </button>
            <h2>{selectedAd.ad.title}</h2>
            <p>{selectedAd.ad.description}</p>
            <div className="detail-metrics">
              <span>Business: {selectedAd.ad.businessName}</span>
              <span>Location: {selectedAd.ad.city}, {selectedAd.ad.state}</span>
              <span>Distance: {selectedAd.distanceKm.toFixed(1)} km</span>
              <span>Contact: {selectedAd.ad.contactPhone}</span>
              <span>Valid Until: {selectedAd.ad.validUntil}</span>
            </div>
            <div className="ad-actions">
              <a href={`tel:${selectedAd.ad.contactPhone}`} className="ad-contact">
                Call Now
              </a>
              {selectedAd.ad.websiteUrl ? (
                <a
                  href={selectedAd.ad.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ad-contact ghost"
                >
                  Visit Website
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
