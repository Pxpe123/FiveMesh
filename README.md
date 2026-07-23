# FiveMesh

FiveMesh is a local GTA V asset viewer for YDR drawables and YFT vehicle
fragments. An optional YTD supplies the model's texture dictionary.

The repository contains three applications with deliberately separate jobs:

- `Engine` reads RAGE resources with CodeWalker.Core and produces neutral JSON.
- `Server` validates uploads and runs Engine operations.
- `Web` handles file selection and renders preview data with React and Three.js.

See [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md) for the full data flow, folder map,
and guidance on where future features belong.

## Quick start on Windows

Double-click `Start-Dev.bat`. It installs missing packages, builds the Engine,
and opens the Server and Web development processes.

Then open [http://localhost:5173](http://localhost:5173).

## Manual setup

Install each TypeScript application's dependencies:

```sh
npm run install:all
```

Start the development environment:

```sh
npm run dev
```

The Web app runs on port `5173` and proxies `/api` requests to the Server on
port `3000`.

## Using the viewer

Drop either:

- a `.ydr` and its optional matching `.ytd`; or
- a `.yft` and its optional matching `.ytd`.

Use a vehicle's `_hi.yft` when the highest-detail model is required. Some
materials reference shared GTA V dictionaries such as `vehshare.ytd`; a model
can only display textures supplied by its embedded dictionary or uploaded YTD.

Uploads are decoded in a temporary directory and removed after the response is
created.

## Quality checks

```sh
npm run typecheck
npm run build
npm run check
```

The root project only coordinates commands. Server and Web intentionally keep
their own `node_modules` folders and lockfiles.
