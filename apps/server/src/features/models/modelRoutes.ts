import { Router } from "express";
import multer from "multer";

import type { AppConfig } from "../../config.js";
import { EngineClient } from "../../services/EngineClient.js";
import { readModelUpload } from "./modelFiles.js";
import { ModelPreviewService } from "./modelPreviewService.js";

export const createModelRouter = (config: AppConfig) => {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 6 },
  });
  const previewService = new ModelPreviewService(
    new EngineClient(
      config.engineProjectPath,
      config.engineExecutablePath,
      config.engineTimeoutMs,
    ),
  );

  router.post(
    "/preview",
    upload.fields([
      { name: "model", maxCount: 1 },
      { name: "textures", maxCount: 5 },
    ]),
    async (request, response) => {
      const files = readModelUpload(request.files);
      const preview = await previewService.createPreview(files);
      response.type("application/json").send(preview);
    },
  );

  return router;
};
