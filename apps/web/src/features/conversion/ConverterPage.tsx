import { useEffect, useState } from "react";

import {
  convertBinaryToXml,
  convertXmlToBinary,
  type ConversionDirection,
} from "../../api/conversionApi";

type BinaryFormat = "YDR" | "YFT" | "YTD";

export function ConverterPage() {
  const [direction, setDirection] = useState<ConversionDirection>("binary-to-xml");
  const [asset, setAsset] = useState<File | null>(null);
  const [textures, setTextures] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<BinaryFormat>("YDR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState("");

  useEffect(() => {
    setAsset(null);
    setTextures([]);
    setError("");
    setComplete("");
  }, [direction]);

  const submit = async () => {
    if (!asset) {
      setError("Choose a file to convert first.");
      return;
    }

    setLoading(true);
    setError("");
    setComplete("");
    try {
      const result =
        direction === "binary-to-xml"
          ? await convertBinaryToXml(asset)
          : await convertXmlToBinary(asset, textures, targetFormat);
      download(result.blob, result.filename);
      setComplete(`Conversion complete. ${result.filename} was downloaded.`);
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : "The conversion could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="converter-page">
      <div className="converter-intro">
        <p className="section-label">Asset conversion</p>
        <h1>Move between GTA files and editable XML.</h1>
        <p className="lede">
          FiveMesh uses the CodeWalker conversion layer to export YDR, YFT, and
          YTD assets to XML, or rebuild those binary formats from XML and any
          referenced texture files.
        </p>
      </div>

      <div className="converter-card">
        <div
          className="conversion-switch"
          role="group"
          aria-label="Conversion direction"
        >
          <button
            type="button"
            className={direction === "binary-to-xml" ? "active" : ""}
            onClick={() => setDirection("binary-to-xml")}
          >
            Binary to XML
          </button>
          <button
            type="button"
            className={direction === "xml-to-binary" ? "active" : ""}
            onClick={() => setDirection("xml-to-binary")}
          >
            XML to Binary
          </button>
        </div>

        <label className="converter-field">
          <span>
            {direction === "binary-to-xml" ? "Asset file" : "XML file"}
          </span>
          <input
            type="file"
            accept={direction === "binary-to-xml" ? ".ydr,.yft,.ytd" : ".xml"}
            onChange={(event) => setAsset(event.target.files?.[0] ?? null)}
          />
        </label>

        {direction === "xml-to-binary" && (
          <>
            <label className="converter-field">
              <span>Output format</span>
              <select
                value={targetFormat}
                onChange={(event) =>
                  setTargetFormat(event.target.value as BinaryFormat)
                }
              >
                <option value="YDR">YDR drawable</option>
                <option value="YFT">YFT fragment</option>
                <option value="YTD">YTD texture dictionary</option>
              </select>
            </label>
            <label className="converter-field">
              <span>Referenced textures (if the XML uses them)</span>
              <input
                type="file"
                multiple
                accept=".dds,.png,.jpg,.jpeg"
                onChange={(event) =>
                  setTextures(Array.from(event.target.files ?? []))
                }
              />
            </label>
          </>
        )}

        <p className="converter-note">
          {direction === "binary-to-xml"
            ? "Exports an archive containing the XML and any extracted texture sidecars."
            : "Keep the XML and referenced texture files together so CodeWalker can resolve them."}
        </p>

        {error && <p className="error-message">{error}</p>}
        {complete && <p className="success-message">{complete}</p>}

        <button
          className="load-button"
          type="button"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Converting..." : "Convert and download"}
        </button>
      </div>
    </section>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
