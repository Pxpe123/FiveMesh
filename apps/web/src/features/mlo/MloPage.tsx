import { useMemo, useState } from "react";

import { editMloPortal, requestMloPreview } from "../../api/mloApi";
import type {
  MloArchetype,
  MloPortal,
  MloPortalPatch,
  MloPreview,
} from "../../types/mloPreview";

export function MloPage() {
  const [ytyp, setYtyp] = useState<File | null>(null);
  const [drawables, setDrawables] = useState<File[]>([]);
  const [textures, setTextures] = useState<File[]>([]);
  const [preview, setPreview] = useState<MloPreview | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [selectedPortalIndex, setSelectedPortalIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const archetype = useMemo(
    () =>
      preview?.archetypes.find((item) => item.name === selectedArchetype) ??
      preview?.archetypes.find((item) => item.isMlo) ??
      preview?.archetypes[0] ??
      null,
    [preview, selectedArchetype],
  );
  const portal =
    archetype?.portals.find((item) => item.index === selectedPortalIndex) ??
    archetype?.portals[0] ??
    null;

  async function inspect() {
    if (!ytyp) {
      setError("Choose a YTYP file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await requestMloPreview(ytyp, drawables, textures);
      setPreview(result);
      setSelectedArchetype(result.archetypes.find((item) => item.isMlo)?.name ?? result.archetypes[0]?.name ?? "");
      setSelectedPortalIndex(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to inspect the YTYP.");
    } finally {
      setLoading(false);
    }
  }

  async function savePortal(patch: MloPortalPatch) {
    if (!ytyp) return;
    setEditing(true);
    setError("");
    setMessage("");
    try {
      const output = await editMloPortal(ytyp, patch);
      downloadBlob(output, `${stripExtension(ytyp.name)}-edited.ytyp`);
      setMessage("Edited YTYP downloaded. Keep it with the same drawable and texture assets.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to edit the portal.");
    } finally {
      setEditing(false);
    }
  }

  return (
    <main className="mlo-page">
      <section className="mlo-intro">
        <p className="section-label">MLO workspace</p>
        <h1>Inspect interiors, rooms, and portals.</h1>
        <p className="lede">
          Load a YTYP definition with its referenced YDR drawables and YTD
          dictionaries. FiveMesh maps the interior structure before you make
          a change and download an edited YTYP.
        </p>
      </section>

      <section className="mlo-upload-card">
        <FilePicker label="YTYP definition" accept=".ytyp" multiple={false} onChange={(files) => setYtyp(files[0] ?? null)} />
        <FilePicker label="Referenced YDR drawables" accept=".ydr" multiple onChange={setDrawables} />
        <FilePicker label="Referenced YTD textures" accept=".ytd" multiple onChange={setTextures} />
        <button type="button" className="load-button" disabled={!ytyp || loading} onClick={inspect}>
          {loading ? "Inspecting MLO…" : "Inspect YTYP"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </section>

      {preview && (
        <section className="mlo-workspace">
          <aside className="mlo-archetypes">
            <div className="mlo-section-heading">
              <strong>Archetypes</strong>
              <span>{preview.archetypes.length}</span>
            </div>
            {preview.archetypes.map((item) => (
              <button
                key={item.name}
                type="button"
                className={item.name === archetype?.name ? "active" : ""}
                onClick={() => {
                  setSelectedArchetype(item.name);
                  setSelectedPortalIndex(null);
                }}
              >
                <strong>{item.name || "Unnamed archetype"}</strong>
                <small>{item.isMlo ? "MLO interior" : "Drawable archetype"}</small>
              </button>
            ))}
          </aside>

          <div className="mlo-details">
            <section className="mlo-data-card mlo-assets-card">
              <div className="mlo-section-heading"><strong>Referenced model assets</strong><span>{preview.assets.length} loaded</span></div>
              <div className="mlo-asset-list">{preview.assets.length === 0 ? <p className="muted-text">No YDR/YFT sidecars were uploaded. Add them to prepare for 3D interior rendering.</p> : preview.assets.map((asset) => <div className="mlo-asset-row" key={asset.name}><strong>{asset.name}</strong><span>{asset.format} · {asset.modelCount} drawable models</span></div>)}</div>
            </section>
            {archetype && <ArchetypeDetails archetype={archetype} portal={portal} onPortalSelect={setSelectedPortalIndex} onSave={savePortal} editing={editing} />}
          </div>
        </section>
      )}
    </main>
  );
}

function ArchetypeDetails({
  archetype,
  portal,
  onPortalSelect,
  onSave,
  editing,
}: {
  archetype: MloArchetype;
  portal: MloPortal | null;
  onPortalSelect: (index: number) => void;
  onSave: (patch: MloPortalPatch) => void;
  editing: boolean;
}) {
  return (
    <>
      <div className="mlo-detail-heading">
        <div>
          <p className="section-label">{archetype.isMlo ? "MLO interior" : "Archetype"}</p>
          <h2>{archetype.name || "Unnamed archetype"}</h2>
        </div>
        <div className="mlo-summary">
          <span>{archetype.rooms.length} rooms</span>
          <span>{archetype.portals.length} portals</span>
          <span>{archetype.entities.length} entities</span>
        </div>
      </div>

      <div className="mlo-asset-strip">
        <span>Drawable: <strong>{archetype.drawableDictionary || "not declared"}</strong></span>
        <span>Textures: <strong>{archetype.textureDictionary || "not declared"}</strong></span>
      </div>

      {archetype.rooms.length > 0 && (
        <section className="mlo-data-card">
          <div className="mlo-section-heading"><strong>Rooms</strong><span>Visibility and bounds</span></div>
          <div className="mlo-table-wrap"><table><thead><tr><th>Name</th><th>Floor</th><th>Portals</th><th>Visibility depth</th></tr></thead><tbody>{archetype.rooms.map((room) => <tr key={room.index}><td>{room.name || `Room ${room.index}`}</td><td>{room.floorId}</td><td>{room.portalCount}</td><td>{room.exteriorVisibilityDepth}</td></tr>)}</tbody></table></div>
        </section>
      )}

      {archetype.portals.length > 0 && (
        <section className="mlo-data-card">
          <div className="mlo-section-heading"><strong>Portals</strong><span>Select a portal to edit</span></div>
          <div className="mlo-table-wrap"><table><thead><tr><th>Portal</th><th>From room</th><th>To room</th><th>Opacity</th></tr></thead><tbody>{archetype.portals.map((item) => <tr key={item.index} className={portal?.index === item.index ? "selected" : ""} onClick={() => onPortalSelect(item.index)}><td>#{item.index}</td><td>{item.roomFrom}</td><td>{item.roomTo}</td><td>{item.opacity}</td></tr>)}</tbody></table></div>
          {portal && <PortalEditor key={`${archetype.name}-${portal.index}`} archetype={archetype} portal={portal} onSave={onSave} editing={editing} />}
        </section>
      )}

      {archetype.entities.length > 0 && (
        <section className="mlo-data-card"><div className="mlo-section-heading"><strong>Interior entities</strong><span>{archetype.entities.length} placed objects</span></div><div className="mlo-table-wrap"><table><thead><tr><th>Name</th><th>Archetype</th><th>Position</th><th>Scale</th></tr></thead><tbody>{archetype.entities.map((entity) => <tr key={entity.index}><td>{entity.name || `Entity ${entity.index}`}</td><td>{entity.archetype}</td><td>{formatVector(entity.position)}</td><td>{entity.scaleXY.toFixed(2)} / {entity.scaleZ.toFixed(2)}</td></tr>)}</tbody></table></div></section>
      )}
    </>
  );
}

function PortalEditor({ archetype, portal, onSave, editing }: { archetype: MloArchetype; portal: MloPortal; onSave: (patch: MloPortalPatch) => void; editing: boolean }) {
  const [roomFrom, setRoomFrom] = useState(portal.roomFrom);
  const [roomTo, setRoomTo] = useState(portal.roomTo);
  const [flags, setFlags] = useState(portal.flags);
  const [opacity, setOpacity] = useState(portal.opacity);
  const [corners, setCorners] = useState(portal.corners);

  return (
    <div className="mlo-portal-editor">
      <div className="mlo-section-heading"><strong>Portal editor</strong><span>Changes are written to a new YTYP</span></div>
      <div className="mlo-editor-grid">
        <NumberField label="From room" value={roomFrom} onChange={setRoomFrom} />
        <NumberField label="To room" value={roomTo} onChange={setRoomTo} />
        <NumberField label="Flags" value={flags} onChange={setFlags} />
        <NumberField label="Opacity" value={opacity} onChange={setOpacity} />
      </div>
      <div className="mlo-corners"><strong>Portal corners</strong>{corners.map((corner, index) => <div className="mlo-corner" key={index}><small>Corner {index + 1}</small>{corner.map((value, axis) => <NumberField key={axis} label={["X", "Y", "Z"][axis]} value={value} onChange={(next) => setCorners((current) => current.map((item, itemIndex) => itemIndex === index ? item.map((axisValue, axisIndex) => axisIndex === axis ? next : axisValue) as [number, number, number] : item))} />)}</div>)}</div>
      <button type="button" className="load-button" disabled={editing} onClick={() => onSave({ archetype: archetype.name, portalIndex: portal.index, roomFrom, roomTo, flags, opacity, corners })}>{editing ? "Writing YTYP…" : "Download edited YTYP"}</button>
    </div>
  );
}

function FilePicker({ label, accept, multiple, onChange }: { label: string; accept: string; multiple: boolean; onChange: (files: File[]) => void }) {
  return <label className="mlo-file-picker"><span>{label}</span><input type="file" accept={accept} multiple={multiple} onChange={(event) => onChange(Array.from(event.target.files ?? []))} /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="mlo-number-field"><span>{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function formatVector(vector: number[]) { return vector.map((value) => value.toFixed(2)).join(", "); }
function stripExtension(name: string) { return name.replace(/\.ytyp$/i, ""); }
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
