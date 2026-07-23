import { useRef, useState } from "react";

import {
  formatFileSize,
  type SelectedModelFiles,
} from "./fileSelection";

type ModelUploadPanelProps = {
  files: SelectedModelFiles;
  loading: boolean;
  error: string;
  onFilesSelected: (files: FileList | File[]) => void;
  onLoad: () => void;
};

export function ModelUploadPanel({
  files,
  loading,
  error,
  onFilesSelected,
  onLoad,
}: ModelUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <aside className="sidebar">
      <div>
        <p className="section-label">Asset input</p>
        <h1>Inspect your GTA V models.</h1>
        <p className="lede">
          Drop a drawable or vehicle fragment with its texture dictionary.
          Files stay on your machine and are only processed by this local server.
        </p>
      </div>

      <button
        type="button"
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onFilesSelected(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ydr,.yft,.ytd"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) {
              onFilesSelected(event.target.files);
            }
          }}
        />
        <span className="drop-icon" aria-hidden="true">
          +
        </span>
        <strong>Drop files here</strong>
        <small>or click to browse · max 300 MB each</small>
      </button>

      <div className="file-list">
        <FileRow label="Model" file={files.model} fallback="YDR / YFT" />
        <FileRow
          label="Textures"
          file={files.textures}
          fallback="YTD · optional"
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        type="button"
        className="load-button"
        disabled={!files.model || loading}
        onClick={onLoad}
      >
        {loading ? <span className="spinner" aria-label="Loading" /> : "View model"}
      </button>

      <div className="research-note">
        <span>CodeWalker pipeline</span>
        <p>RSC7 → drawable LOD → geometry → materials → WebGL</p>
      </div>
    </aside>
  );
}

type FileRowProps = {
  label: string;
  file: File | null;
  fallback: string;
};

function FileRow({ label, file, fallback }: FileRowProps) {
  return (
    <div className={`file-row ${file ? "selected" : ""}`}>
      <span className="file-badge" aria-hidden="true">
        {file ? "✓" : "·"}
      </span>
      <div>
        <strong>{file?.name ?? label}</strong>
        <small>{file ? formatFileSize(file.size) : fallback}</small>
      </div>
    </div>
  );
}
