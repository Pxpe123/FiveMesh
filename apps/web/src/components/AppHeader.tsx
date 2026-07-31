import { NavLink } from "react-router-dom";
import { supportedFormats } from "../constants/pages";

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand">
        <NavLink className="brand-button" to="/" aria-label="Open FiveMesh home">
          <span className="brand-mark">F</span>
        </NavLink>
        <div>
          <strong>FiveMesh</strong>
          <span>RAGE asset tools</span>
        </div>
      </div>
      <nav className="main-nav" aria-label="FiveMesh apps">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/viewer"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Viewer
        </NavLink>
        <NavLink
          to="/converter"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Converter
        </NavLink>
        <NavLink
          to="/mlo"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          MLO
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Map
        </NavLink>
        <NavLink
          to="/games/hack-practice"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Games
        </NavLink>
      </nav>
      <div className="format-pills" aria-label="Supported formats">
        {supportedFormats.map((format) => (
          <span key={format}>{format}</span>
        ))}
      </div>
    </header>
  );
}
