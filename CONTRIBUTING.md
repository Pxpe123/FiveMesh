# Contributing

Thanks for helping improve FiveMesh.

## Before opening a pull request

Run:

```sh
npm run check
```

This validates the Engine build, Server typecheck/build, Web typecheck/build,
and C# formatting.

## Project shape

- Keep decoding logic in `apps/engine`.
- Keep HTTP/file lifecycle logic in `apps/server`.
- Keep viewer and interaction logic in `apps/web`.
- Keep cross-app schemas in `packages/contracts`.

Do not commit GTA V game assets or other copyrighted game files.

## Pull request notes

In your PR, describe:

- what changed
- how you tested it
- any known render/material limitations
