import type { Dispatch, SetStateAction } from "react";

import type { PreviewModel } from "../../types/previewModel";
import { ModelViewer } from "./ModelViewer";
import {
  getDefaultVehiclePaint,
  isVehiclePreview,
  type VehiclePaintSettings,
} from "./viewer/vehiclePaint";
import {
  viewerEnvironments,
  type ViewerEnvironment,
} from "./viewer/viewerTools";

type ViewerPanelProps = {
  model: PreviewModel | null;
  loading: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  vehiclePaint: VehiclePaintSettings;
  onVehiclePaintChange: Dispatch<SetStateAction<VehiclePaintSettings>>;
  onWireframeChange: Dispatch<SetStateAction<boolean>>;
  onAutoRotateChange: Dispatch<SetStateAction<boolean>>;
  environment: ViewerEnvironment;
  showGrid: boolean;
  showAxes: boolean;
  showBounds: boolean;
  onEnvironmentChange: Dispatch<SetStateAction<ViewerEnvironment>>;
  onGridChange: Dispatch<SetStateAction<boolean>>;
  onAxesChange: Dispatch<SetStateAction<boolean>>;
  onBoundsChange: Dispatch<SetStateAction<boolean>>;
  onResetCamera: () => void;
  onScreenshot: () => void;
  resetCameraToken: number;
  screenshotToken: number;
};

export function ViewerPanel({
  model,
  loading,
  wireframe,
  autoRotate,
  vehiclePaint,
  onVehiclePaintChange,
  onWireframeChange,
  onAutoRotateChange,
  environment,
  showGrid,
  showAxes,
  showBounds,
  onEnvironmentChange,
  onGridChange,
  onAxesChange,
  onBoundsChange,
  onResetCamera,
  onScreenshot,
  resetCameraToken,
  screenshotToken,
}: ViewerPanelProps) {
  const showVehiclePaint = isVehiclePreview(model);

  return (
    <section className="viewport-panel">
      <ModelViewer
        model={model}
        wireframe={wireframe}
        autoRotate={autoRotate}
        vehiclePaint={vehiclePaint}
        environment={environment}
        showGrid={showGrid}
        showAxes={showAxes}
        showBounds={showBounds}
        resetCameraToken={resetCameraToken}
        screenshotToken={screenshotToken}
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
        <button
          type="button"
          className={showGrid ? "active" : ""}
          aria-pressed={showGrid}
          onClick={() => onGridChange((value) => !value)}
        >
          Grid
        </button>
        <button
          type="button"
          className={showAxes ? "active" : ""}
          aria-pressed={showAxes}
          onClick={() => onAxesChange((value) => !value)}
        >
          Axes
        </button>
        <button
          type="button"
          className={showBounds ? "active" : ""}
          aria-pressed={showBounds}
          onClick={() => onBoundsChange((value) => !value)}
          disabled={!model}
        >
          Bounds
        </button>
        <label className="viewer-environment">
          <span>Light</span>
          <select
            value={environment}
            onChange={(event) =>
              onEnvironmentChange(event.target.value as ViewerEnvironment)
            }
          >
            {Object.entries(viewerEnvironments).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onResetCamera} disabled={!model}>
          Reset view
        </button>
        <button type="button" onClick={onScreenshot} disabled={!model}>
          Screenshot
        </button>
      </div>

      {showVehiclePaint && (
        <div className="vehicle-paint-panel">
          <div className="vehicle-paint-heading">
            <strong>Vehicle paint</strong>
            <button
              type="button"
              onClick={() => onVehiclePaintChange(getDefaultVehiclePaint())}
            >
              Reset
            </button>
          </div>

          <PaintField
            label="Primary"
            value={vehiclePaint.primary}
            onChange={(value) =>
              onVehiclePaintChange((current) => ({ ...current, primary: value }))
            }
          />
          <PaintField
            label="Secondary"
            value={vehiclePaint.secondary}
            onChange={(value) =>
              onVehiclePaintChange((current) => ({ ...current, secondary: value }))
            }
          />
          <PaintField
            label="Rims"
            value={vehiclePaint.rim}
            onChange={(value) =>
              onVehiclePaintChange((current) => ({ ...current, rim: value }))
            }
          />
        </div>
      )}

      {model && (
        <div className="model-stats">
          <strong>{model.name}</strong>
          <span>{model.meshes.length} meshes</span>
          <span>{model.textures.length} textures</span>
          <span>{formatTriangleCount(model)} tris</span>
        </div>
      )}

      <div className="viewport-help">
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>
    </section>
  );
}

function formatTriangleCount(model: PreviewModel) {
  const triangles = model.meshes.reduce(
    (total, mesh) => total + Math.floor(mesh.indices.length / 3),
    0,
  );
  return triangles.toLocaleString();
}

type PaintFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function PaintField({ label, value, onChange }: PaintFieldProps) {
  return (
    <label className="paint-field">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
