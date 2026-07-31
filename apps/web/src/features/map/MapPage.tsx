import { useMemo, useRef, useState } from "react";

type Coordinate = { x: number; y: number; z: number };
type MapType = "roadmap" | "satellite" | "terrain";

const WORLD_BOUNDS = {
  minX: -4000,
  maxX: 4000,
  minY: -4000,
  maxY: 8000,
};

export function MapPage() {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [height, setHeight] = useState("0.0");
  const [copyState, setCopyState] = useState("");
  const [mapType, setMapType] = useState<MapType>("roadmap");

  const selectedCoordinate = useMemo(() => {
    if (!coordinate) return null;
    const z = Number.parseFloat(height);
    return { ...coordinate, z: Number.isFinite(z) ? z : 0 };
  }, [coordinate, height]);

  async function copyCoordinate(value: string, label: string) {
    try {
      await copyText(value);
      setCopyState(label);
      window.setTimeout(() => setCopyState(""), 1600);
    } catch {
      setCopyState("Copy failed");
    }
  }

  return (
    <main className="map-page">
      <section className="map-intro">
        <div>
          <p className="section-label">World tools</p>
          <h1>Los Santos coordinate finder.</h1>
          <p className="lede">
            Click the map to get a ready-to-use FiveM position. Copy it as a
            vector3 value or Lua code for your resource.
          </p>
        </div>
        <div className="map-coordinate-contract">
          <span>Coordinate space</span>
          <strong>GTA V world X / Y / Z</strong>
          <small>North is up · X increases east · Y increases north</small>
        </div>
      </section>

      <section className="map-workspace">
        <div className="map-panel">
          <div className="map-panel-heading">
            <div>
              <span className="section-label">Los Santos / Blaine County</span>
              <strong>Click anywhere to place a marker</strong>
            </div>
            <div className="map-view-switch" role="radiogroup" aria-label="Map view">
              {(["roadmap", "satellite", "terrain"] as MapType[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  role="radio"
                  aria-checked={mapType === view}
                  className={mapType === view ? "active" : ""}
                  onClick={() => setMapType(view)}
                >
                  {view[0].toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <CoordinateMap
            coordinate={selectedCoordinate}
            mapType={mapType}
            onSelect={setCoordinate}
          />
          <div className="map-legend" aria-label="Map legend">
            <span><i className="legend-land" />Landmass</span>
            <span><i className="legend-road" />Major roads</span>
            <span><i className="legend-marker" />Selected point</span>
          </div>
        </div>

        <aside className="coordinate-panel" aria-live="polite">
          <div className="coordinate-panel-heading">
            <span className="section-label">Selected point</span>
            <strong>{selectedCoordinate ? "Ready to use" : "No point selected"}</strong>
          </div>

          {selectedCoordinate ? (
            <>
              <div className="coordinate-readout">
                <CoordinateValue label="X" value={selectedCoordinate.x} />
                <CoordinateValue label="Y" value={selectedCoordinate.y} />
                <CoordinateValue label="Z" value={selectedCoordinate.z} />
              </div>
              <label className="coordinate-height-field">
                <span>Height (Z)</span>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
              </label>
              <div className="coordinate-copy-list">
                <button
                  type="button"
                  className="coordinate-copy-primary"
                  onClick={() =>
                    copyCoordinate(formatVector3(selectedCoordinate), "Copied vector3")
                  }
                >
                  Copy vector3
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyCoordinate(formatLua(selectedCoordinate), "Copied Lua")
                  }
                >
                  Copy Lua
                </button>
              </div>
              <code className="coordinate-code">{formatVector3(selectedCoordinate)}</code>
              <p className="coordinate-note">
                The map gives you the horizontal X/Y position. Set Z to the
                ground or elevation you need for the prop, vehicle, or waypoint.
              </p>
              {copyState && <span className="copy-confirmation">{copyState}</span>}
            </>
          ) : (
            <div className="coordinate-empty">
              <span className="coordinate-crosshair" aria-hidden="true">+</span>
              <p>Click the map to place your first marker.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="map-future-note">
        <div>
          <span className="section-label">Built for the next layer</span>
          <strong>From coordinate finder to full world viewer</strong>
        </div>
        <p>
          FiveMesh can grow from this shared coordinate contract into streamed
          YMAP/YTYP placement, interior portals, collision, and fly-through
          scenes without changing how coordinates are copied into your scripts.
        </p>
      </section>
    </main>
  );
}

function CoordinateMap({
  coordinate,
  mapType,
  onSelect,
}: {
  coordinate: Coordinate | null;
  mapType: MapType;
  onSelect: (coordinate: Coordinate) => void;
}) {
  const mapRef = useRef<HTMLButtonElement>(null);

  function selectFromPointer(clientX: number, clientY: number) {
    const element = mapRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const horizontal = clamp((clientX - bounds.left) / bounds.width);
    const vertical = clamp((clientY - bounds.top) / bounds.height);
    onSelect({
      x: roundCoordinate(WORLD_BOUNDS.minX + horizontal * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)),
      y: roundCoordinate(WORLD_BOUNDS.maxY - vertical * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)),
      z: 0,
    });
  }

  return (
    <button
      ref={mapRef}
      type="button"
      className={`coordinate-map map-view-${mapType}`}
      onClick={(event) => selectFromPointer(event.clientX, event.clientY)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const bounds = mapRef.current?.getBoundingClientRect();
          if (bounds) selectFromPointer(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
        }
      }}
      aria-label="Los Santos map. Click to select a world coordinate."
    >
      <svg className="coordinate-map-art" viewBox="0 0 1000 650" aria-hidden="true">
        <defs>
          <pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#27404b" strokeWidth="1" opacity=".45" />
          </pattern>
          <linearGradient id="land-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={mapType === "satellite" ? "#4e513a" : mapType === "terrain" ? "#4a4631" : "#263c31"} />
            <stop offset="1" stopColor={mapType === "satellite" ? "#252d24" : mapType === "terrain" ? "#27291d" : "#15271f"} />
          </linearGradient>
        </defs>
        <rect width="1000" height="650" fill={mapType === "satellite" ? "#151d1b" : mapType === "terrain" ? "#171b16" : "#0b1720"} />
        <rect width="1000" height="650" fill="url(#map-grid)" />
        <path
          d="M127 78 236 43 365 63 438 35 567 58 688 33 814 83 865 155 835 217 886 291 849 364 873 452 819 508 755 526 713 587 622 572 566 615 473 589 391 608 318 567 225 584 171 526 102 489 133 408 84 342 125 273 97 199Z"
          fill="url(#land-gradient)"
          stroke="#4b7860"
          strokeWidth="3"
        />
        <path d="M127 78 236 43 365 63 438 35 567 58 688 33 814 83 865 155 835 217 886 291 849 364 873 452 819 508 755 526 713 587 622 572 566 615 473 589 391 608 318 567 225 584 171 526 102 489 133 408 84 342 125 273 97 199Z" fill="url(#map-grid)" opacity=".65" />
        <path d="M116 255 C251 209 340 235 454 204 S702 186 859 241" fill="none" stroke={mapType === "satellite" ? "#e0c98a" : "#b3a56d"} strokeWidth="5" opacity=".8" />
        <path d="M132 410 C276 366 332 405 459 373 S702 337 841 390" fill="none" stroke={mapType === "satellite" ? "#e0c98a" : "#b3a56d"} strokeWidth="5" opacity=".75" />
        <path d="M229 91 C273 205 265 302 307 558" fill="none" stroke={mapType === "satellite" ? "#e0c98a" : "#b3a56d"} strokeWidth="4" opacity=".75" />
        <path d="M587 63 C557 204 608 329 566 605" fill="none" stroke={mapType === "satellite" ? "#e0c98a" : "#b3a56d"} strokeWidth="4" opacity=".75" />
        <path d="M386 82 C430 178 432 300 394 591" fill="none" stroke="#6c91a0" strokeWidth="2" strokeDasharray="12 10" opacity=".7" />
        <path d="M720 74 C690 177 739 303 708 548" fill="none" stroke="#6c91a0" strokeWidth="2" strokeDasharray="12 10" opacity=".7" />
        <path d="M98 511 C214 483 276 519 357 550" fill="none" stroke="#4c7888" strokeWidth="13" opacity=".8" />
        <path d="M92 520 C212 493 277 527 352 560" fill="none" stroke="#0b1720" strokeWidth="7" />
        {mapType !== "roadmap" && (
          <g fill="none" stroke={mapType === "satellite" ? "#a2a46d" : "#81764a"} strokeWidth="2" opacity=".42">
            <path d="M160 130 C255 110 324 128 390 105 S562 102 648 128" />
            <path d="M144 162 C245 142 331 161 408 139 S573 133 672 162" />
            <path d="M704 222 C765 210 815 229 846 253" />
            <path d="M685 251 C757 241 817 259 858 287" />
            <path d="M204 470 C278 452 332 468 388 492" />
          </g>
        )}
        <g fill="#9dbdaf" fontFamily="Arial, sans-serif" fontSize="17" letterSpacing="2">
          <text x="416" y="142">VINEWOOD</text>
          <text x="281" y="315">LOS SANTOS</text>
          <text x="603" y="294">EAST LOS SANTOS</text>
          <text x="623" y="475">LOS SANTOS AIRPORT</text>
          <text x="282" y="520">VESPUCCI</text>
          <text x="734" y="145">BLAINE COUNTY</text>
          <text x="118" y="610" fill="#6e9baa">PACIFIC OCEAN</text>
        </g>
        <g fill="#d2c485" opacity=".9">
          <circle cx="430" cy="284" r="7" />
          <circle cx="578" cy="318" r="7" />
          <circle cx="672" cy="405" r="7" />
          <circle cx="337" cy="426" r="7" />
        </g>
      </svg>
      <span className="map-north-indicator">N</span>
      {coordinate && (
        <span
          className="coordinate-marker"
          style={{
            left: `${toMapPercent(coordinate.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX)}%`,
            top: `${toMapPercent(WORLD_BOUNDS.maxY - coordinate.y, 0, WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)}%`,
          }}
          aria-hidden="true"
        >
          <i />
        </span>
      )}
    </button>
  );
}

function CoordinateValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
  );
}

function formatVector3(coordinate: Coordinate) {
  return `vector3(${coordinate.x.toFixed(2)}, ${coordinate.y.toFixed(2)}, ${coordinate.z.toFixed(2)})`;
}

function formatLua(coordinate: Coordinate) {
  return `vec3(${coordinate.x.toFixed(2)}, ${coordinate.y.toFixed(2)}, ${coordinate.z.toFixed(2)})`;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

function toMapPercent(value: number, minimum: number, maximum: number) {
  return clamp((value - minimum) / (maximum - minimum)) * 100;
}
