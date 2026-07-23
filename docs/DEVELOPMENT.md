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

`Start-Dev.bat` is the easiest Windows entry point. It builds the Engine and
starts the Server and Web apps in separate terminals.

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
- `packages/contracts` owns schemas shared across app boundaries.

Keep CodeWalker types inside `apps/engine`. Server and Web should communicate
through versioned contracts only.

## Adding a feature

1. Add or update the contract first when data crosses app boundaries.
2. Add the Engine operation if the feature needs model decoding or mutation.
3. Add the Server route/service that owns file lifecycle and execution.
4. Add the Web feature and API call.
5. Run `npm run check`.

## Sample assets

Do not commit GTA V game assets to the repository. Keep local `.ydr`, `.yft`,
and `.ytd` files outside git, then use them for manual viewer checks.
