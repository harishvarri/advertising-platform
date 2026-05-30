export type CityProfile = {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

export const INDIA_CITY_PROFILES: CityProfile[] = [
  { city: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867 },
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { city: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { city: "Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.209 },
  { city: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
  { city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185 },
  { city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
];

export const DEFAULT_CITY = INDIA_CITY_PROFILES[0];

export function getCityProfile(city: string): CityProfile | undefined {
  return INDIA_CITY_PROFILES.find((profile) =>
    profile.city.toLowerCase() === city.trim().toLowerCase(),
  );
}

export function distanceInKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusKm = 6371;
  const latDiff = degToRad(latitudeB - latitudeA);
  const lonDiff = degToRad(longitudeB - longitudeA);

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(degToRad(latitudeA)) *
      Math.cos(degToRad(latitudeB)) *
      Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

