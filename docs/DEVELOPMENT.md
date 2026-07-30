# Development guide

## Local setup

Install dependencies for the TypeScript apps:

```sh
npm run install:all
```

Start the local development environment:

```sh
npm run dev
```

`Start-Dev.bat` is the easiest Windows maintenance entry point. It builds the
Engine and starts the Server and Web apps in separate terminals.

## Validation

Run the same checks used by CI:

```sh
npm run check
```

For faster feedback:

```sh
npm run typecheck
npm run build
npm run format:check
```

## App boundaries

- `apps/engine` owns decoding and future model operations.
- `apps/server` owns upload validation, temporary files, and Engine execution.
- `apps/web` owns interaction, viewer state, and Three.js rendering.
Keep CodeWalker-specific types inside `apps/engine`. Conversion responses are
downloaded files, while the viewer continues to use the neutral preview JSON.

## Hosted examples

Put demo files in `examples/assets`, grouped by category. The default Server
config scans that folder through `/api/examples`, and the Web home screen lets
visitors open them without bringing their own files.

Example:

```text
examples/assets/Cars/Baller8/baller8_hi.yft
examples/assets/Cars/Baller8/baller8+hi.ytd
```

Only add assets you are comfortable hosting in the public app.

## Adding a feature

1. Add or update the preview contract first when data crosses app boundaries.
2. Add the Engine operation if the feature needs model decoding or mutation.
3. Add the Server route/service that owns file lifecycle and execution.
4. Add the Web feature and API call.
5. Run `npm run check`.

## Conversion workflow

The `/converter` page supports YDR, YFT, and YTD files in both directions:

- Binary to XML returns a ZIP containing the XML and any extracted DDS files.
- XML to binary accepts the XML plus its referenced texture files and returns
  the selected binary format.

When adding another format, update the Engine command mapping, the Server
conversion validation, and the Web format list together.

## MLO workflow

The `/mlo` workspace accepts a YTYP definition and optional referenced YDR/YTD
files. The Engine reads all archetypes and exposes MLO rooms, portals, and
entities through a neutral JSON contract. Portal edits are sent back as a
small JSON patch; the Engine writes a new YTYP download and leaves the source
file untouched.

The first MLO slice is intentionally metadata-first. Rendering referenced
interior YDRs and applying portal visibility in a 3D scene should build on the
same archetype and portal contract rather than adding a second parser.

## Sample assets

Do not commit GTA V game assets to the repository. Keep local `.ydr`, `.yft`,
and `.ytd` files outside git, then use them for manual viewer checks.

## GitHub Pages mode

`.github/workflows/pages.yml` publishes only `apps/web`. It enables
`VITE_STATIC_MODE=true`, which switches the app to HashRouter and displays a
clear offline state for API-backed tools. The practice games remain available
without a Server or Engine connection.
