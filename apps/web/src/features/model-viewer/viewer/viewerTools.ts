export type ViewerEnvironment = "studio" | "neutral" | "night";

export const viewerEnvironments: Record<
  ViewerEnvironment,
  { label: string; background: string; fog: string; key: string; fill: string }
> = {
  studio: {
    label: "Studio",
    background: "#090d12",
    fog: "#090d12",
    key: "#ffffff",
    fill: "#d8e8ff",
  },
  neutral: {
    label: "Neutral",
    background: "#17202a",
    fog: "#17202a",
    key: "#fff4dc",
    fill: "#c8d7e8",
  },
  night: {
    label: "Night",
    background: "#030508",
    fog: "#030508",
    key: "#9cc7ff",
    fill: "#33435a",
  },
};
