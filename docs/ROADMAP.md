# Roadmap

FiveMesh is currently focused on previewing YDR/YFT assets with optional YTD
textures. The structure is ready for larger model tooling, but these items
should be handled deliberately.

## Near term

- Add legal sample fixtures or fixture stubs for automated preview tests.
- Generate TypeScript types from `packages/contracts/model-preview.schema.json`.
- Improve material mapping with more shader parameters from CodeWalker.
- Add user-facing warnings for missing shared texture dictionaries.

## Editor foundation

- Add scene selection state in `apps/web`.
- Add transform controls with undo/redo.
- Add Engine commands for transform and export.
- Add Server endpoints for long-running jobs and cancellation.

## Longer term

- Add batch conversion and thumbnail generation.
- Add persistence for projects and imported texture dictionaries.
- Add export validation against CodeWalker-readable outputs.
- Add a packaged desktop distribution once the local workflow stabilizes.
