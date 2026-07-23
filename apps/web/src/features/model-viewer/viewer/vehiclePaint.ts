import * as THREE from "three";

import type { PreviewMesh, PreviewModel } from "../../../types/previewModel";

export type VehiclePaintSettings = {
  primary: string;
  secondary: string;
  rim: string;
};

export type PaintChannel = "primary" | "secondary" | "rim" | "none";

const primaryTextureAllowList = [
  "vehicle_generic_detail2",
  "vehicle_generic_mesh4",
  "vehicle_generic_doorshut",
];

const secondaryTextureAllowList = [
  "vehicle_generic_detail2_worn",
  "vehicle_generic_mesh4_worn",
];

const nonPaintTextureHints = [
  "glass",
  "window",
  "light",
  "badge",
  "plate",
  "dash",
  "interior",
  "seat",
  "dial",
  "display",
  "tyre",
  "tire",
  "tyrewall",
  "rubber",
];

const rimTextureHints = ["vehwheel", "rim", "alloy"];

export function isVehiclePreview(model: PreviewModel | null) {
  return model?.format === "YFT";
}

export function getDefaultVehiclePaint(): VehiclePaintSettings {
  return {
    primary: "#d7dde3",
    secondary: "#4e5966",
    rim: "#c1c7cf",
  };
}

export function classifyPaintChannel(mesh: PreviewMesh): PaintChannel {
  const descriptor = `${mesh.name} ${mesh.shader} ${mesh.texture ?? ""}`.toLowerCase();
  const texture = (mesh.texture ?? "").toLowerCase();

  if (includesAny(descriptor, nonPaintTextureHints)) {
    return "none";
  }

  if (includesAny(texture, rimTextureHints)) {
    return "rim";
  }

  if (matchesAny(texture, secondaryTextureAllowList)) {
    return "secondary";
  }

  if (matchesAny(texture, primaryTextureAllowList)) {
    return "primary";
  }

  return "none";
}

export function getMaterialColor(
  channel: PaintChannel,
  paint: VehiclePaintSettings,
  hasTexture: boolean,
) {
  switch (channel) {
    case "primary":
      return new THREE.Color(paint.primary);
    case "secondary":
      return new THREE.Color(paint.secondary);
    case "rim":
      return new THREE.Color(paint.rim);
    default:
      return new THREE.Color(hasTexture ? "#ffffff" : "#a7b0ba");
  }
}

function includesAny(value: string, hints: string[]) {
  return hints.some((hint) => value.includes(hint));
}

function matchesAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value === candidate || value.startsWith(`${candidate}_`));
}
