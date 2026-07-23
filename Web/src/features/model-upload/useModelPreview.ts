import { useCallback, useState } from "react";

import { requestModelPreview } from "../../api/modelPreviewApi";
import type { PreviewModel } from "../../types/previewModel";
import {
  emptyModelFiles,
  mergeSelectedFiles,
  type SelectedModelFiles,
} from "./fileSelection";

export function useModelPreview() {
  const [files, setFiles] = useState<SelectedModelFiles>(emptyModelFiles);
  const [preview, setPreview] = useState<PreviewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectFiles = useCallback((incoming: FileList | File[]) => {
    setFiles((current) => mergeSelectedFiles(current, incoming));
    setError("");
  }, []);

  const load = useCallback(async () => {
    if (!files.model) {
      setError("Add a YDR or YFT model first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setPreview(await requestModelPreview(files));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to read this model.",
      );
    } finally {
      setLoading(false);
    }
  }, [files]);

  return {
    files,
    preview,
    loading,
    error,
    selectFiles,
    load,
  };
}
