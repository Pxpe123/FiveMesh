export type AppPage = "viewer" | "converter" | "mlo" | "hack-practice";

export type FiveMeshApp = {
  id: AppPage;
  path: string;
  name: string;
  status: "available" | "planned";
  description: string;
};

export type PlannedFeature = {
  name: string;
  stage: string;
  description: string;
};

export const fiveMeshApps: FiveMeshApp[] = [
  {
    id: "viewer",
    path: "/viewer",
    name: "Model Viewer",
    status: "available",
    description:
      "Upload YDR/YFT models with optional YTD textures and inspect them in WebGL.",
  },
  {
    id: "converter",
    path: "/converter",
    name: "Asset Converter",
    status: "available",
    description:
      "Convert YDR, YFT, and YTD assets to XML or rebuild them from XML.",
  },
  {
    id: "mlo",
    path: "/mlo",
    name: "MLO Workspace",
    status: "available",
    description:
      "Inspect YTYP archetypes, rooms, portals, and entities, then export portal edits.",
  },
  {
    id: "hack-practice",
    path: "/games/hack-practice",
    name: "ATM Bomb Hack Practice",
    status: "available",
    description:
      "Practise timed signal-trace hacking challenges for FiveM RP scenarios.",
  },
];

export const plannedFeatures: PlannedFeature[] = [
  {
    name: "YMAP Viewer",
    stage: "in progress",
    description:
      "Work is underway for viewing YMAP placement data inside the FiveMesh viewer.",
  },
  {
    name: "MLO scene rendering",
    stage: "next",
    description:
      "Render referenced YDR interiors and portal visibility in a navigable 3D scene.",
  },
  {
    name: "Map Viewer",
    stage: "possible future app",
    description:
      "A full map viewer is on the table if the data pipeline and performance hold up well enough.",
  },
];

export const supportedFormats = ["YDR", "YFT", "YTD", "YTYP"];
