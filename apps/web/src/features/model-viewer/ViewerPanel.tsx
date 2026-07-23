import type { Dispatch, SetStateAction } from "react";

import type { PreviewModel } from "../../types/previewModel";
import { ModelViewer } from "./ModelViewer";
import {
  getDefaultVehiclePaint,
  isVehiclePreview,
  type VehiclePaintSettings,
} from "./viewer/vehiclePaint";

type ViewerPanelProps = {
  model: PreviewModel | null;
  loading: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  vehiclePaint: VehiclePaintSettings;
  onVehiclePaintChange: Dispatch<SetStateAction<VehiclePaintSettings>>;
  onWireframeChange: Dispatch<SetStateAction<boolean>>;
  onAutoRotateChange: Dispatch<SetStateAction<boolean>>;
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
}: ViewerPanelProps) {
  const showVehiclePaint = isVehiclePreview(model);

  return (
    <section className="viewport-panel">
      <ModelViewer
        model={model}
        wireframe={wireframe}
        autoRotate={autoRotate}
        vehiclePaint={vehiclePaint}
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
        </div>
      )}

      <div className="viewport-help">
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>
    </section>
  );
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
