import type { MloPortalPatch, MloPreview } from "../types/mloPreview";
import { apiUrl } from "./apiBase";

export async function requestMloPreview(
  ytyp: File,
  drawables: File[],
  textures: File[],
): Promise<MloPreview> {
  const form = new FormData();
  form.append("ytyp", ytyp);
  drawables.forEach((file) => form.append("drawables", file));
  textures.forEach((file) => form.append("textures", file));

  const response = await fetch(apiUrl("/api/mlo/preview"), {
    method: "POST",
    body: form,
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(readMessage(payload, "Unable to inspect this YTYP."));
  }

  if (!isMloPreview(payload)) {
    throw new Error("The server returned an invalid MLO preview.");
  }
  return payload;
}

export async function editMloPortal(
  ytyp: File,
  patch: MloPortalPatch,
): Promise<Blob> {
  const form = new FormData();
  form.append("ytyp", ytyp);
  form.append(
    "patch",
    new Blob([JSON.stringify(patch)], { type: "application/json" }),
    "portal-patch.json",
  );

  const response = await fetch(apiUrl("/api/mlo/edit-portal"), {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const payload: unknown = await response.json();
    throw new Error(readMessage(payload, "Unable to edit this portal."));
  }
  return response.blob();
}

function readMessage(payload: unknown, fallback: string) {
  return typeof payload === "object" && payload !== null && "message" in payload
    ? String(payload.message)
    : fallback;
}

function isMloPreview(value: unknown): value is MloPreview {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1 &&
    "name" in value &&
    typeof value.name === "string" &&
    "archetypes" in value &&
    Array.isArray(value.archetypes)
  );
}
