export type AppPage = "home" | "viewer";

export type FiveMeshApp = {
  id: AppPage;
  name: string;
  status: "available" | "planned";
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
    name: "Asset Hub",
    status: "planned",
    description:
      "A future workspace for organizing examples, saved projects, and tool entry points.",
  },
];

export const supportedFormats = ["YDR", "YFT", "YTD"];
