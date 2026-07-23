import * as THREE from "three";

import type { PreviewModel } from "../../../types/previewModel";
import { createDdsTexture } from "./ddsTexture";
import { createMaterial, usesTransparency } from "./materials";
import type { VehiclePaintSettings } from "./vehiclePaint";

export type PreviewGroup = {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.MeshStandardMaterial[];
  textures: THREE.Texture[];
};

export function buildPreviewGroup(
  model: PreviewModel,
  wireframe: boolean,
  paint: VehiclePaintSettings,
): PreviewGroup {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.MeshStandardMaterial[] = [];
  const textures: THREE.Texture[] = [];
  const textureMap = new Map<string, THREE.Texture>();

  for (const item of model.textures) {
    const texture = createDdsTexture(item.dds);
    if (texture) {
      for (const alias of buildTextureAliases(item.name)) {
        textureMap.set(alias, texture);
      }
      textures.push(texture);
    }
  }

  for (const meshData of model.meshes) {
    const geometry = createGeometry(meshData);
    const texture = resolveTexture(meshData.texture, textureMap, model.textures);
    const material = createMaterial(meshData, texture, wireframe, paint);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = meshData.name;
    mesh.renderOrder = usesTransparency(meshData) ? 20 : 0;
    group.add(mesh);
    geometries.push(geometry);
    materials.push(material);
  }

  return { group, geometries, materials, textures };
}

function createGeometry(mesh: PreviewModel["meshes"][number]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(mesh.positions, 3),
  );

  if (mesh.normals.length === mesh.positions.length) {
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(mesh.normals, 3),
    );
  } else {
    geometry.computeVertexNormals();
  }

  if (mesh.uvs.length === (mesh.positions.length / 3) * 2) {
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(mesh.uvs, 2));
  }

  geometry.setIndex(mesh.indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function normalizeTextureName(name: string) {
  return name
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/^.*\//, "")
    .replace(/\.dds$/i, "")
    .replace(/[+]/g, "_");
}

function buildTextureAliases(name: string) {
  const normalized = normalizeTextureName(name);
  const aliases = new Set<string>([normalized]);

  aliases.add(normalized.replace(/_(hi|lod|s|w)$/i, ""));
  aliases.add(normalized.replace(/_(diffuse|color|albedo)$/i, ""));
  aliases.add(normalized.replace(/^vehshare_/, ""));
  aliases.add(normalized.replace(/^vehicle_generic_/, ""));

  return aliases;
}

function resolveTexture(
  textureName: string | null,
  textureMap: Map<string, THREE.Texture>,
  textures: PreviewModel["textures"],
) {
  if (!textureName) {
    return undefined;
  }

  for (const alias of buildTextureAliases(textureName)) {
    const directMatch = textureMap.get(alias);
    if (directMatch) {
      return directMatch;
    }
  }

  const normalized = normalizeTextureName(textureName);
  const similar = textures.find((item) => {
    const aliases = buildTextureAliases(item.name);
    if (aliases.has(normalized)) {
      return true;
    }

    for (const alias of aliases) {
      if (
        alias.includes(normalized) ||
        normalized.includes(alias) ||
        stripVariantSuffix(alias) === stripVariantSuffix(normalized)
      ) {
        return true;
      }
    }

    return false;
  });
  if (similar) {
    return textureMap.get(normalizeTextureName(similar.name));
  }

  return undefined;
}

function stripVariantSuffix(value: string) {
  return value.replace(/_(hi|lod|s|w|n|spec|normal|detail|diffuse|color|albedo)$/i, "");
}
