import { useEffect, useMemo, useRef, useState } from "react";

import {
  createMarkerId,
  getCustomMarkerIconLabel,
  loadCustomMarkers,
  saveCustomMarkers,
  type CustomMapMarker,
  type CustomMarkerIcon,
} from "./customMarkers";
import { CustomMarkerEditor } from "./CustomMarkerEditor";
import { MapMarkerIcon } from "./MapMarkerIcon";

import {
  findDrivingRoute,
  WORLD_BOUNDS,
  worldToMapPoint,
  type DrivingRoute,
  type WorldCoordinate,
} from "./mapRouting";
import {
  importantMapLocations,
  mapLocationCategories,
  type MapLocation,
} from "./mapLocations";

type Coordinate = WorldCoordinate;
type MapType = "roadmap" | "satellite" | "atlas";
type PlacementMode = "start" | "waypoint" | "marker";

const MAP_VIEW_WIDTH = 1000;
const MAP_VIEW_HEIGHT = 1300;

export function MapPage() {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [height, setHeight] = useState("0.0");
  const [copyState, setCopyState] = useState("");
  const [mapType, setMapType] = useState<MapType>("roadmap");
  const [placementMode, setPlacementMode] = useState<PlacementMode>("start");
  const [routeStart, setRouteStart] = useState<Coordinate | null>(null);
  const [waypoint, setWaypoint] = useState<Coordinate | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [customMarkers, setCustomMarkers] = useState(loadCustomMarkers);
  const [selectedCustomMarkerId, setSelectedCustomMarkerId] = useState("");
  const [markerName, setMarkerName] = useState("");
  const [markerIcon, setMarkerIcon] = useState<CustomMarkerIcon>("pin");
  const [markerMessage, setMarkerMessage] = useState("");

  const selectedCoordinate = useMemo(() => {
    if (!coordinate) return null;
    const z = Number.parseFloat(height);
    return { ...coordinate, z: Number.isFinite(z) ? z : 0 };
  }, [coordinate, height]);

  const drivingRoute = useMemo(
    () => routeStart && waypoint ? findDrivingRoute(routeStart, waypoint) : null,
    [routeStart, waypoint],
  );
  const selectedLocation = useMemo(
    () => importantMapLocations.find((item) => item.id === selectedLocationId) ?? null,
    [selectedLocationId],
  );
  const selectedCustomMarker = useMemo(
    () => customMarkers.find((item) => item.id === selectedCustomMarkerId) ?? null,
    [customMarkers, selectedCustomMarkerId],
  );

  useEffect(() => {
    try {
      saveCustomMarkers(customMarkers);
    } catch {
      setMarkerMessage("This browser could not save your markers.");
    }
  }, [customMarkers]);

  function selectCoordinate(nextCoordinate: Coordinate) {
    setSelectedLocationId("");
    if (placementMode !== "marker") setSelectedCustomMarkerId("");
    setCoordinate(nextCoordinate);
    setHeight(nextCoordinate.z.toFixed(1));
    setMarkerMessage("");
    if (placementMode === "marker") return;
    if (placementMode === "start") {
      setRouteStart(nextCoordinate);
      setPlacementMode("waypoint");
      return;
    }
    setWaypoint(nextCoordinate);
  }

  function selectImportantLocation(id: string) {
    setSelectedLocationId(id);
    setSelectedCustomMarkerId("");
    const location = importantMapLocations.find((item) => item.id === id);
    if (!location) return;
    setCoordinate(location);
    setHeight(location.z.toFixed(1));
    setWaypoint(location);
    setPlacementMode(routeStart ? "waypoint" : "start");
  }

  function selectCustomMarker(id: string) {
    setSelectedCustomMarkerId(id);
    setSelectedLocationId("");
    const marker = customMarkers.find((item) => item.id === id);
    if (!marker) return;
    setCoordinate(marker);
    setHeight(marker.z.toFixed(1));
    setMarkerName(marker.name);
    setMarkerIcon(marker.icon);
    setPlacementMode("marker");
    setMarkerMessage("");
  }

  function beginCustomMarker() {
    setPlacementMode("marker");
    setSelectedLocationId("");
    setSelectedCustomMarkerId("");
    setCoordinate(null);
    setHeight("0.0");
    setMarkerName("");
    setMarkerIcon("pin");
    setMarkerMessage("Click the map to choose where the marker belongs.");
  }

  function storeCustomMarker() {
    const name = markerName.trim();
    if (!selectedCoordinate) {
      setMarkerMessage("Click the map to choose a position first.");
      return;
    }
    if (!name) {
      setMarkerMessage("Give the marker a name first.");
      return;
    }
    if (!selectedCustomMarkerId && customMarkers.length >= 250) {
      setMarkerMessage("Delete an old marker before adding another.");
      return;
    }

    const marker: CustomMapMarker = {
      ...selectedCoordinate,
      id: selectedCustomMarkerId || createMarkerId(),
      name,
      icon: markerIcon,
    };
    setCustomMarkers((current) => selectedCustomMarkerId
      ? current.map((item) => item.id === selectedCustomMarkerId ? marker : item)
      : [...current, marker]);
    setSelectedCustomMarkerId(marker.id);
    setMarkerMessage(selectedCustomMarkerId ? "Marker updated." : "Marker saved to this browser.");
  }

  function routeToCustomMarker() {
    if (!selectedCoordinate) return;
    setWaypoint(selectedCoordinate);
    setPlacementMode(routeStart ? "waypoint" : "start");
    setMarkerMessage(routeStart ? "Marker set as your waypoint." : "Now choose your starting point.");
  }

  function deleteCustomMarker() {
    if (!selectedCustomMarkerId) return;
    setCustomMarkers((current) => current.filter((item) => item.id !== selectedCustomMarkerId));
    setSelectedCustomMarkerId("");
    setMarkerName("");
    setMarkerIcon("pin");
    setCoordinate(null);
    setMarkerMessage("Marker deleted.");
  }

  function clearRoute() {
    setCoordinate(null);
    setRouteStart(null);
    setWaypoint(null);
    setPlacementMode("start");
    setSelectedLocationId("");
    setSelectedCustomMarkerId("");
  }

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
            Place your current position and a waypoint to generate a driving
            route, save your own private map markers, or copy any selected point
            into your FiveM resource.
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
              <strong>{placementInstruction(placementMode)}</strong>
            </div>
            <div className="map-view-switch" role="radiogroup" aria-label="Map view">
              {(["roadmap", "satellite", "atlas"] as MapType[]).map((view) => (
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
          <div className="map-route-controls">
            <div className="map-placement-switch" role="radiogroup" aria-label="Waypoint placement">
              <button
                type="button"
                role="radio"
                aria-checked={placementMode === "start"}
                className={placementMode === "start" ? "active" : ""}
                onClick={() => setPlacementMode("start")}
              >
                Set start
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={placementMode === "waypoint"}
                className={placementMode === "waypoint" ? "active" : ""}
                onClick={() => setPlacementMode("waypoint")}
              >
                Set waypoint
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={placementMode === "marker"}
                className={placementMode === "marker" ? "active" : ""}
                onClick={beginCustomMarker}
              >
                Add marker
              </button>
            </div>
            <span>
              {placementMode === "marker"
                ? `${customMarkers.length} custom marker${customMarkers.length === 1 ? "" : "s"} saved locally`
                : drivingRoute ? "Best route ready" : routeStart ? "Choose a destination" : "Choose where the journey starts"}
            </span>
            <button type="button" className="map-clear-route" onClick={clearRoute} disabled={!routeStart && !waypoint}>
              Clear route
            </button>
          </div>
          <label className="map-location-picker">
            <span>Important blip</span>
            <select value={selectedLocationId} onChange={(event) => selectImportantLocation(event.target.value)}>
              <option value="">Choose a location…</option>
              {mapLocationCategories.map((category) => (
                <optgroup key={category} label={category}>
                  {importantMapLocations
                    .filter((location) => location.category === category)
                    .map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="map-location-picker">
            <span>Your markers</span>
            <select
              value={selectedCustomMarkerId}
              onChange={(event) => selectCustomMarker(event.target.value)}
              disabled={customMarkers.length === 0}
            >
              <option value="">{customMarkers.length === 0 ? "No saved markers yet" : "Choose a saved marker…"}</option>
              {customMarkers.map((marker) => (
                <option key={marker.id} value={marker.id}>
                  {getCustomMarkerIconLabel(marker.icon)} · {marker.name}
                </option>
              ))}
            </select>
          </label>
          <CoordinateMap
            coordinate={selectedCoordinate}
            routeStart={routeStart}
            waypoint={waypoint}
            route={drivingRoute}
            mapType={mapType}
            placementMode={placementMode}
            locations={importantMapLocations}
            selectedLocationId={selectedLocationId}
            customMarkers={customMarkers}
            selectedCustomMarkerId={selectedCustomMarkerId}
            onSelect={selectCoordinate}
          />
          <div className="map-legend" aria-label="Map legend">
            <span><i className="legend-land" />Landmass</span>
            <span><i className="legend-road" />Major roads</span>
            <span><i className="legend-route" />Driving route</span>
            <span><i className="legend-marker" />Important locations</span>
            <span><i className="legend-custom-marker" />Your markers</span>
          </div>
          <a className="map-attribution" href="https://github.com/CreepPork/GTAV-Maps" target="_blank" rel="noreferrer">
            Map artwork: GTAV-Maps · MIT License
          </a>
        </div>

        <aside className="coordinate-panel" aria-live="polite">
          <div className="coordinate-panel-heading">
            <span className="section-label">
              {selectedCustomMarker ? "Your marker" : selectedLocation?.category ?? "Selected point"}
            </span>
            <strong>
              {selectedCustomMarker?.name ?? selectedLocation?.name ?? (selectedCoordinate ? "Ready to use" : "No point selected")}
            </strong>
          </div>

          {selectedCoordinate ? (
            <>
              {drivingRoute && (
                <div className="route-summary">
                  <div>
                    <span>Best driving route</span>
                    <strong>{formatDistance(drivingRoute.distance)}</strong>
                  </div>
                  <div>
                    <span>Estimated drive</span>
                    <strong>{formatDuration(drivingRoute.estimatedSeconds)}</strong>
                  </div>
                </div>
              )}
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
              {placementMode === "marker" && (
                <CustomMarkerEditor
                  name={markerName}
                  icon={markerIcon}
                  message={markerMessage}
                  isEditing={Boolean(selectedCustomMarkerId)}
                  onNameChange={setMarkerName}
                  onIconChange={setMarkerIcon}
                  onSave={storeCustomMarker}
                  onRoute={routeToCustomMarker}
                  onDelete={deleteCustomMarker}
                />
              )}
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
              <p>{placementMode === "marker" ? markerMessage : "Click the map to place your first marker."}</p>
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
  routeStart,
  waypoint,
  route,
  mapType,
  placementMode,
  locations,
  selectedLocationId,
  customMarkers,
  selectedCustomMarkerId,
  onSelect,
}: {
  coordinate: Coordinate | null;
  routeStart: Coordinate | null;
  waypoint: Coordinate | null;
  route: DrivingRoute | null;
  mapType: MapType;
  placementMode: PlacementMode;
  locations: MapLocation[];
  selectedLocationId: string;
  customMarkers: CustomMapMarker[];
  selectedCustomMarkerId: string;
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
      aria-label={`Los Santos map. ${placementInstruction(placementMode)}`}
    >
      <svg className="coordinate-map-art" viewBox={`0 0 ${MAP_VIEW_WIDTH} ${MAP_VIEW_HEIGHT}`} aria-hidden="true">
        <rect width={MAP_VIEW_WIDTH} height={MAP_VIEW_HEIGHT} fill="#07131c" />
        <image href={mapTileUrl(mapType, 0)} x="0" y="0" width={MAP_VIEW_WIDTH} height={MAP_VIEW_WIDTH} preserveAspectRatio="none" />
        <image href={mapTileUrl(mapType, 1)} x="0" y={MAP_VIEW_WIDTH} width={MAP_VIEW_WIDTH} height={MAP_VIEW_WIDTH} preserveAspectRatio="none" />
        {route && (
          <>
            <polyline
              points={toSvgPoints(route.points)}
              fill="none"
              stroke="#11210b"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".9"
            />
            <polyline
              points={toSvgPoints(route.points)}
              fill="none"
              stroke="#9df21d"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
      <span className="map-north-indicator">N</span>
      {coordinate && (placementMode === "marker" || (!routeStart && !waypoint)) && (
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
      {routeStart && (
        <span className="route-map-marker route-start-marker" style={markerPosition(routeStart)} aria-hidden="true">
          <i>S</i>
        </span>
      )}
      {waypoint && (
        <span className="route-map-marker route-waypoint-marker" style={markerPosition(waypoint)} aria-hidden="true">
          <i>W</i>
        </span>
      )}
      {locations.map((location) => (
        <span
          key={location.id}
          className={`map-blip map-blip-${location.category.toLowerCase()}${selectedLocationId === location.id ? " selected" : ""}`}
          style={markerPosition(location)}
          title={`${location.name} (${location.category})`}
          aria-hidden="true"
        />
      ))}
      {customMarkers.map((marker) => (
        <span
          key={marker.id}
          className={`map-custom-marker map-custom-marker-${marker.icon}${selectedCustomMarkerId === marker.id ? " selected" : ""}`}
          style={markerPosition(marker)}
          title={marker.name}
          aria-hidden="true"
        >
          <MapMarkerIcon icon={marker.icon} />
        </span>
      ))}
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

function formatDistance(distance: number) {
  return distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function placementInstruction(mode: PlacementMode) {
  if (mode === "marker") return "Click to place your custom marker";
  if (mode === "waypoint") return "Click to set your waypoint";
  return "Click to set your starting point";
}

function toSvgPoints(points: DrivingRoute["points"]) {
  return points
    .map((point) => `${point.x * MAP_VIEW_WIDTH},${point.y * MAP_VIEW_HEIGHT}`)
    .join(" ");
}

function mapTileUrl(mapType: MapType, row: 0 | 1) {
  const layer = mapType === "roadmap" ? "road" : mapType;
  return `${import.meta.env.BASE_URL}maps/${layer}/2-0_${row}.png`;
}

function markerPosition(coordinate: Coordinate) {
  const point = worldToMapPoint(coordinate);
  return { left: `${point.x * 100}%`, top: `${point.y * 100}%` };
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
