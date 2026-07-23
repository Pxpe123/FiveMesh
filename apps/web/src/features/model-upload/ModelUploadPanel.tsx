import { useRef, useState } from "react";

import type { ExampleModel } from "../../api/exampleApi";
import { formatFileSize, type SelectedModelFiles } from "./fileSelection";

type AssetSource = "existing" | "upload";

type ModelUploadPanelProps = {
  examples: ExampleModel[];
  files: SelectedModelFiles;
  loading: boolean;
  error: string;
  onLoadExample: (id: string) => void;
  onFilesSelected: (files: FileList | File[]) => void;
  onLoad: () => void;
};

export function ModelUploadPanel({
  examples,
  files,
  loading,
  error,
  onLoadExample,
  onFilesSelected,
  onLoad,
}: ModelUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [assetSource, setAssetSource] = useState<AssetSource>("existing");

  return (
    <aside className="sidebar">
      <div>
        <p className="section-label">Viewer source</p>
        <h1>Open an asset.</h1>
        <p className="lede">
          Switch between hosted example assets and your own uploaded files
          without leaving the viewer.
        </p>
      </div>

      <div
        className="source-switch"
        role="radiogroup"
        aria-label="Asset source"
      >
        <button
          type="button"
          role="radio"
          aria-checked={assetSource === "existing"}
          className={assetSource === "existing" ? "active" : ""}
          onClick={() => setAssetSource("existing")}
        >
          Existing assets
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={assetSource === "upload"}
          className={assetSource === "upload" ? "active" : ""}
          onClick={() => setAssetSource("upload")}
        >
          Custom uploads
        </button>
      </div>

      {assetSource === "existing" ? (
        <div className="existing-assets">
          <div className="asset-source-note">
            <strong>Hosted examples</strong>
            <small>Loaded from the server to showcase.</small>
          </div>
          <div className="example-list">
            {examples.length === 0 ? (
              <p className="muted-panel-text">
                Add example folders in `D:\Develop\FiveMesh\examples\assets` and
                they will appear here automatically.
              </p>
            ) : (
              examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className="viewer-example-card"
                  disabled={loading}
                  onClick={() => onLoadExample(example.id)}
                >
                  <div className="viewer-example-top">
                    <span>{example.type}</span>
                    <small>{example.category}</small>
                  </div>
                  <strong>{example.name}</strong>
                  <code>{example.modelFile}</code>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
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
            <strong>Drop asset files here</strong>
            <small>or click to browse - max 300 MB each</small>
          </button>

          <div className="file-list">
            <FileRow
              label="Model asset"
              file={files.model}
              fallback="YDR / YFT"
            />
            <FileListRow
              label="Texture dictionaries"
              files={files.textures}
              fallback="One or more YTD files - optional"
            />
          </div>

          <button
            type="button"
            className="load-button"
            disabled={!files.model || loading}
            onClick={onLoad}
          >
            {loading ? (
              <span className="spinner" aria-label="Loading" />
            ) : (
              "Load upload"
            )}
          </button>
        </>
      )}

      {error && <p className="error-message">{error}</p>}

      <div className="research-note">
        <span>CodeWalker pipeline</span>
        <p>RSC7 - drawable LOD - geometry - materials - WebGL</p>
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
        {file ? "OK" : "-"}
      </span>
      <div>
        <strong>{file?.name ?? label}</strong>
        <small>{file ? formatFileSize(file.size) : fallback}</small>
      </div>
    </div>
  );
}

type FileListRowProps = {
  label: string;
  files: File[];
  fallback: string;
};

function FileListRow({ label, files, fallback }: FileListRowProps) {
  if (files.length === 0) {
    return (
      <div className="file-row">
        <span className="file-badge" aria-hidden="true">
          -
        </span>
        <div>
          <strong>{label}</strong>
          <small>{fallback}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="file-row selected">
      <span className="file-badge" aria-hidden="true">
        {files.length}
      </span>
      <div>
        <strong>
          {files.length} texture {files.length === 1 ? "dictionary" : "dictionaries"}
        </strong>
        <small>{files.map((file) => file.name).join(", ")}</small>
      </div>
    </div>
  );
}
