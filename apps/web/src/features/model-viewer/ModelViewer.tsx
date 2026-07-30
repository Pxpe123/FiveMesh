import { useEffect, useRef } from "react";

import type { PreviewModel } from "../../types/previewModel";
import {
  createViewerSession,
  type ViewerSession,
} from "./viewer/createViewerSession";
import type { VehiclePaintSettings } from "./viewer/vehiclePaint";
import type { ViewerEnvironment } from "./viewer/viewerTools";

type ModelViewerProps = {
  model: PreviewModel | null;
  wireframe: boolean;
  autoRotate: boolean;
  vehiclePaint: VehiclePaintSettings;
  environment: ViewerEnvironment;
  showGrid: boolean;
  showAxes: boolean;
  showBounds: boolean;
  resetCameraToken: number;
  screenshotToken: number;
};

export function ModelViewer({
  model,
  wireframe,
  autoRotate,
  vehiclePaint,
  environment,
  showGrid,
  showAxes,
  showBounds,
  resetCameraToken,
  screenshotToken,
}: ModelViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ViewerSession | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const session = createViewerSession(host, model, {
      wireframe,
      autoRotate,
      environment,
      showGrid,
      showAxes,
      showBounds,
    });
    sessionRef.current = session;

    return () => {
      session.dispose();
      sessionRef.current = null;
    };
  }, [model]);

  useEffect(() => {
    sessionRef.current?.setWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    sessionRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    sessionRef.current?.setVehiclePaint(vehiclePaint);
  }, [vehiclePaint]);

  useEffect(() => {
    sessionRef.current?.setEnvironment(environment);
  }, [environment]);

  useEffect(() => {
    sessionRef.current?.setGridVisible(showGrid);
  }, [showGrid]);

  useEffect(() => {
    sessionRef.current?.setAxesVisible(showAxes);
  }, [showAxes]);

  useEffect(() => {
    sessionRef.current?.setBoundsVisible(showBounds);
  }, [showBounds]);

  useEffect(() => {
    if (resetCameraToken > 0) {
      sessionRef.current?.resetCamera();
    }
  }, [resetCameraToken]);

  useEffect(() => {
    if (screenshotToken > 0) {
      sessionRef.current?.captureScreenshot();
    }
  }, [screenshotToken]);

  return <div ref={hostRef} className="viewer-canvas" />;
}
