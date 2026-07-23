# FiveMesh

FiveMesh is a hosted GTA V asset preview tool for `.ydr` drawables and `.yft`
vehicle fragments. Users can upload a model with an optional `.ytd` texture
dictionary and inspect the decoded result in a React + Three.js viewer.

This repository is private. It is maintained as the source code for the hosted
public app and as a technical review project for selected reviewers.

## Product Focus

FiveMesh is built for fast visual inspection of GTA V model assets:

- decode YDR/YFT model files through a dedicated .NET Engine
- resolve embedded or uploaded YTD texture dictionaries
- serve a neutral preview format through an Express API
- render textured geometry in a browser-based Three.js viewer
- keep the architecture ready for future editing, export, and batch workflows

## Public App Experience

The hosted app starts with a small home screen that explains what FiveMesh is
and links into the available tools. The current tool is the Model Viewer. More
apps can be added inside the same shell as the project grows.

The current plan is to extend the viewer with YMAP and YTYP support so MLO and
map-related data can be explored in the same environment. A broader standalone
map viewer is also on the table if the format support and rendering pipeline
make that practical.

The home screen also supports curated examples for visitors who do not know
FiveM tooling or do not have model files ready. Example assets live in
`examples/assets`.

Example layout:

```text
examples/
`-- assets/
    |-- Cars/
    |   `-- Baller8/
    |       |-- baller8_hi.yft
    |       `-- baller8+hi.ytd
    `-- Props/
        `-- PoolTable/
            |-- prop_pooltable_02.ydr
            `-- prop_pooltable_02+hidr.ytd
```

FiveMesh reads the example name from the example folder and displays a small
type badge from the `.yft` or `.ydr` extension.

On this PC, put examples here:

```text
D:\Develop\FiveMesh\examples\assets
```

## Architecture

```text
FiveMesh/
|-- apps/
|   |-- engine/      .NET decoder and future model operations
|   |-- server/      Express API and Engine process boundary
|   `-- web/         React Three.js viewer
|-- examples/        Hosted demo asset folders
|-- docs/            Architecture and roadmap notes
`-- .github/         CI and review templates
```

The codebase is split by responsibility:

- `apps/engine` owns binary decoding and model extraction.
- `apps/server` owns upload handling, temporary file lifecycle, and Engine execution.
- `apps/web` owns the user interface, viewer state, and WebGL rendering.

The key boundary is the preview JSON produced by the Engine and consumed by the
Server/Web layers. CodeWalker-specific types stay inside the Engine so the rest
of the app is not tied to a single decoder implementation.

The Web app uses route-based pages:

- `/` is the product home screen and curated example catalogue.
- `/viewer` is the interactive model viewer.
- `/viewer?example=<id>` opens a prepared example directly.

Home and viewer pages are loaded as separate browser chunks. Example metadata is
cached in the Web layer so moving between pages does not repeat the same request.

## Engineering Notes

- TypeScript is used for the Server and Web apps.
- C#/.NET is used for the Engine because CodeWalker.Core is the decoding layer.
- The local dev scripts remain in the repo for maintenance, but the intended
user experience is the hosted public app.
- Curated hosted examples live under `examples/assets`; keep anything else out
of git.

## Quality

The repository includes a CI workflow that validates the project on GitHub:

```sh
npm run check
```

That command runs TypeScript checks, builds the Engine/Server/Web apps, and
verifies C# formatting.

## Free Local Hosting

If you want to keep FiveMesh running on your own machine and still share it
with someone outside your network, the simplest free path is:

1. run the local dev stack
2. expose the web app through Cloudflare Tunnel
3. send the tunnel URL to the reviewer

On this project, the web dev server already proxies `/api` to the local server,
so the tunnel can point at the web port directly.

Local launch:

```bat
Start-Dev.bat
```

Tunnel launch:

```bat
Start-Tunnel.bat
```

The tunnel command routes `http://localhost:5173` through Cloudflare without
publishing your raw home IP directly. Keep the local dev windows open while the
tunnel is live.

## Documentation

- [Project map](docs/PROJECT_MAP.md)
- [Roadmap](docs/ROADMAP.md)

## Access

This is a private source repository. Access may be granted to selected reviewers
or potential employers to evaluate architecture, implementation quality, and
project direction. Public usage is through the hosted FiveMesh app, not by
cloning or running this repository.
