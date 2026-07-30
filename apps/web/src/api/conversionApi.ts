import { apiUrl } from "./apiBase";

export type ConversionDirection = "binary-to-xml" | "xml-to-binary";

export async function convertBinaryToXml(asset: File) {
  const body = new FormData();
  body.append("asset", asset);
  return requestDownload(apiUrl("/api/conversion/binary-to-xml"), body);
}

export async function convertXmlToBinary(
  xml: File,
  textures: File[],
  targetFormat: "YDR" | "YFT" | "YTD",
) {
  const body = new FormData();
  body.append("asset", xml);
  body.append("targetFormat", targetFormat);
  textures.forEach((texture) => body.append("textures", texture));
  return requestDownload(apiUrl("/api/conversion/xml-to-binary"), body);
}

async function requestDownload(url: string, body: FormData) {
  const response = await fetch(url, { method: "POST", body });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload && typeof payload.message === "string"
        ? payload.message
        : "The conversion could not be completed.",
    );
  }

  return {
    blob: await response.blob(),
    filename: getFilename(response.headers.get("Content-Disposition")),
  };
}

function getFilename(header: string | null) {
  const match = header?.match(/filename="([^"]+)"/i);
  return match?.[1] ?? "fivemesh-conversion";
}
