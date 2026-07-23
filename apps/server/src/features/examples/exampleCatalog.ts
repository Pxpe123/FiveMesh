import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import type { ModelUpload } from "../models/modelFiles.js";

export type ExampleSummary = {
  id: string;
  name: string;
  description: string;
  modelFile: string;
  textureFile?: string;
  available: boolean;
};

type ExampleManifestEntry = Omit<ExampleSummary, "available">;

export class ExampleCatalog {
  constructor(private readonly examplesDirectory: string) {}

  async list(): Promise<ExampleSummary[]> {
    const entries = await this.readManifest();
    return Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        available:
          (await exists(this.resolveAssetPath(entry.modelFile))) &&
          (!entry.textureFile ||
            (await exists(this.resolveAssetPath(entry.textureFile)))),
      })),
    );
  }

  async readUpload(id: string): Promise<ModelUpload> {
    const examples = await this.readManifest();
    const example = examples.find((entry) => entry.id === id);
    if (!example) {
      throw new HttpError(404, "Example model was not found.");
    }

    const modelPath = this.resolveAssetPath(example.modelFile);
    const texturePath = example.textureFile
      ? this.resolveAssetPath(example.textureFile)
      : undefined;

    return {
      model: {
        originalname: path.basename(example.modelFile),
        buffer: await readFile(modelPath),
      },
      textures: texturePath
        ? {
            originalname: path.basename(example.textureFile ?? "textures.ytd"),
            buffer: await readFile(texturePath),
          }
        : undefined,
    };
  }

  private async readManifest(): Promise<ExampleManifestEntry[]> {
    const manifestPath = path.join(this.examplesDirectory, "examples.json");
    if (!(await exists(manifestPath))) {
      return [];
    }

    const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      throw new HttpError(500, "Example manifest must be a JSON array.");
    }

    return parsed.filter(isManifestEntry);
  }

  private resolveAssetPath(relativePath: string) {
    const resolved = path.resolve(this.examplesDirectory, relativePath);
    const root = path.resolve(this.examplesDirectory);
    if (!resolved.startsWith(root + path.sep)) {
      throw new HttpError(
        400,
        "Example asset path is outside the examples folder.",
      );
    }

    return resolved;
  }
}

function isManifestEntry(value: unknown): value is ExampleManifestEntry {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof value.id === "string" &&
      "name" in value &&
      typeof value.name === "string" &&
      "description" in value &&
      typeof value.description === "string" &&
      "modelFile" in value &&
      typeof value.modelFile === "string" &&
      (!("textureFile" in value) || typeof value.textureFile === "string"),
  );
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
