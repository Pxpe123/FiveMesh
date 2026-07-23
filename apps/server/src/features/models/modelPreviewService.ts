import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import { EngineClient } from "../../services/EngineClient.js";
import { extensionOf, type ModelUpload } from "./modelFiles.js";

export class ModelPreviewService {
  constructor(private readonly engine: EngineClient) {}

  async createPreview(upload: ModelUpload) {
    const workDirectory = await mkdtemp(path.join(tmpdir(), "fivemesh-"));
    const modelPath = path.join(workDirectory, `model${extensionOf(upload.model)}`);
    const texturePaths = upload.textures.map((texture, index) =>
      path.join(workDirectory, `textures-${index + 1}.ytd`),
    );
    const outputPath = path.join(workDirectory, "preview.json");

    try {
      await writeFile(modelPath, upload.model.buffer);
      await Promise.all(
        upload.textures.map((texture, index) =>
          writeFile(texturePaths[index], texture.buffer),
        ),
      );

      await this.engine.createPreview(modelPath, outputPath, texturePaths);
      return await readFile(outputPath);
    } catch (error) {
      throw new HttpError(422, engineErrorMessage(error));
    } finally {
      await rm(workDirectory, { recursive: true, force: true });
    }
  }
}

function engineErrorMessage(error: unknown) {
  if (error instanceof Error && "stderr" in error) {
    const stderr = String(error.stderr).trim();
    if (stderr) {
      return stderr;
    }
  }

  return error instanceof Error
    ? error.message
    : "The model could not be converted.";
}
