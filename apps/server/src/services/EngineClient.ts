import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class EngineClient {
  constructor(
    private readonly projectPath: string,
    private readonly executablePath: string,
    private readonly timeoutMs: number,
  ) {}

  async createPreview(
    modelPath: string,
    outputPath: string,
    texturePaths: string[] = [],
  ) {
    await this.run("preview", [modelPath, outputPath, ...texturePaths]);
  }

  async createConversion(
    direction: "binary-to-xml" | "xml-to-binary",
    inputPath: string,
    outputPath: string,
  ) {
    await this.run("convert", [direction, inputPath, outputPath]);
  }

  async createMloPreview(
    ytypPath: string,
    outputPath: string,
    assetPaths: string[] = [],
  ) {
    await this.run("mlo-preview", [ytypPath, outputPath, ...assetPaths]);
  }

  async editMloPortal(
    ytypPath: string,
    patchPath: string,
    outputPath: string,
  ) {
    await this.run("mlo-edit", [ytypPath, patchPath, outputPath]);
  }

  private async run(operation: string, argumentsAfterOperation: string[]) {
    const useBuiltEngine =
      Boolean(this.executablePath) && this.executablePath.endsWith(".dll");
    const engineArguments = useBuiltEngine
      ? [this.executablePath, operation, ...argumentsAfterOperation]
      : [
          "run",
          "--project",
          this.projectPath,
          "--no-build",
          "--",
          operation,
          ...argumentsAfterOperation,
        ];

    await execFileAsync("dotnet", engineArguments, {
      timeout: this.timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
  }
}
