# FiveMesh map viewer architecture

This document separates what FiveMesh can do in the browser today from what is
needed for a full GTA V world viewer.

## Current foundation

The `/map` tool is a browser-only coordinate finder. It keeps the coordinate
contract explicit:

```text
screen x  -> world X (west to east)
screen y  -> world Y (north to south on screen)
height    -> world Z (entered by the user)
```

The map view is presentation-only. Roadmap, Satellite-style, and Terrain views
all use the same transform, so changing the view cannot change the copied
coordinate. The bounds should eventually come from a calibrated map manifest,
not from a component constant.

## Target full-world architecture

```text
GTA V install / FiveM resource pack
              |
              v
     Local Asset Bridge or Upload Pack
              |
              v
      Extract + Normalize Pipeline
              |
              +--> map manifest (bounds, tiles, CRS)
              +--> spatial index (sector -> assets)
              +--> geometry tiles (YMAP/YTYP/YDR/YBN/YFT)
              +--> texture tiles (YTD -> KTX2/PNG)
              |
              v
       Server cache / object storage / CDN
              |
              v
     Three.js Map Client + Tile Manager
              |
              +--> 2D map and coordinate tools
              +--> 3D fly-through and camera controls
              +--> MLO portals and interior visibility
              +--> selection, inspection, and future editing
```

### 1. Asset source modes

FiveMesh should support three explicit modes rather than trying to read a game
installation from browser JavaScript:

1. **Hosted curated map** - FiveMesh operators process a permitted asset pack,
   store derived tiles, and serve only the data required by the public viewer.
2. **Local bridge** - a small .NET or Rust helper runs on the user's machine,
   reads the user's installation or resource folders, and exposes a localhost
   API to the web app. The browser never receives a raw disk path or direct
   filesystem access.
3. **Server/resource pack** - a FiveM server owner uploads a resource pack or
   points the bridge at an approved resource directory. The server processes it
   once and shares a versioned map dataset with their team.

The browser cannot safely or reliably open another person's GTA installation by
itself. A user-controlled bridge or an explicit upload is required. FiveM's
world editor documentation also treats world editing as a tool with a defined
asset/runtime boundary, which is a useful model for this separation:
<https://docs-backend.cfx.re/docs/fxdk/world-editor/>.

### 2. Extraction and normalization

Keep format-specific code inside the Engine. The pipeline should produce a
versioned intermediate format rather than sending CodeWalker structures to the
browser directly.

```text
YMAP -> placement records (archetype, transform, flags, lod)
YTYP -> archetype records (drawable, bounds, rooms, portals)
YDR  -> mesh/material payloads
YBN  -> collision payloads and bounds
YFT  -> vehicle fragment payloads
YTD  -> texture references and compressed image payloads
```

Each record should include:

- `datasetId` and `datasetVersion`
- `worldBounds`
- `sectorId`
- a stable asset hash
- source format and source name
- dependency references rather than duplicated geometry

### 3. Spatial tiling

Do not send the entire GTA world to the browser. Split the world into fixed
sectors (for example 512m or 1024m squares) and keep a small manifest at the
root:

```json
{
  "version": 1,
  "bounds": { "minX": -4000, "maxX": 4000, "minY": -4000, "maxY": 8000 },
  "sectorSize": 512,
  "tiles": [
    { "id": "-08_12", "bounds": [-4000, 6144, -3488, 6656], "url": "tiles/-08_12.bin" }
  ]
}
```

The client requests nearby sectors as the camera moves and releases distant
ones. Geometry should use quantized attributes where possible; textures should
prefer GPU-friendly compressed formats such as KTX2/Basis when the deployment
pipeline supports them.

### 4. Browser renderer

The web client can reuse the existing Three.js viewer, but the world layer needs
its own systems:

- a tile manager with request cancellation and a small memory budget
- frustum and distance culling
- LOD selection for buildings, props, and collision
- worker-based parsing/decompression so the main thread stays responsive
- `InstancedMesh` for repeated props and street furniture
- a separate collision/debug layer
- an MLO portal visibility pass for rooms and interiors
- a selection model shared by the 2D map, 3D scene, and inspector

The 2D coordinate finder should remain useful even when the 3D dataset is
offline. It can use the same manifest bounds and markers without requiring the
Engine.

### 5. Hosting shape

For a public hosted deployment:

```text
Static web app (GitHub Pages / CDN)
        |
        +--> Map manifest and immutable tiles (object storage + CDN)
        +--> API for dataset metadata and signed tile URLs
        +--> optional worker queue for new uploads
```

For a local/private deployment:

```text
FiveMesh Web -> localhost bridge -> Engine -> GTA/FiveM files
```

The hosted app should not depend on a visitor's GTA installation. The local
bridge is an opt-in mode for creators who want to inspect private resources.

## Practical delivery phases

1. **Coordinate tools** - current 2D finder, map view selector, copy formats,
   and a calibrated bounds manifest.
2. **Map data importer** - extract YMAP/YTYP placements and produce a searchable
   dataset manifest.
3. **2D placement viewer** - draw entities, archetype names, bounds, and MLO
   portals over the map without loading every mesh.
4. **Streaming 3D viewer** - load sector geometry and textures around the camera
   with LOD and cancellation.
5. **MLO interiors** - resolve YTYP rooms, portals, and referenced YDR assets;
   use portal visibility to avoid rendering hidden rooms.
6. **Editing and export** - edit transforms/portal metadata in a staged document,
   validate it, and export a new YMAP/YTYP without overwriting the source.

## Asset and hosting boundaries

GTA V and its map assets are proprietary. A production FiveMesh deployment
should only distribute derived or user-provided data that the operator has the
right to host. Do not build a public service that silently copies a user's full
installation or republishes Rockstar assets. For public examples, keep the
dataset small, documented, and intentionally curated.

FiveM's documentation describes registered world data and map tooling, while
the community's map tile work shows why the in-game map is naturally handled as
multiple tiles rather than one huge image:
<https://docs.fivem.net/docs/game-references/zones/>
and
<https://forum.cfx.re/t/release-extra-map-tiles-v2-new-and-revamped-version/5344181>.
