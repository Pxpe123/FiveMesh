import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { requestExamplePreview } from "../../api/exampleApi";
import { useExamples } from "../examples/useExamples";
import { ModelUploadPanel } from "../model-upload/ModelUploadPanel";
import { useModelPreview } from "../model-upload/useModelPreview";
import { ViewerPanel } from "./ViewerPanel";
import { getDefaultVehiclePaint } from "./viewer/vehiclePaint";
import type { ViewerEnvironment } from "./viewer/viewerTools";

export function ViewerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exampleId = searchParams.get("example");
  const { examples, loading: examplesLoading, error: examplesError } =
    useExamples();
  const modelPreview = useModelPreview();
  const [examplePreviewLoading, setExamplePreviewLoading] = useState(false);
  const [exampleError, setExampleError] = useState("");
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [vehiclePaint, setVehiclePaint] = useState(getDefaultVehiclePaint);
  const [environment, setEnvironment] = useState<ViewerEnvironment>("studio");
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [showBounds, setShowBounds] = useState(false);
  const [resetCameraToken, setResetCameraToken] = useState(0);
  const [screenshotToken, setScreenshotToken] = useState(0);
  useEffect(() => {
    setVehiclePaint(getDefaultVehiclePaint());
  }, [modelPreview.preview?.name]);

  useEffect(() => {
    if (!exampleId) {
      return;
    }

    let active = true;
    setExampleError("");
    setExamplePreviewLoading(true);
    modelPreview.setPreview(null);

    requestExamplePreview(exampleId)
      .then((preview) => {
        if (active) {
          modelPreview.setPreview(preview);
        }
      })
      .catch((error) => {
        if (active) {
          setExampleError(
            error instanceof Error
              ? error.message
              : "Unable to load this example.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setExamplePreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [exampleId, modelPreview.setPreview]);

  const loadExample = (id: string) => {
    navigate(`/viewer?example=${encodeURIComponent(id)}`);
  };

  return (
    <section className="workspace">
      <ModelUploadPanel
        examples={examples}
        files={modelPreview.files}
        loading={modelPreview.loading || examplePreviewLoading}
        error={modelPreview.error || exampleError || examplesError}
        onLoadExample={loadExample}
        onFilesSelected={modelPreview.selectFiles}
        onLoad={modelPreview.load}
      />
      <ViewerPanel
        model={modelPreview.preview}
        loading={
          modelPreview.loading || examplePreviewLoading || examplesLoading
        }
        wireframe={wireframe}
        autoRotate={autoRotate}
        vehiclePaint={vehiclePaint}
        onVehiclePaintChange={setVehiclePaint}
        onWireframeChange={setWireframe}
        onAutoRotateChange={setAutoRotate}
        environment={environment}
        showGrid={showGrid}
        showAxes={showAxes}
        showBounds={showBounds}
        onEnvironmentChange={setEnvironment}
        onGridChange={setShowGrid}
        onAxesChange={setShowAxes}
        onBoundsChange={setShowBounds}
        onResetCamera={() => setResetCameraToken((value) => value + 1)}
        onScreenshot={() => setScreenshotToken((value) => value + 1)}
        resetCameraToken={resetCameraToken}
        screenshotToken={screenshotToken}
      />
    </section>
  );
}
