import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import type { ModelUpload } from "../models/modelFiles.js";

export type ExampleType = "YDR" | "YFT";

export type ExampleSummary = {
  id: string;
  name: string;
  category: string;
  type: ExampleType;
  modelFile: string;
  textureFile?: string;
};

type ExampleEntry = ExampleSummary & {
  folderPath: string;
};

const modelExtensions = new Set([".ydr", ".yft"]);

export class ExampleCatalog {
  constructor(private readonly examplesDirectory: string) {}

  async list(): Promise<ExampleSummary[]> {
    const examples = await this.readExamples();
    return examples.map(({ folderPath: _folderPath, ...example }) => example);
  }

  async readUpload(id: string): Promise<ModelUpload> {
    const examples = await this.readExamples();
    const example = examples.find((entry) => entry.id === id);
    if (!example) {
      throw new HttpError(404, "Example model was not found.");
    }

    return {
      model: {
        originalname: example.modelFile,
        buffer: await readFile(path.join(example.folderPath, example.modelFile)),
      },
      textures: example.textureFile
        ? {
            originalname: example.textureFile,
            buffer: await readFile(
              path.join(example.folderPath, example.textureFile),
            ),
          }
        : undefined,
    };
  }

  private async readExamples(): Promise<ExampleEntry[]> {
    const categories = await readChildDirectories(this.examplesDirectory);
    const examples = (
      await Promise.all(
        categories.map((category) => this.readCategoryExamples(category)),
      )
    ).flat();

    return examples
      .filter((example): example is ExampleEntry => Boolean(example))
      .sort(
        (left, right) =>
          left.category.localeCompare(right.category) ||
          left.name.localeCompare(right.name),
      );
  }

  private async readCategoryExamples(category: string) {
    const categoryPath = path.join(this.examplesDirectory, category);
    const folders = await readChildDirectories(categoryPath);
    return Promise.all(
      folders.map((folder) =>
        this.readExampleFolder(category, path.join(categoryPath, folder), folder),
      ),
    );
  }

  private async readExampleFolder(
    category: string,
    folderPath: string,
    folder: string,
  ): Promise<ExampleEntry | null> {
    const files = (await readdir(folderPath)).sort((left, right) =>
      left.localeCompare(right),
    );
    const modelFile = files.find((file) =>
      modelExtensions.has(path.extname(file).toLowerCase()),
    );

    if (!modelFile) {
      return null;
    }

    const textureFile = files.find(
      (file) => path.extname(file).toLowerCase() === ".ytd",
    );

    return {
      id: `${slug(category)}-${slug(folder)}`,
      name: formatExampleName(folder),
      category: formatExampleName(category),
      type: path.extname(modelFile).slice(1).toUpperCase() as ExampleType,
      modelFile,
      textureFile,
      folderPath,
    };
  }
}

async function readChildDirectories(directory: string) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

function formatExampleName(folder: string) {
  return folder
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
