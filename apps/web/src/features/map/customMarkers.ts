import type { WorldCoordinate } from "./mapRouting";

export const customMarkerIconGroups = [
  {
    label: "Places",
    icons: [
      { id: "pin", label: "Marker" },
      { id: "home", label: "Home" },
      { id: "shop", label: "Shop" },
      { id: "garage", label: "Garage" },
    ],
  },
  {
    label: "Services",
    icons: [
      { id: "fuel", label: "Fuel" },
      { id: "hospital", label: "Medical" },
      { id: "police", label: "Police" },
      { id: "bank", label: "Bank" },
    ],
  },
  {
    label: "Illegal",
    icons: [
      { id: "cannabis", label: "Weed" },
      { id: "weapon", label: "Weapons" },
      { id: "package", label: "Drop" },
      { id: "mask", label: "Robbery" },
    ],
  },
] as const;

export type CustomMarkerIcon = typeof customMarkerIconGroups[number]["icons"][number]["id"];

export type CustomMapMarker = WorldCoordinate & {
  id: string;
  name: string;
  icon: CustomMarkerIcon;
};

const STORAGE_KEY = "fivemesh.map.custom-markers";
const STORAGE_VERSION = 1;
const allCustomMarkerIcons: Array<{ id: CustomMarkerIcon; label: string }> = [];
for (const group of customMarkerIconGroups) allCustomMarkerIcons.push(...group.icons);
const validIconIds = new Set(allCustomMarkerIcons.map((icon) => icon.id));

export function loadCustomMarkers(): CustomMapMarker[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return [];
    const parsed: unknown = JSON.parse(storedValue);
    if (!isStoredMarkerCollection(parsed)) return [];
    return parsed.markers;
  } catch {
    return [];
  }
}

export function saveCustomMarkers(markers: CustomMapMarker[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, markers }),
  );
}

export function createMarkerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `marker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCustomMarkerIconLabel(iconId: CustomMarkerIcon) {
  return allCustomMarkerIcons.find((icon) => icon.id === iconId)?.label ?? "Marker";
}

function isStoredMarkerCollection(value: unknown): value is { version: 1; markers: CustomMapMarker[] } {
  if (!value || typeof value !== "object") return false;
  const collection = value as { version?: unknown; markers?: unknown };
  return collection.version === STORAGE_VERSION
    && Array.isArray(collection.markers)
    && collection.markers.every(isCustomMapMarker);
}

function isCustomMapMarker(value: unknown): value is CustomMapMarker {
  if (!value || typeof value !== "object") return false;
  const marker = value as Partial<CustomMapMarker>;
  return typeof marker.id === "string"
    && typeof marker.name === "string"
    && marker.name.length > 0
    && typeof marker.icon === "string"
    && validIconIds.has(marker.icon as CustomMarkerIcon)
    && isFiniteNumber(marker.x)
    && isFiniteNumber(marker.y)
    && isFiniteNumber(marker.z);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
