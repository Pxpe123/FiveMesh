import { useState } from "react";

import { AppHeader } from "./components/AppHeader";
import { ModelUploadPanel } from "./features/model-upload/ModelUploadPanel";
import { useModelPreview } from "./features/model-upload/useModelPreview";
import { ViewerPanel } from "./features/model-viewer/ViewerPanel";

export default function App() {
  const modelPreview = useModelPreview();
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <main className="app-shell">
      <AppHeader />
      <section className="workspace">
        <ModelUploadPanel
          files={modelPreview.files}
          loading={modelPreview.loading}
          error={modelPreview.error}
          onFilesSelected={modelPreview.selectFiles}
          onLoad={modelPreview.load}
        />
        <ViewerPanel
          model={modelPreview.preview}
          loading={modelPreview.loading}
          wireframe={wireframe}
          autoRotate={autoRotate}
          onWireframeChange={setWireframe}
          onAutoRotateChange={setAutoRotate}
        />
      </section>
    </main>
  );
}
