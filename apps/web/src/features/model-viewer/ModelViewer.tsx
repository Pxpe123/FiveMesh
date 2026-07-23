import { useEffect, useRef } from "react";

import type { PreviewModel } from "../../types/previewModel";
import {
  createViewerSession,
  type ViewerSession,
} from "./viewer/createViewerSession";
import type { VehiclePaintSettings } from "./viewer/vehiclePaint";

type ModelViewerProps = {
  model: PreviewModel | null;
  wireframe: boolean;
  autoRotate: boolean;
  vehiclePaint: VehiclePaintSettings;
};

export function ModelViewer({
  model,
  wireframe,
  autoRotate,
  vehiclePaint,
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

  return <div ref={hostRef} className="viewer-canvas" />;
}
