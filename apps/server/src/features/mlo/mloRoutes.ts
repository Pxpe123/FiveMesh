import { Router } from "express";
import multer from "multer";

import type { AppConfig } from "../../config.js";
import { EngineClient } from "../../services/EngineClient.js";
import { MloPreviewService } from "./mloPreviewService.js";
import { MloEditService } from "./mloEditService.js";
import { readMloEditUpload, readMloUpload } from "./mloFiles.js";

export const createMloRouter = (config: AppConfig) => {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: config.maxMloFiles },
  });
  const previewService = new MloPreviewService(
    new EngineClient(
      config.engineProjectPath,
      config.engineExecutablePath,
      config.engineTimeoutMs,
    ),
  );
  const editService = new MloEditService(
    new EngineClient(
      config.engineProjectPath,
      config.engineExecutablePath,
      config.engineTimeoutMs,
    ),
  );

  router.post(
    "/preview",
    upload.fields([
      { name: "ytyp", maxCount: 1 },
      { name: "drawables", maxCount: config.maxMloFiles - 1 },
      { name: "textures", maxCount: config.maxMloFiles - 1 },
    ]),
    async (request, response) => {
      const preview = await previewService.createPreview(readMloUpload(request.files));
      response.type("application/json").send(preview);
    },
  );

  router.post(
    "/edit-portal",
    upload.fields([
      { name: "ytyp", maxCount: 1 },
      { name: "patch", maxCount: 1 },
    ]),
    async (request, response) => {
      const output = await editService.editPortal(readMloEditUpload(request.files));
      response
        .type("application/octet-stream")
        .attachment("edited-mlo.ytyp")
        .send(output);
    },
  );

  return router;
};
