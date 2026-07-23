import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";

export type ModelUpload = {
  model: Express.Multer.File;
  textures?: Express.Multer.File;
};

const supportedModelExtensions = new Set([".ydr", ".yft"]);

export function readModelUpload(
  files: Express.Request["files"],
): ModelUpload {
  const fields = files as
    | Record<string, Express.Multer.File[]>
    | undefined;
  const model = fields?.model?.[0];
  const textures = fields?.textures?.[0];

  if (!model || !supportedModelExtensions.has(extensionOf(model))) {
    throw new HttpError(400, "Choose a .ydr or .yft model file.");
  }

  if (textures && extensionOf(textures) !== ".ytd") {
    throw new HttpError(400, "The texture file must be a .ytd.");
  }

  return { model, textures };
}

export function extensionOf(file: Express.Multer.File) {
  return path.extname(file.originalname).toLowerCase();
}
