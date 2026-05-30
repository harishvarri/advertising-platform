import { AdsExplorer } from "@/components/ads-explorer";
import { fetchAdvertisements } from "@/lib/ads-data";

export const revalidate = 60;

export default async function Home() {
  const ads = await fetchAdvertisements();

  return <AdsExplorer initialAds={ads} />;
}

