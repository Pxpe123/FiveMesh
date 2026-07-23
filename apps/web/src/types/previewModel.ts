export type PreviewModel = {
  version: 1;
  name: string;
  format: "YDR" | "YFT";
  meshes: PreviewMesh[];
  textures: PreviewTexture[];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
};

export type PreviewMesh = {
  name: string;
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  texture: string | null;
  shader: string;
  renderBucket: number;
};

export type PreviewTexture = {
  name: string;
  dds: string;
};
