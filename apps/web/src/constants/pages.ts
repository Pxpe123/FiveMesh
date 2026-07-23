export type AppPage = "home" | "viewer";

export type FiveMeshApp = {
  id: AppPage;
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
    name: "Model Viewer",
    status: "available",
    description:
      "Upload YDR/YFT models with optional YTD textures and inspect them in WebGL.",
  },
  {
    id: "home",
    name: "YMAP Viewer",
    status: "planned",
    description:
      "Work is underway for viewing YMAP placement data inside the FiveMesh viewer",
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
    name: "YTYP + MLO Support",
    stage: "planned",
    description:
      "YTYP parsing for archetypes and MLO-related data is planned so interiors and related assets can be explored together.",
  },
  {
    name: "Map Viewer",
    stage: "possible future app",
    description:
      "A full map viewer is on the table if the data pipeline and performance hold up well enough.",
  },
];

export const supportedFormats = ["YDR", "YFT", "YTD"];
