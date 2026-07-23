export type SelectedModelFiles = {
  model: File | null;
  textures: File | null;
};

export const emptyModelFiles: SelectedModelFiles = {
  model: null,
  textures: null,
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
    textures:
      selected.find((file) => /\.ytd$/i.test(file.name)) ??
      current.textures,
  };
}

export function formatFileSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
