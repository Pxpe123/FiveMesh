import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AppConfig = {
  port: number;
  webOrigin: string;
  engineProjectPath: string;
  engineExecutablePath: string;
  examplesDirectory: string;
  webDirectory: string | undefined;
  engineTimeoutMs: number;
  maxUploadBytes: number;
  maxConversionFiles: number;
  maxMloFiles: number;
};

const isBuiltMode = (process.env.FIVEMESH_MODE ?? "dev") === "built";
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolveRepositoryRoot(moduleDirectory);
const sourceExamplesDirectory = path.join(
  repositoryRoot,
  "examples",
  "assets",
);
const builtExamplesDirectory = path.join(
  repositoryRoot,
  "build",
  "examples",
  "assets",
);

export const loadConfig = (): AppConfig => ({
  port: readPositiveNumber(process.env.PORT, 3000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  engineProjectPath:
    process.env.ENGINE_PROJECT_PATH ??
    path.join(repositoryRoot, "apps", "engine", "Engine.csproj"),
  engineExecutablePath:
    process.env.ENGINE_EXECUTABLE_PATH ??
    (isBuiltMode
      ? path.join(repositoryRoot, "build", "engine", "Engine.dll")
      : ""),
  examplesDirectory: process.env.EXAMPLES_DIRECTORY ?? (isBuiltMode
    ? builtExamplesDirectory
    : sourceExamplesDirectory),
  webDirectory:
    process.env.WEB_DIRECTORY ??
    (isBuiltMode ? path.join(repositoryRoot, "build", "web") : undefined),
  engineTimeoutMs: readPositiveNumber(process.env.ENGINE_TIMEOUT_MS, 120_000),
  maxUploadBytes: readPositiveNumber(
    process.env.MAX_UPLOAD_BYTES,
    300 * 1024 * 1024,
  ),
  maxConversionFiles: readPositiveNumber(process.env.MAX_CONVERSION_FILES, 64),
  maxMloFiles: readPositiveNumber(process.env.MAX_MLO_FILES, 128),
});

function resolveRepositoryRoot(moduleDirectory: string) {
  const configuredRoot = process.env.FIVEMESH_ROOT?.trim();
  if (configuredRoot) {
    return path.resolve(configuredRoot);
  }

  let directory = moduleDirectory;
  while (true) {
    if (existsSync(path.join(directory, "apps", "engine", "Engine.csproj"))) {
      return directory;
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      break;
    }
    directory = parent;
  }

  throw new Error(
    `Could not locate the FiveMesh repository from ${moduleDirectory}. Set FIVEMESH_ROOT to the project folder.`,
  );
}

function readPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
