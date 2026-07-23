import cors from "cors";
import express from "express";

import { loadConfig, type AppConfig } from "./config.js";
import { createExampleRouter } from "./features/examples/exampleRoutes.js";
import { createModelRouter } from "./features/models/modelRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { healthRouter } from "./routes/healthRoutes.js";

export const createApp = (config: AppConfig = loadConfig()) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, origin ?? true);
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", healthRouter);
  app.use("/api/examples", createExampleRouter(config));
  app.use("/api/models", createModelRouter(config));

  if (config.webDirectory) {
    app.use(express.static(config.webDirectory));
    app.use((request, response, next) => {
      if (
        request.method !== "GET" ||
        request.path === "/api" ||
        request.path.startsWith("/api/") ||
        !request.accepts("html")
      ) {
        next();
        return;
      }

      response.sendFile("index.html", { root: config.webDirectory }, (error) => {
        if (error) {
          next(error);
        }
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
