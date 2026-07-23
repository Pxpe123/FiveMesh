export type SelectedModelFiles = {
  model: File | null;
  textures: File[];
};

export const emptyModelFiles: SelectedModelFiles = {
  model: null,
  textures: [],
};

export function mergeSelectedFiles(
  current: SelectedModelFiles,
  incoming: FileList | File[],
): SelectedModelFiles {
  const selected = Array.from(incoming);
  return {
    model:
      selected.find((file) => /\.(ydr|yft)$/i.test(file.name)) ??
      current.model,
    textures: mergeTextureFiles(current.textures, selected),
  };
}

function mergeTextureFiles(current: File[], incoming: File[]) {
  const textureFiles = incoming.filter((file) => /\.ytd$/i.test(file.name));
  if (textureFiles.length === 0) {
    return current;
  }

  const byName = new Map<string, File>();
  for (const file of current) {
    byName.set(file.name.toLowerCase(), file);
  }
  for (const file of textureFiles) {
    byName.set(file.name.toLowerCase(), file);
  }

  return Array.from(byName.values());
}

export function formatFileSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
