import Image from "next/image";

import type { Advertisement } from "@/lib/types";

type AdCardProps = {
  ad: Advertisement;
  distanceKm: number;
};

const badgeByIntent: Record<Advertisement["intent"], string> = {
  Job: "badge-job",
  Discount: "badge-discount",
  Brand: "badge-brand",
};

export function AdCard({ ad, distanceKm }: AdCardProps) {
  return (
    <article className="ad-card">
      <div className="ad-card-image-wrap">
        <Image
          className="ad-card-image"
          src={ad.imageUrl}
          alt={ad.title}
          fill
          sizes="(max-width: 860px) 100vw, 170px"
        />
        <span className={`intent-badge ${badgeByIntent[ad.intent]}`}>{ad.intent}</span>
      </div>

      <div className="ad-card-body">
        <div className="ad-card-topline">
          <p>{ad.businessName}</p>
          {ad.isFeatured ? <span className="featured-chip">Featured</span> : null}
        </div>

        <h3>{ad.title}</h3>
        <p className="ad-description">{ad.description}</p>

        <div className="ad-metrics">
          <span>{distanceKm.toFixed(1)} km away</span>
          <span>
            {ad.city}, {ad.state}
          </span>
          <span>Valid until {ad.validUntil}</span>
        </div>

        <div className="ad-tags">
          {ad.tags.slice(0, 3).map((tag) => (
            <span key={`${ad.id}-${tag}`}>#{tag}</span>
          ))}
        </div>

        <div className="ad-actions">
          <a href={`tel:${ad.contactPhone}`} className="ad-contact">
            Call
          </a>
          {ad.websiteUrl ? (
            <a href={ad.websiteUrl} target="_blank" rel="noreferrer" className="ad-contact ghost">
              Visit
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
