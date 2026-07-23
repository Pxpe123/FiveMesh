import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class EngineClient {
  constructor(
    private readonly projectPath: string,
    private readonly timeoutMs: number,
  ) {}

  async createPreview(
    modelPath: string,
    outputPath: string,
    texturePaths: string[] = [],
  ) {
    const engineArguments = [
      "run",
      "--project",
      this.projectPath,
      "--no-build",
      "--",
      "preview",
      modelPath,
      outputPath,
    ];

    engineArguments.push(...texturePaths);

    await execFileAsync("dotnet", engineArguments, {
      timeout: this.timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
  }
}
