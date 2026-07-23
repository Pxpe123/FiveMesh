export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">V</span>
        <div>
          <strong>FiveMesh</strong>
          <span>RAGE asset viewer</span>
        </div>
      </div>
      <div className="format-pills" aria-label="Supported formats">
        <span>YDR</span>
        <span>YFT</span>
        <span>YTD</span>
      </div>
    </header>
  );
}
