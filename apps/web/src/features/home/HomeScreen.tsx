import type { ExampleModel } from "../../api/exampleApi";
import { fiveMeshApps, type AppPage } from "../../constants/pages";

type HomeScreenProps = {
  examples: ExampleModel[];
  examplesLoading: boolean;
  exampleError: string;
  onOpenApp: (page: AppPage) => void;
  onLoadExample: (id: string) => void;
};

export function HomeScreen({
  examples,
  examplesLoading,
  exampleError,
  onOpenApp,
  onLoadExample,
}: HomeScreenProps) {
  return (
    <section className="home-screen">
      <div className="home-intro">
        <p className="section-label">FiveMesh platform</p>
        <h1>Browser-based tools for GTA V model inspection.</h1>
        <p className="lede">
          FiveMesh decodes RAGE model files through a dedicated Engine, serves
          the result through a small API, and renders the preview in WebGL. The
          first app is the model viewer, with room for editing and batch tools
          later.
        </p>
        <button
          type="button"
          className="primary-action"
          onClick={() => onOpenApp("viewer")}
        >
          Open viewer
        </button>
      </div>

      <div className="home-section">
        <div className="section-heading">
          <p className="section-label">Apps</p>
          <h2>FiveMesh tools</h2>
        </div>
        <div className="app-grid">
          {fiveMeshApps.map((app) => (
            <button
              key={app.name}
              type="button"
              className="app-card"
              disabled={app.status !== "available"}
              onClick={() => onOpenApp(app.id)}
            >
              <span>{app.status}</span>
              <strong>{app.name}</strong>
              <small>{app.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-heading">
          <p className="section-label">Examples</p>
          <h2>Try a prepared model</h2>
        </div>
        <div className="examples-panel">
          {examplesLoading && <p className="muted-text">Loading examples...</p>}
          {exampleError && <p className="error-message">{exampleError}</p>}
          {!examplesLoading && examples.length === 0 && (
            <p className="muted-text">
              Example models will appear here once they are added to the hosted
              app.
            </p>
          )}
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              className="example-card"
              onClick={() => onLoadExample(example.id)}
            >
              <span>{example.type}</span>
              <strong>{example.name}</strong>
              <small>
                {example.category} example loaded from the hosted FiveMesh
                examples folder.
              </small>
              <code>{example.modelFile}</code>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
