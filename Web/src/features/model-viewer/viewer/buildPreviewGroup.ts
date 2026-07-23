import * as THREE from "three";

import type { PreviewModel } from "../../../types/previewModel";
import { createDdsTexture } from "./ddsTexture";
import { createMaterial, usesTransparency } from "./materials";

export type PreviewGroup = {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.MeshStandardMaterial[];
  textures: THREE.Texture[];
};

export function buildPreviewGroup(
  model: PreviewModel,
  wireframe: boolean,
): PreviewGroup {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.MeshStandardMaterial[] = [];
  const textures: THREE.Texture[] = [];
  const textureMap = new Map<string, THREE.Texture>();

  for (const item of model.textures) {
    const texture = createDdsTexture(item.dds);
    if (texture) {
      textureMap.set(normalizeTextureName(item.name), texture);
      textures.push(texture);
    }
  }

  for (const meshData of model.meshes) {
    const geometry = createGeometry(meshData);
    const texture = meshData.texture
      ? textureMap.get(normalizeTextureName(meshData.texture))
      : undefined;
    const material = createMaterial(meshData, texture, wireframe);
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
  return name.toLowerCase().replace(/\.dds$/i, "");
}
