import Image from "next/image";

import type { Advertisement } from "@/lib/types";

type AdCardProps = {
  ad: Advertisement;
  distanceKm: number;
  sequence: number;
  isActive?: boolean;
  onOpen?: () => void;
};

const badgeByIntent: Record<Advertisement["intent"], string> = {
  Job: "badge-job",
  Discount: "badge-discount",
  Brand: "badge-brand",
};

function formatDisplayDate(value: string): string {
  return value.includes("T") ? value.split("T")[0] : value;
}

export function AdCard({ ad, distanceKm, sequence, isActive = false, onOpen }: AdCardProps) {
  return (
    <article className={`ad-card ${isActive ? "is-active" : ""}`}>
      <div className="ad-card-image-wrap">
        <Image
          className="ad-card-image"
          src={ad.imageUrl}
          alt={ad.title}
          fill
          sizes="(max-width: 860px) 100vw, 280px"
        />
        <span className={`intent-badge ${badgeByIntent[ad.intent]}`}>{ad.intent}</span>
      </div>

      <div className="ad-card-body">
        <div className="ad-card-topline">
          <p>{ad.businessName}</p>
          <span className="ad-seq">Ad #{String(sequence).padStart(3, "0")}</span>
        </div>

        <h3>{ad.title}</h3>
        <p className="ad-description">{ad.description}</p>

        <div className="ad-metrics">
          <span>{distanceKm.toFixed(1)} km away</span>
          <span>
            {ad.city}, {ad.state}
          </span>
          <span>Valid until {formatDisplayDate(ad.validUntil)}</span>
          <span>Pincode {ad.pincode}</span>
        </div>

        <div className="ad-tags">
          {ad.tags.slice(0, 4).map((tag) => (
            <span key={`${ad.id}-${tag}`}>#{tag}</span>
          ))}
        </div>

        <div className="ad-actions">
          <a href={`tel:${ad.contactPhone}`} className="ad-contact">
            Call Business
          </a>
          {ad.websiteUrl ? (
            <a href={ad.websiteUrl} target="_blank" rel="noreferrer" className="ad-contact ghost">
              Visit Site
            </a>
          ) : null}
          <button type="button" className="ad-contact ghost" onClick={onOpen}>
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
