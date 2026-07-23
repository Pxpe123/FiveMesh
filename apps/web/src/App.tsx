import { useEffect, useState } from "react";

import {
  requestExamplePreview,
  requestExamples,
  type ExampleModel,
} from "./api/exampleApi";
import { AppHeader } from "./components/AppHeader";
import type { AppPage } from "./constants/pages";
import { HomeScreen } from "./features/home/HomeScreen";
import { ModelUploadPanel } from "./features/model-upload/ModelUploadPanel";
import { useModelPreview } from "./features/model-upload/useModelPreview";
import { ViewerPanel } from "./features/model-viewer/ViewerPanel";

export default function App() {
  const modelPreview = useModelPreview();
  const [activePage, setActivePage] = useState<AppPage>("home");
  const [examples, setExamples] = useState<ExampleModel[]>([]);
  const [examplesLoading, setExamplesLoading] = useState(true);
  const [examplePreviewLoading, setExamplePreviewLoading] = useState(false);
  const [exampleError, setExampleError] = useState("");
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    let mounted = true;

    requestExamples()
      .then((items) => {
        if (mounted) {
          setExamples(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setExampleError("Examples are not available right now.");
        }
      })
      .finally(() => {
        if (mounted) {
          setExamplesLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadExample = async (id: string) => {
    setActivePage("viewer");
    setExampleError("");
    setExamplePreviewLoading(true);
    modelPreview.setPreview(null);
    try {
      modelPreview.setPreview(await requestExamplePreview(id));
    } catch (error) {
      setExampleError(
        error instanceof Error ? error.message : "Unable to load this example.",
      );
    } finally {
      setExamplePreviewLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <AppHeader activePage={activePage} onPageChange={setActivePage} />
      {activePage === "home" ? (
        <HomeScreen
          examples={examples}
          examplesLoading={examplesLoading}
          exampleError={exampleError}
          onOpenApp={setActivePage}
          onLoadExample={loadExample}
        />
      ) : (
        <section className="workspace">
          <ModelUploadPanel
            files={modelPreview.files}
            loading={modelPreview.loading || examplePreviewLoading}
            error={modelPreview.error || exampleError}
            onFilesSelected={modelPreview.selectFiles}
            onLoad={modelPreview.load}
          />
          <ViewerPanel
            model={modelPreview.preview}
            loading={modelPreview.loading || examplePreviewLoading}
            wireframe={wireframe}
            autoRotate={autoRotate}
            onWireframeChange={setWireframe}
            onAutoRotateChange={setAutoRotate}
          />
        </section>
      )}
    </main>
  );
}
