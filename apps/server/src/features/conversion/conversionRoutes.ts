import { Router } from "express";
import multer from "multer";

import type { AppConfig } from "../../config.js";
import { EngineClient } from "../../services/EngineClient.js";
import { ConversionService } from "./conversionService.js";

export const createConversionRouter = (config: AppConfig) => {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxUploadBytes,
      files: config.maxConversionFiles,
    },
  });
  const service = new ConversionService(
    new EngineClient(
      config.engineProjectPath,
      config.engineExecutablePath,
      config.engineTimeoutMs,
    ),
  );

  router.post(
    "/binary-to-xml",
    upload.single("asset"),
    async (request, response) => {
      const asset = request.file;
      if (!asset) {
        response
          .status(400)
          .json({ message: "Choose a YDR, YFT, or YTD file." });
        return;
      }

      const result = await service.binaryToXml(asset);
      sendDownload(response, result);
    },
  );

  router.post(
    "/xml-to-binary",
    upload.fields([
      { name: "asset", maxCount: 1 },
      { name: "textures", maxCount: config.maxConversionFiles - 1 },
    ]),
    async (request, response) => {
      const fields = request.files as
        | Record<string, Express.Multer.File[]>
        | undefined;
      const xml = fields?.asset?.[0];
      if (!xml) {
        response.status(400).json({ message: "Choose an XML file." });
        return;
      }

      const result = await service.xmlToBinary(
        xml,
        fields?.textures ?? [],
        String(request.body.targetFormat ?? ""),
      );
      sendDownload(response, result);
    },
  );

  return router;
};

function sendDownload(
  response: import("express").Response,
  result: Awaited<ReturnType<ConversionService["binaryToXml"]>>,
) {
  response.type(result.contentType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${result.filename}"`,
  );
  response.send(result.body);
}
