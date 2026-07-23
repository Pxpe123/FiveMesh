import type { AppPage } from "../constants/pages";
import { supportedFormats } from "../constants/pages";

type AppHeaderProps = {
  activePage: AppPage;
  onPageChange: (page: AppPage) => void;
};

export function AppHeader({ activePage, onPageChange }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <button
          type="button"
          className="brand-button"
          onClick={() => onPageChange("home")}
          aria-label="Open FiveMesh home"
        >
          <span className="brand-mark">F</span>
        </button>
        <div>
          <strong>FiveMesh</strong>
          <span>RAGE asset tools</span>
        </div>
      </div>
      <nav className="main-nav" aria-label="FiveMesh apps">
        <button
          type="button"
          className={activePage === "home" ? "active" : ""}
          onClick={() => onPageChange("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={activePage === "viewer" ? "active" : ""}
          onClick={() => onPageChange("viewer")}
        >
          Viewer
        </button>
      </nav>
      <div className="format-pills" aria-label="Supported formats">
        {supportedFormats.map((format) => (
          <span key={format}>{format}</span>
        ))}
      </div>
    </header>
  );
}
