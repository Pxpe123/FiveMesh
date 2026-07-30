import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";

export type MloUpload = {
  ytyp: MloFile;
  drawables: MloFile[];
  textures: MloFile[];
};

export type MloEditUpload = {
  ytyp: MloFile;
  patch: MloFile;
};

export type MloFile = {
  originalname: string;
  buffer: Buffer;
};

export function readMloUpload(
  files: Express.Request["files"],
): MloUpload {
  const fields = files as
    | Record<string, Express.Multer.File[]>
    | undefined;
  const ytyp = fields?.ytyp?.[0];
  const drawables = fields?.drawables ?? [];
  const textures = fields?.textures ?? [];

  if (!ytyp || extensionOf(ytyp) !== ".ytyp") {
    throw new HttpError(400, "Choose a .ytyp archetype file first.");
  }

  if (drawables.some((file) => extensionOf(file) !== ".ydr")) {
    throw new HttpError(400, "MLO drawable assets must be .ydr files.");
  }

  if (textures.some((file) => extensionOf(file) !== ".ytd")) {
    throw new HttpError(400, "MLO texture dictionaries must be .ytd files.");
  }

  return { ytyp, drawables, textures };
}

export function readMloEditUpload(
  files: Express.Request["files"],
): MloEditUpload {
  const fields = files as
    | Record<string, Express.Multer.File[]>
    | undefined;
  const ytyp = fields?.ytyp?.[0];
  const patch = fields?.patch?.[0];

  if (!ytyp || extensionOf(ytyp) !== ".ytyp") {
    throw new HttpError(400, "Choose the original .ytyp file to edit.");
  }

  if (!patch || extensionOf(patch) !== ".json") {
    throw new HttpError(400, "The MLO edit patch is missing.");
  }

  return { ytyp, patch };
}

export function extensionOf(file: MloFile) {
  return path.extname(file.originalname).toLowerCase();
}
