import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import { EngineClient } from "../../services/EngineClient.js";
import type { MloEditUpload } from "./mloFiles.js";

export class MloEditService {
  constructor(private readonly engine: EngineClient) {}

  async editPortal(upload: MloEditUpload) {
    const workDirectory = await mkdtemp(path.join(tmpdir(), "fivemesh-mlo-edit-"));
    const ytypPath = path.join(workDirectory, "interior.ytyp");
    const patchPath = path.join(workDirectory, "portal-patch.json");
    const outputPath = path.join(workDirectory, "edited.ytyp");

    try {
      await Promise.all([
        writeFile(ytypPath, upload.ytyp.buffer),
        writeFile(patchPath, upload.patch.buffer),
      ]);
      await this.engine.editMloPortal(ytypPath, patchPath, outputPath);
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
    if (stderr) return stderr;
  }

  return error instanceof Error ? error.message : "The MLO portal could not be edited.";
}
