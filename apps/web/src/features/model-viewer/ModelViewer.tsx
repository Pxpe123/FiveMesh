import { useEffect, useRef } from "react";

import type { PreviewModel } from "../../types/previewModel";
import {
  createViewerSession,
  type ViewerSession,
} from "./viewer/createViewerSession";

type ModelViewerProps = {
  model: PreviewModel | null;
  wireframe: boolean;
  autoRotate: boolean;
};

export function ModelViewer({
  model,
  wireframe,
  autoRotate,
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

  return <div ref={hostRef} className="viewer-canvas" />;
}
