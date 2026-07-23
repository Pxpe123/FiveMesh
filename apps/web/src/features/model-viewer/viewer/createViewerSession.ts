import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import type { PreviewModel } from "../../../types/previewModel";
import { buildPreviewGroup } from "./buildPreviewGroup";
import {
  getDefaultVehiclePaint,
  type VehiclePaintSettings,
} from "./vehiclePaint";

type ViewerOptions = {
  wireframe: boolean;
  autoRotate: boolean;
};

export type ViewerSession = {
  setWireframe: (enabled: boolean) => void;
  setAutoRotate: (enabled: boolean) => void;
  setVehiclePaint: (paint: VehiclePaintSettings) => void;
  dispose: () => void;
};

export function createViewerSession(
  host: HTMLDivElement,
  model: PreviewModel | null,
  options: ViewerOptions,
): ViewerSession {
  const scene = createScene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 10_000);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.replaceChildren(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.autoRotate = options.autoRotate;
  controls.autoRotateSpeed = 1.25;

  const resources = model
    ? buildPreviewGroup(model, options.wireframe, getDefaultVehiclePaint())
    : {
        group: new THREE.Group(),
        geometries: [],
        materials: [],
        textures: [],
      };
  scene.add(resources.group);

  if (model) {
    frameModel(resources.group, camera, controls);
  } else {
    camera.position.set(6, -8, 4);
    controls.target.set(0, 0, 0.8);
  }

  const resize = () => {
    const width = host.clientWidth;
    const height = Math.max(host.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  let animationFrame = 0;
  const render = () => {
    controls.update();
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  render();

  return {
    setWireframe(enabled) {
      for (const material of resources.materials) {
        material.wireframe = enabled;
      }
    },
    setAutoRotate(enabled) {
      controls.autoRotate = enabled;
    },
    setVehiclePaint(paint) {
      if (!model) {
        return;
      }

      scene.remove(resources.group);
      resources.geometries.forEach((geometry) => geometry.dispose());
      resources.materials.forEach((material) => material.dispose());
      resources.textures.forEach((texture) => texture.dispose());
      const nextResources = buildPreviewGroup(model, options.wireframe, paint);
      resources.group = nextResources.group;
      resources.geometries = nextResources.geometries;
      resources.materials = nextResources.materials;
      resources.textures = nextResources.textures;
      scene.add(resources.group);
      frameModel(resources.group, camera, controls);
    },
    dispose() {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      controls.dispose();
      resources.geometries.forEach((geometry) => geometry.dispose());
      resources.materials.forEach((material) => material.dispose());
      resources.textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#090d12");
  scene.fog = new THREE.Fog("#090d12", 45, 140);
  scene.add(new THREE.HemisphereLight("#d8e8ff", "#17212d", 2.4));

  const keyLight = new THREE.DirectionalLight("#ffffff", 4);
  keyLight.position.set(5, -6, 9);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight("#67e8f9", 2);
  rimLight.position.set(-7, 4, 4);
  scene.add(rimLight);

  const grid = new THREE.GridHelper(80, 80, "#314052", "#171f29");
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  return scene;
}

function frameModel(
  group: THREE.Group,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
) {
  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);

  const radius = Math.max(size.length() * 0.5, 1);
  camera.position.set(radius * 1.15, -radius * 1.65, radius * 0.8);
  controls.target.set(0, 0, 0);
  controls.minDistance = radius * 0.08;
  controls.maxDistance = radius * 12;
  camera.near = Math.max(radius / 1000, 0.001);
  camera.far = radius * 100;
  camera.updateProjectionMatrix();
}
