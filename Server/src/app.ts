import cors from "cors";
import express from "express";

import { loadConfig, type AppConfig } from "./config.js";
import { createModelRouter } from "./features/models/modelRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { healthRouter } from "./routes/healthRoutes.js";

export const createApp = (config: AppConfig = loadConfig()) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", healthRouter);
  app.use("/api/models", createModelRouter(config));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
