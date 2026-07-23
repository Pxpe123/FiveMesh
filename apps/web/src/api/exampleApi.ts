import type { PreviewModel } from "../types/previewModel";

export type ExampleModel = {
  id: string;
  name: string;
  category: string;
  type: "YDR" | "YFT";
  modelFile: string;
  textureFile?: string;
};

export async function requestExamples(): Promise<ExampleModel[]> {
  const response = await fetch("/api/examples");
  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload.filter(isExampleModel) : [];
}

export async function requestExamplePreview(id: string): Promise<PreviewModel> {
  const response = await fetch(`/api/examples/${encodeURIComponent(id)}/preview`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(readErrorMessage(payload));
  }
  if (!isPreviewModel(payload)) {
    throw new Error("The server returned invalid example model data.");
  }

  return payload;
}

function isExampleModel(value: unknown): value is ExampleModel {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof value.id === "string" &&
      "name" in value &&
      typeof value.name === "string" &&
      "category" in value &&
      typeof value.category === "string" &&
      "type" in value &&
      (value.type === "YDR" || value.type === "YFT") &&
      "modelFile" in value &&
      typeof value.modelFile === "string",
  );
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
  return "Unable to load this example.";
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
