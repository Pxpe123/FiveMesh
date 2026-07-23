import { Router } from "express";

import type { AppConfig } from "../../config.js";
import { EngineClient } from "../../services/EngineClient.js";
import { ModelPreviewService } from "../models/modelPreviewService.js";
import { ExampleCatalog } from "./exampleCatalog.js";

export const createExampleRouter = (config: AppConfig) => {
  const router = Router();
  const catalog = new ExampleCatalog(config.examplesDirectory);
  const previewService = new ModelPreviewService(
    new EngineClient(
      config.engineProjectPath,
      config.engineExecutablePath,
      config.engineTimeoutMs,
    ),
  );

  router.get("/", async (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.json(await catalog.list());
  });

  router.get("/:id/preview", async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const upload = await catalog.readUpload(request.params.id);
    const preview = await previewService.createPreview(upload);
    response.type("application/json").send(preview);
  });

  return router;
};
