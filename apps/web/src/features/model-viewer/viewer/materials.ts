import * as THREE from "three";

import type { PreviewMesh } from "../../../types/previewModel";
import {
  classifyPaintChannel,
  getMaterialColor,
  type VehiclePaintSettings,
} from "./vehiclePaint";

const transparencyHints = [
  "glass",
  "window",
  "windscreen",
  "windshield",
  "lightglass",
  "vehglass",
  "emissiveglass",
  "decal",
  "alpha",
];

export function createMaterial(
  mesh: PreviewMesh,
  texture: THREE.Texture | undefined,
  wireframe: boolean,
  paint: VehiclePaintSettings,
) {
  const transparent = usesTransparency(mesh);
  const paintChannel = transparent ? "none" : classifyPaintChannel(mesh);
  return new THREE.MeshStandardMaterial({
    color: getMaterialColor(paintChannel, paint, Boolean(texture)),
    map: texture,
    metalness: transparent ? 0.05 : 0.25,
    roughness: transparent ? 0.08 : 0.55,
    side: THREE.DoubleSide,
    wireframe,
    transparent,
    opacity: transparent ? 0.42 : 1,
    alphaTest: transparent ? 0.01 : texture ? 0.35 : 0,
    depthWrite: !transparent,
  });
}

export function usesTransparency(mesh: PreviewMesh) {
  const materialName =
    `${mesh.name} ${mesh.shader} ${mesh.texture ?? ""}`.toLowerCase();
  return transparencyHints.some((hint) => materialName.includes(hint));
}
