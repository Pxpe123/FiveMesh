import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import type { PreviewModel } from "../../../types/previewModel";
import { buildPreviewGroup } from "./buildPreviewGroup";
import {
  getDefaultVehiclePaint,
  type VehiclePaintSettings,
} from "./vehiclePaint";
import {
  viewerEnvironments,
  type ViewerEnvironment,
} from "./viewerTools";

type ViewerOptions = {
  wireframe: boolean;
  autoRotate: boolean;
  environment: ViewerEnvironment;
  showGrid: boolean;
  showAxes: boolean;
  showBounds: boolean;
};

export type ViewerSession = {
  setWireframe: (enabled: boolean) => void;
  setAutoRotate: (enabled: boolean) => void;
  setVehiclePaint: (paint: VehiclePaintSettings) => void;
  setEnvironment: (environment: ViewerEnvironment) => void;
  setGridVisible: (visible: boolean) => void;
  setAxesVisible: (visible: boolean) => void;
  setBoundsVisible: (visible: boolean) => void;
  resetCamera: () => void;
  captureScreenshot: () => void;
  dispose: () => void;
};

export function createViewerSession(
  host: HTMLDivElement,
  model: PreviewModel | null,
  options: ViewerOptions,
): ViewerSession {
  const sceneParts = createScene();
  const { scene, grid, axes, keyLight, fillLight, rimLight } = sceneParts;
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 10_000);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
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

  let boundsHelper: THREE.Box3Helper | null = null;
  let boundsVisible = options.showBounds;

  const updateBounds = (visible: boolean) => {
    boundsVisible = visible;
    if (boundsHelper) {
      scene.remove(boundsHelper);
      boundsHelper = null;
    }

    if (visible && model) {
      boundsHelper = new THREE.Box3Helper(
        new THREE.Box3().setFromObject(resources.group),
        new THREE.Color("#61e5a7"),
      );
      scene.add(boundsHelper);
    }
  };

  applyEnvironment(options.environment, sceneParts);
  grid.visible = options.showGrid;
  axes.visible = options.showAxes;

  if (model) {
    frameModel(resources.group, camera, controls);
  } else {
    camera.position.set(6, -8, 4);
    controls.target.set(0, 0, 0.8);
  }
  updateBounds(options.showBounds);

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
      updateBounds(boundsVisible);
    },
    setEnvironment(environment) {
      applyEnvironment(environment, sceneParts);
    },
    setGridVisible(visible) {
      grid.visible = visible;
    },
    setAxesVisible(visible) {
      axes.visible = visible;
    },
    setBoundsVisible(visible) {
      updateBounds(visible);
    },
    resetCamera() {
      if (model) {
        frameModel(resources.group, camera, controls);
      } else {
        camera.position.set(6, -8, 4);
        controls.target.set(0, 0, 0.8);
      }
    },
    captureScreenshot() {
      renderer.domElement.toBlob((blob) => {
        if (!blob) {
          return;
        }

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${model?.name ?? "fivemesh-view"}.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, "image/png");
    },
    dispose() {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      controls.dispose();
      resources.geometries.forEach((geometry) => geometry.dispose());
      resources.materials.forEach((material) => material.dispose());
      resources.textures.forEach((texture) => texture.dispose());
      if (boundsHelper) {
        scene.remove(boundsHelper);
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

type SceneParts = {
  scene: THREE.Scene;
  grid: THREE.GridHelper;
  axes: THREE.AxesHelper;
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.HemisphereLight;
  rimLight: THREE.DirectionalLight;
};

function createScene(): SceneParts {
  const scene = new THREE.Scene();
  const fillLight = new THREE.HemisphereLight("#d8e8ff", "#17212d", 2.4);
  scene.add(fillLight);

  const keyLight = new THREE.DirectionalLight("#ffffff", 4);
  keyLight.position.set(5, -6, 9);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight("#67e8f9", 2);
  rimLight.position.set(-7, 4, 4);
  scene.add(rimLight);

  const grid = new THREE.GridHelper(80, 80, "#314052", "#171f29");
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  const axes = new THREE.AxesHelper(3);
  axes.renderOrder = 10;
  scene.add(axes);

  return { scene, grid, axes, keyLight, fillLight, rimLight };
}

function applyEnvironment(environment: ViewerEnvironment, parts: SceneParts) {
  const preset = viewerEnvironments[environment];
  parts.scene.background = new THREE.Color(preset.background);
  parts.scene.fog = new THREE.Fog(preset.fog, 45, 140);
  parts.keyLight.color.set(preset.key);
  parts.fillLight.color.set(preset.fill);
  parts.fillLight.groundColor.set(environment === "night" ? "#08101c" : "#17212d");
  parts.rimLight.intensity = environment === "night" ? 1.1 : 2;
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
