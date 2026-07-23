import type { SelectedModelFiles } from "../features/model-upload/fileSelection";
import type { PreviewModel } from "../types/previewModel";
import { apiUrl } from "./apiBase";

export async function requestModelPreview(
  files: SelectedModelFiles,
): Promise<PreviewModel> {
  if (!files.model) {
    throw new Error("Add a YDR or YFT model first.");
  }

  const body = new FormData();
  body.append("model", files.model);
  for (const texture of files.textures) {
    body.append("textures", texture);
  }

  const response = await fetch(apiUrl("/api/models/preview"), {
    method: "POST",
    body,
  });
  const responseText = await response.text();
  const payload = parseResponse(responseText);

  if (!response.ok) {
    throw new Error(readErrorMessage(payload));
  }
  if (!isPreviewModel(payload)) {
    throw new Error("The server returned invalid model data.");
  }

  return payload;
}

function parseResponse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }
  return "Unable to read this model.";
}

function isPreviewModel(payload: unknown): payload is PreviewModel {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "version" in payload &&
      payload.version === 1 &&
      "meshes" in payload &&
      Array.isArray(payload.meshes) &&
      "textures" in payload &&
      Array.isArray(payload.textures),
  );
}
