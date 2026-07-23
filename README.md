# FiveMesh

FiveMesh is a local GTA V asset preview pipeline for `.ydr` drawables and
`.yft` vehicle fragments. Drop a model with an optional `.ytd` texture
dictionary, and the app decodes it through a .NET Engine, serves it through an
Express API, and renders it in a React + Three.js viewer.

The project is intentionally split into small applications so it can grow into
model editing, exporting, batch tools, and better material support without
turning the viewer into one tangled codebase.

## Apps

```text
FiveMesh/
|-- apps/
|   |-- engine/      .NET decoder and future model operations
|   |-- server/      Express API and Engine process boundary
|   `-- web/         React Three.js viewer
|-- packages/
|   `-- contracts/   Cross-app schemas
|-- docs/            Architecture and development notes
`-- .github/         GitHub templates and CI
```

## Requirements

- Windows
- Node.js with npm
- .NET SDK 10

## Quick Start

Double-click `Start-Dev.bat`.

It installs missing Server/Web packages, builds the Engine, and starts:

- API server: [http://localhost:3000](http://localhost:3000)
- Web viewer: [http://localhost:5173](http://localhost:5173)

## Manual Commands

```sh
npm run install:all
npm run dev
```

Quality checks:

```sh
npm run typecheck
npm run build
npm run check
```

## Using The Viewer

Drop either:

- a `.ydr` and optional matching `.ytd`
- a `.yft` and optional matching `.ytd`

For vehicles, use the `_hi.yft` when you want the highest-detail model. Some
materials reference shared GTA V dictionaries such as `vehshare.ytd`; FiveMesh
can only display textures embedded in the model or supplied by the uploaded
YTD.

Uploaded files are written to a temporary working directory and removed after
the preview response is created.

## Documentation

- [Project map](docs/PROJECT_MAP.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Roadmap](docs/ROADMAP.md)

## Repository Notes

The root package only coordinates commands. `apps/server` and `apps/web` keep
their own `node_modules` folders and lockfiles on purpose.

No license has been selected yet. Add a license before publishing publicly if
you want other people to use, modify, or redistribute the code.
