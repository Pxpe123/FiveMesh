import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import { EngineClient } from "../../services/EngineClient.js";
import type { MloUpload } from "./mloFiles.js";

export class MloPreviewService {
  constructor(private readonly engine: EngineClient) {}

  async createPreview(upload: MloUpload) {
    const workDirectory = await mkdtemp(path.join(tmpdir(), "fivemesh-mlo-"));
    const ytypPath = path.join(workDirectory, "interior.ytyp");
    const outputPath = path.join(workDirectory, "mlo-preview.json");

    try {
      await writeFile(ytypPath, upload.ytyp.buffer);
      const assetPaths = [
        ...upload.drawables.map((file) => path.join(workDirectory, path.basename(file.originalname))),
      ];
      await Promise.all([
        ...upload.drawables.map((file) => writeFile(path.join(workDirectory, path.basename(file.originalname)), file.buffer)),
        ...upload.textures.map((file) => writeFile(path.join(workDirectory, path.basename(file.originalname)), file.buffer)),
      ]);

      await this.engine.createMloPreview(ytypPath, outputPath, assetPaths);
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
    : "The MLO definition could not be inspected.";
}
