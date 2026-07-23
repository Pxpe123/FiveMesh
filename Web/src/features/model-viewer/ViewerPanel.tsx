import type { Dispatch, SetStateAction } from "react";

import type { PreviewModel } from "../../types/previewModel";
import { ModelViewer } from "./ModelViewer";

type ViewerPanelProps = {
  model: PreviewModel | null;
  loading: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  onWireframeChange: Dispatch<SetStateAction<boolean>>;
  onAutoRotateChange: Dispatch<SetStateAction<boolean>>;
};

export function ViewerPanel({
  model,
  loading,
  wireframe,
  autoRotate,
  onWireframeChange,
  onAutoRotateChange,
}: ViewerPanelProps) {
  return (
    <section className="viewport-panel">
      <ModelViewer
        model={model}
        wireframe={wireframe}
        autoRotate={autoRotate}
      />

      {!model && !loading && (
        <div className="empty-state">
          <div className="empty-orbit">
            <span />
          </div>
          <strong>Your model appears here</strong>
          <p>Load a YDR prop or YFT vehicle to begin.</p>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <span className="large-spinner" />
          <strong>Decoding RAGE resources…</strong>
          <p>Extracting geometry, materials, and DDS textures.</p>
        </div>
      )}

      <div className="viewer-toolbar">
        <button
          type="button"
          className={autoRotate ? "active" : ""}
          aria-pressed={autoRotate}
          onClick={() => onAutoRotateChange((value) => !value)}
        >
          Rotate
        </button>
        <button
          type="button"
          className={wireframe ? "active" : ""}
          aria-pressed={wireframe}
          onClick={() => onWireframeChange((value) => !value)}
        >
          Wireframe
        </button>
      </div>

      {model && (
        <div className="model-stats">
          <strong>{model.name}</strong>
          <span>{model.meshes.length} meshes</span>
          <span>{model.textures.length} textures</span>
        </div>
      )}

      <div className="viewport-help">
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>
    </section>
  );
}
