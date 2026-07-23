import type {
  ErrorRequestHandler,
  RequestHandler,
} from "express";
import multer from "multer";

import { HttpError } from "../errors/HttpError.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "Route not found." });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "One of the selected files is too large."
        : error.message;
    response.status(400).json({ message });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "The server could not complete the request." });
};
