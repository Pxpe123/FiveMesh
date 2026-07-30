import { Link } from "react-router-dom";
import { fiveMeshApps, plannedFeatures } from "../../constants/pages";
import { useExamples } from "../examples/useExamples";

export function HomeScreen() {
  const {
    examples,
    loading: examplesLoading,
    error: exampleError,
  } = useExamples();
  return (
    <section className="home-screen">
      <div className="home-intro">
        <p className="section-label">FiveMesh platform</p>
        <h1>Browser-based tools for GTA V model inspection.</h1>
        <p className="lede">
          FiveMesh decodes RAGE model files through a dedicated Engine, serves
          the result through a small API, and renders the preview in WebGL. The
          model viewer and MLO workspace are the first tools, with room for
          map, editing, and batch workflows later.
        </p>
        <Link className="primary-action" to="/games/hack-practice">
          Practice Hacks
        </Link>
        <Link className="secondary-action" to="/viewer">
          Open model viewer
        </Link>
      </div>

      <section className="featured-practice" aria-labelledby="practice-heading">
        <div className="featured-practice-copy">
          <p className="section-label">FiveM RP practice games</p>
          <h2 id="practice-heading">Practice Hacks</h2>
          <p>
            Rehearse the ATM pipe-connection hack in your browser before using
            it in an RP server.
          </p>
        </div>
        <Link className="featured-practice-action" to="/games/hack-practice">
          Open Practice Hacks <span aria-hidden="true">→</span>
        </Link>
      </section>

      <div className="home-section">
        <div className="section-heading">
          <p className="section-label">Apps</p>
          <h2>FiveMesh tools</h2>
        </div>
        <div className="app-grid">
          {fiveMeshApps.map((app) => (
            <Link
              key={app.name}
              className={`app-card ${app.status !== "available" ? "planned" : ""}`}
              to={app.status === "available" ? app.path : "#"}
              aria-disabled={app.status !== "available"}
              onClick={(event) => {
                if (app.status !== "available") event.preventDefault();
              }}
            >
              <span>{app.id === "hack-practice" ? "featured game" : app.status}</span>
              <strong>{app.name}</strong>
              <small>{app.description}</small>
            </Link>
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
            <Link
              key={example.id}
              className="example-card"
              to={`/viewer?example=${encodeURIComponent(example.id)}`}
            >
              <span>{example.type}</span>
              <strong>{example.name}</strong>
              <small>
                {example.category} example loaded from the hosted FiveMesh
                examples folder.
              </small>
              <code>{example.modelFile}</code>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-heading">
          <p className="section-label">Coming soon</p>
          <h2>Where FiveMesh is heading next</h2>
        </div>
        <div className="coming-soon-panel">
          <div className="coming-soon-intro">
            <strong>Viewer expansion</strong>
            <p className="muted-text">
              The next step is broadening the viewer beyond drawables and
              vehicle fragments so map and MLO workflows can live in the same
              toolset.
            </p>
          </div>

          <div className="coming-soon-grid">
            {plannedFeatures.map((feature) => (
              <article key={feature.name} className="coming-soon-card">
                <span>{feature.stage}</span>
                <strong>{feature.name}</strong>
                <small>{feature.description}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
