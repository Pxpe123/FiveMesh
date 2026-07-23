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

The home screen also supports curated examples for visitors who do not know
FiveM tooling or do not have model files ready. Example assets live in
`examples/assets` and are listed in `examples/examples.json`.

Example layout:

```text
examples/
|-- examples.json
`-- assets/
    `-- baller/
        |-- Baller.yft
        `-- Baller.ytd
```

## Architecture

```text
FiveMesh/
|-- apps/
|   |-- engine/      .NET decoder and future model operations
|   |-- server/      Express API and Engine process boundary
|   `-- web/         React Three.js viewer
|-- examples/        Hosted demo assets and example manifest
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

## Engineering Notes

- TypeScript is used for the Server and Web apps.
- C#/.NET is used for the Engine because CodeWalker.Core is the decoding layer.
- The local dev scripts remain in the repo for maintenance, but the intended
user experience is the hosted public app.
- GTA V asset files are intentionally ignored and should not be committed.

## Quality

The repository includes a CI workflow that validates the project on GitHub:

```sh
npm run check
```

That command runs TypeScript checks, builds the Engine/Server/Web apps, and
verifies C# formatting.

## Documentation

- [Project map](docs/PROJECT_MAP.md)
- [Roadmap](docs/ROADMAP.md)

## Access

This is a private source repository. Access may be granted to selected reviewers
or potential employers to evaluate architecture, implementation quality, and
project direction. Public usage is through the hosted FiveMesh app, not by
cloning or running this repository.
