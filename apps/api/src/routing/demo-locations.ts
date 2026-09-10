import type { NamedCoordinate } from "@smartev/shared";

export const DEMO_LOCATIONS: NamedCoordinate[] = [
  { label: "India Gate, New Delhi", latitude: 28.6129, longitude: 77.2295 },
  { label: "Gurugram Cyber Hub", latitude: 28.495, longitude: 77.089 },
  { label: "New Delhi Railway Station", latitude: 28.6429, longitude: 77.2197 },
  { label: "Jaipur, Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { label: "Neemrana, Rajasthan", latitude: 27.9889, longitude: 76.3846 },
  { label: "Manesar, Haryana", latitude: 28.3543, longitude: 76.9398 },
  { label: "Alwar, Rajasthan", latitude: 27.553, longitude: 76.6346 },
];

export function findDemoLocation(query: string): NamedCoordinate | undefined {
  const normalized = query.toLowerCase();
  return DEMO_LOCATIONS.find(
    (location) =>
      location.label.toLowerCase().includes(normalized) ||
      normalized.includes(location.label.split(",")[0]!.toLowerCase()),
  );
}
