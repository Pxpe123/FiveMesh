import * as THREE from "three";
import { DDSLoader } from "three/addons/loaders/DDSLoader.js";

const ddsLoader = new DDSLoader();

export function createDdsTexture(base64: string) {
  try {
    const buffer = decodeBase64(base64);
    if (!hasDdsHeader(buffer)) {
      return null;
    }

    const data = ddsLoader.parse(buffer, false);
    if (!data.width || !data.height || !data.format || data.mipmaps.length === 0) {
      return null;
    }

    const texture = new THREE.CompressedTexture(
      data.mipmaps,
      data.width,
      data.height,
      data.format as THREE.CompressedPixelFormat,
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  } catch (error) {
    console.warn("Skipped an unsupported DDS texture.", error);
    return null;
  }
}

function decodeBase64(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function hasDdsHeader(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 4));
  return (
    bytes.length === 4 &&
    bytes[0] === 0x44 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x53 &&
    bytes[3] === 0x20
  );
}
