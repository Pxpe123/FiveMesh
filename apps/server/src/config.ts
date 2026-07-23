import path from "node:path";
import { fileURLToPath } from "node:url";

export type AppConfig = {
  port: number;
  webOrigin: string;
  engineProjectPath: string;
  examplesDirectory: string;
  engineTimeoutMs: number;
  maxUploadBytes: number;
};

const serverDirectory = fileURLToPath(new URL("../", import.meta.url));
const repositoryRoot = path.resolve(serverDirectory, "../..");

export const loadConfig = (): AppConfig => ({
  port: readPositiveNumber(process.env.PORT, 3000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  engineProjectPath:
    process.env.ENGINE_PROJECT_PATH ??
    path.join(repositoryRoot, "apps", "engine", "Engine.csproj"),
  examplesDirectory:
    process.env.EXAMPLES_DIRECTORY ?? path.join(repositoryRoot, "examples"),
  engineTimeoutMs: readPositiveNumber(process.env.ENGINE_TIMEOUT_MS, 120_000),
  maxUploadBytes: readPositiveNumber(
    process.env.MAX_UPLOAD_BYTES,
    300 * 1024 * 1024,
  ),
});

function readPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
