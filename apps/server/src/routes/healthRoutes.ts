import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "FiveMesh Server",
    timestamp: new Date().toISOString(),
  });
});
