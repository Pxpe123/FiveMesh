import type { WorldCoordinate } from "./mapRouting";

export type MapLocationCategory =
  | "Emergency"
  | "Landmark"
  | "Services"
  | "Travel";

export type MapLocation = WorldCoordinate & {
  id: string;
  name: string;
  category: MapLocationCategory;
};

// A small curated set of useful GTA V reference points. It is intentionally
// independent from third-party interactive-map databases.
export const importantMapLocations: MapLocation[] = [
  { id: "lsia", name: "Los Santos International Airport", category: "Travel", x: -1037.6, y: -2737.8, z: 20.2 },
  { id: "legion-square", name: "Legion Square", category: "Landmark", x: 215.8, y: -810.1, z: 30.7 },
  { id: "mission-row", name: "Mission Row Police Station", category: "Emergency", x: 425.1, y: -979.5, z: 30.7 },
  { id: "pillbox", name: "Pillbox Hill Medical Centre", category: "Emergency", x: 307.2, y: -595.3, z: 43.3 },
  { id: "casino", name: "Diamond Casino", category: "Landmark", x: 925.3, y: 46.9, z: 81.1 },
  { id: "lsc-burton", name: "Los Santos Customs — Burton", category: "Services", x: -365.4, y: -131.8, z: 37.9 },
  { id: "del-perro-pier", name: "Del Perro Pier", category: "Landmark", x: -1850.4, y: -1231.1, z: 13.0 },
  { id: "maze-bank", name: "Maze Bank Tower", category: "Landmark", x: -75.2, y: -818.9, z: 326.2 },
  { id: "vespucci-beach", name: "Vespucci Beach", category: "Landmark", x: -1475.7, y: -920.2, z: 10.0 },
  { id: "mirror-park", name: "Mirror Park", category: "Landmark", x: 1084.9, y: -696.7, z: 58.0 },
  { id: "vinewood-bowl", name: "Vinewood Bowl", category: "Landmark", x: 683.4, y: 569.7, z: 130.5 },
  { id: "sandy-airfield", name: "Sandy Shores Airfield", category: "Travel", x: 1743.3, y: 3276.2, z: 41.1 },
  { id: "sandy-sheriff", name: "Sandy Shores Sheriff Station", category: "Emergency", x: 1853.2, y: 3689.5, z: 34.3 },
  { id: "grapeseed-airfield", name: "Grapeseed Airfield", category: "Travel", x: 2136.0, y: 4809.5, z: 41.2 },
  { id: "fort-zancudo", name: "Fort Zancudo", category: "Landmark", x: -2047.4, y: 3132.1, z: 32.8 },
  { id: "mount-chiliad", name: "Mount Chiliad Summit", category: "Landmark", x: 501.8, y: 5604.8, z: 797.9 },
  { id: "paleto-sheriff", name: "Paleto Bay Sheriff Station", category: "Emergency", x: -448.2, y: 6013.1, z: 31.7 },
  { id: "paleto-bay", name: "Paleto Bay", category: "Landmark", x: 80.3, y: 6424.2, z: 31.5 },
  { id: "bolingbroke", name: "Bolingbroke Penitentiary", category: "Landmark", x: 1849.4, y: 2586.0, z: 45.7 },
  { id: "humane-labs", name: "Humane Labs", category: "Landmark", x: 3618.5, y: 3744.2, z: 28.7 },
];

export const mapLocationCategories: MapLocationCategory[] = [
  "Emergency",
  "Landmark",
  "Services",
  "Travel",
];
