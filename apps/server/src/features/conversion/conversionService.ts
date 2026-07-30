import { ZipArchive } from "archiver";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { HttpError } from "../../errors/HttpError.js";
import { EngineClient } from "../../services/EngineClient.js";

export type ConversionFile = {
  originalname: string;
  buffer: Buffer;
};

export type ConversionResult = {
  body: Buffer;
  contentType: string;
  filename: string;
};

export class ConversionService {
  constructor(private readonly engine: EngineClient) {}

  async binaryToXml(asset: ConversionFile): Promise<ConversionResult> {
    const extension = extensionOf(asset.originalname);
    if (!isBinaryExtension(extension)) {
      throw new HttpError(400, "Choose a YDR, YFT, or YTD file to export as XML.");
    }

    const workDirectory = await mkdtemp(
      path.join(tmpdir(), "fivemesh-convert-"),
    );
    const inputPath = path.join(workDirectory, safeName(asset.originalname));
    const outputPath = path.join(
      workDirectory,
      `${path.parse(asset.originalname).name}.xml`,
    );

    try {
      await writeFile(inputPath, asset.buffer);
      await this.engine.createConversion("binary-to-xml", inputPath, outputPath);

      const archive = await createArchive(workDirectory);
      return {
        body: archive,
        contentType: "application/zip",
        filename: `${path.parse(asset.originalname).name}-xml.zip`,
      };
    } catch (error) {
      throw new HttpError(422, conversionErrorMessage(error));
    } finally {
      await rm(workDirectory, { recursive: true, force: true });
    }
  }

  async xmlToBinary(
    xml: ConversionFile,
    textures: ConversionFile[],
    targetFormat: string,
  ): Promise<ConversionResult> {
    if (extensionOf(xml.originalname) !== ".xml") {
      throw new HttpError(400, "Choose an XML file to import.");
    }

    const extension = `.${targetFormat.toLowerCase().replace(/^\./, "")}`;
    if (!isBinaryExtension(extension)) {
      throw new HttpError(400, "Choose YDR, YFT, or YTD as the output format.");
    }

    const workDirectory = await mkdtemp(
      path.join(tmpdir(), "fivemesh-convert-"),
    );
    const inputPath = path.join(workDirectory, safeName(xml.originalname));
    const outputPath = path.join(
      workDirectory,
      `${path.parse(xml.originalname).name}${extension}`,
    );

    try {
      await writeFile(inputPath, xml.buffer);
      await Promise.all(
        textures.map((texture) =>
          writeFile(
            path.join(workDirectory, safeName(texture.originalname)),
            texture.buffer,
          ),
        ),
      );
      await this.engine.createConversion("xml-to-binary", inputPath, outputPath);

      return {
        body: await readFile(outputPath),
        contentType: "application/octet-stream",
        filename: path.basename(outputPath),
      };
    } catch (error) {
      throw new HttpError(422, conversionErrorMessage(error));
    } finally {
      await rm(workDirectory, { recursive: true, force: true });
    }
  }
}

async function createArchive(directory: string) {
  const files = (await readdir(directory)).filter(
    (file) =>
      !file.endsWith(".ydr") &&
      !file.endsWith(".yft") &&
      !file.endsWith(".ytd"),
  );
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    for (const file of files) {
      archive.file(path.join(directory, file), { name: file });
    }
    void archive.finalize();
  });
}

function extensionOf(name: string) {
  return path.extname(name).toLowerCase();
}

function isBinaryExtension(extension: string) {
  return extension === ".ydr" || extension === ".yft" || extension === ".ytd";
}

function safeName(name: string) {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function conversionErrorMessage(error: unknown) {
  if (error instanceof Error && "stderr" in error) {
    const stderr = String(error.stderr).trim();
    if (stderr) {
      return stderr;
    }
  }

  return error instanceof Error
    ? error.message
    : "The asset could not be converted.";
}
