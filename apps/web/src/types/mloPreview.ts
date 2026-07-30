export type MloPreview = {
  version: 1;
  name: string;
  archetypes: MloArchetype[];
  assets: MloAsset[];
  requiredDrawables: string[];
  requiredTextures: string[];
};

export type MloAsset = {
  name: string;
  format: "YDR" | "YFT";
  modelCount: number;
  boundsMin: [number, number, number];
  boundsMax: [number, number, number];
};

export type MloArchetype = {
  name: string;
  isMlo: boolean;
  drawableDictionary: string;
  textureDictionary: string;
  boundsMin: [number, number, number];
  boundsMax: [number, number, number];
  rooms: MloRoom[];
  portals: MloPortal[];
  entities: MloEntity[];
};

export type MloRoom = {
  index: number;
  name: string;
  boundsMin: [number, number, number];
  boundsMax: [number, number, number];
  floorId: number;
  portalCount: number;
  exteriorVisibilityDepth: number;
};

export type MloPortal = {
  index: number;
  roomFrom: number;
  roomTo: number;
  flags: number;
  opacity: number;
  corners: [number, number, number][];
  center: [number, number, number];
};

export type MloEntity = {
  index: number;
  name: string;
  archetype: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scaleXY: number;
  scaleZ: number;
};

export type MloPortalPatch = {
  archetype: string;
  portalIndex: number;
  roomFrom: number;
  roomTo: number;
  flags: number;
  opacity: number;
  corners: [number, number, number][];
};
