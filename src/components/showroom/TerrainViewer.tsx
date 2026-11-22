import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { capabilities, mahindra8000, type CapabilityId } from "@/lib/showroom/mahindra8000";

const TRACTOR_SIZE = 4.2;
const FLAT_RADIUS = 11;

type TerrainViewerProps = {
  terrain: boolean;
  autoRotate: boolean;
  active: CapabilityId | null;
  onSelect: (id: CapabilityId | null) => void;
  onInteract: () => void;
};

type Anchor = { id: CapabilityId; label: string; part: string; point: THREE.Vector3 };

function heightAt(x: number, z: number) {
  const flat = THREE.MathUtils.smoothstep(Math.hypot(x, z), FLAT_RADIUS, FLAT_RADIUS + 26);
  return (
    flat *
    (Math.sin(x * 0.055) * Math.cos(z * 0.048) * 2.4 +
      Math.sin(x * 0.021 + 1.7) * Math.cos(z * 0.017) * 3.6)
  );
}

function makeGround() {
  const size = 260;
  const segments = 150;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const soil = new THREE.Color("#5d4a2f");
  const soilDry = new THREE.Color("#7a6540");
  const grass = new THREE.Color("#6a7a3d");
  const grassDry = new THREE.Color("#8a8a4e");
  const scratch = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    position.setY(i, heightAt(x, z));
    const patch = Math.sin(x * 0.22 + 3) * Math.cos(z * 0.19) + Math.sin(x * 0.07) * 0.5;
    scratch
      .copy(patch > 0.55 ? grass : patch > 0 ? grassDry : soil)
      .lerp(soilDry, Math.abs(patch) * 0.3);
    colors[i * 3] = scratch.r;
    colors[i * 3 + 1] = scratch.g;
    colors[i * 3 + 2] = scratch.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
  });
  return new THREE.Mesh(geometry, material);
}

function makeFurrows() {
  const group = new THREE.Group();
  const ridgeGeometry = new THREE.BoxGeometry(0.34, 0.14, 30);
  const ridgeMaterial = new THREE.MeshStandardMaterial({ color: "#4c3b22", roughness: 1 });
  const ridges = new THREE.InstancedMesh(ridgeGeometry, ridgeMaterial, 24);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 24; i++) {
    matrix.makeTranslation(-13 + i * 1.13, 0.07, 0);
    matrix.multiply(new THREE.Matrix4().makeRotationY((Math.random() - 0.5) * 0.012));
    ridges.setMatrixAt(i, matrix);
  }
  group.add(ridges);

  const rutMaterial = new THREE.MeshStandardMaterial({ color: "#33270f", roughness: 1 });
  for (const offset of [-0.78, 0.78]) {
    const rut = new THREE.Mesh(new THREE.BoxGeometry(32, 0.06, 0.3), rutMaterial);
    rut.position.set(0, 0.03, offset);
    group.add(rut);
  }
  return group;
}

function makeTrees() {
  const group = new THREE.Group();
  const trunkGeometry = new THREE.CylinderGeometry(0.16, 0.26, 2.2, 6);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#5b4632", roughness: 1 });
  const canopyGeometry = new THREE.IcosahedronGeometry(1.5, 1);
  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: "#66744a",
    roughness: 1,
    flatShading: true,
  });
  const count = 46;
  const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
  const canopies = new THREE.InstancedMesh(canopyGeometry, canopyMaterial, count);
  trunks.castShadow = true;
  canopies.castShadow = true;
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();
  let placed = 0;
  let guard = 0;
  while (placed < count && guard < 600) {
    guard++;
    const angle = Math.random() * Math.PI * 2;
    const radius = FLAT_RADIUS + 6 + Math.random() * 62;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.8;
    const y = heightAt(x, z);
    const s = 0.75 + Math.random() * 0.7;
    matrix.compose(
      position.set(x, y + 1.1 * s, z),
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI),
      scale.set(s, s, s),
    );
    trunks.setMatrixAt(placed, matrix);
    matrix.compose(
      position.set(x, y + 2.6 * s, z),
      quaternion.identity(),
      scale.set(s, s * 0.82, s),
    );
    canopies.setMatrixAt(placed, matrix);
    color.setHSL(0.24, 0.28 + Math.random() * 0.12, 0.32 + Math.random() * 0.12);
    canopies.setColorAt(placed, color);
    placed++;
  }
  group.add(trunks, canopies);
  return group;
}

function makeHills() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: "#7d92a0",
    roughness: 1,
    flatShading: true,
  });
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + 0.35;
    const radius = 130 + Math.random() * 45;
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(28 + Math.random() * 22, 16 + Math.random() * 14, 5),
      material,
    );
    hill.position.set(Math.cos(angle) * radius, -3, Math.sin(angle) * radius * 0.85);
    hill.rotation.y = Math.random() * Math.PI;
    group.add(hill);
  }
  return group;
}

function makeSky() {
  const geometry = new THREE.SphereGeometry(320, 24, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color("#5f97b8") },
      horizon: { value: new THREE.Color("#e7ddbc") },
    },
    vertexShader: `varying vec3 v_position; void main() { v_position = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying vec3 v_position;
      void main() { float h = clamp(v_position.y / 220.0, 0.0, 1.0); gl_FragColor = vec4(mix(horizon, top, pow(h, 0.7)), 1.0); }`,
  });
  return new THREE.Mesh(geometry, material);
}

function parseOrbit(orbit: string) {
  const [theta, phi] = orbit.split(" ");
  return {
    theta: THREE.MathUtils.degToRad(parseFloat(theta)),
    phi: THREE.MathUtils.degToRad(parseFloat(phi)),
  };
}

export function TerrainViewer({
  terrain,
  autoRotate,
  active,
  onSelect,
  onInteract,
}: TerrainViewerProps) {
  const mount = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    tractor: THREE.Group;
    environment: THREE.Group;
    studioGround: THREE.Mesh;
    sun: THREE.DirectionalLight;
    anchors: Anchor[];
    hotspotEls: Map<CapabilityId, HTMLButtonElement>;
    cameraGoal: { theta: number; phi: number; radius: number } | null;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 900);
    camera.position.set(7.5, 3.4, 8.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.1, 0);
    controls.minDistance = 3.5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotateSpeed = 0.9;
    controls.addEventListener("start", onInteract);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;

    const hemi = new THREE.HemisphereLight(0xbdd3e0, 0x54452c, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
    sun.position.set(14, 20, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const ground = makeGround();
    ground.receiveShadow = true;
    const environment = new THREE.Group();
    environment.add(ground, makeFurrows(), makeTrees(), makeHills(), makeSky());
    scene.add(environment);

    const studioGround = new THREE.Mesh(
      new THREE.CircleGeometry(9, 48),
      new THREE.MeshStandardMaterial({ color: "#e9e9e7", roughness: 0.9 }),
    );
    studioGround.rotation.x = -Math.PI / 2;
    studioGround.receiveShadow = true;

    const tractor = new THREE.Group();
    scene.add(tractor);
    const anchors: Anchor[] = [];
    const hotspotEls = new Map<CapabilityId, HTMLButtonElement>();
    const state = {
      renderer,
      scene,
      camera,
      controls,
      tractor,
      environment,
      studioGround,
      sun,
      anchors,
      hotspotEls,
      cameraGoal: null,
    };
    sceneRef.current = state;

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      mahindra8000.modelUrl,
      (gltf) => {
        if (disposed) return;
        const object = gltf.scene;
        const box = new THREE.Box3().setFromObject(object);
        const naturalSize = box.getSize(new THREE.Vector3());
        const scale = TRACTOR_SIZE / Math.max(naturalSize.x, naturalSize.y, naturalSize.z);
        object.scale.setScalar(scale);
        const scaled = new THREE.Box3().setFromObject(object);
        const size = scaled.getSize(new THREE.Vector3());
        const center = scaled.getCenter(new THREE.Vector3());
        object.position.set(-center.x, -scaled.min.y, -center.z);
        if (size.z > size.x) object.rotation.y = Math.PI / 2;
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        tractor.add(object);

        const unit = TRACTOR_SIZE / Math.max(size.x, size.y, size.z);
        capabilities.forEach((capability) => {
          const [x, y, z] = capability.position;
          const point = new THREE.Vector3(
            x * unit * 1.9,
            THREE.MathUtils.clamp(size.y / 2 + y * unit * 2.6, 0.25, size.y * 0.95),
            z * unit * 1.9,
          );
          anchors.push({
            id: capability.id,
            label: capability.label,
            part: capability.part,
            point,
          });
        });
        pendingHotspots.forEach((element, id) => {
          if (element) hotspotEls.set(id, element);
        });
        pendingHotspots.clear();
        setReady(true);
      },
      (event) => {
        if (!disposed) setProgress(event.total > 0 ? event.loaded / event.total : progress);
      },
      () => {
        if (!disposed) setError(true);
      },
    );

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const clock = new THREE.Clock();
    let frame = 0;
    const projected = new THREE.Vector3();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const goal = state.cameraGoal;
      if (goal) {
        const spherical = new THREE.Spherical().setFromVector3(
          camera.position.clone().sub(controls.target),
        );
        spherical.theta = THREE.MathUtils.lerp(spherical.theta, goal.theta, Math.min(delta * 4, 1));
        spherical.phi = THREE.MathUtils.lerp(spherical.phi, goal.phi, Math.min(delta * 4, 1));
        spherical.radius = THREE.MathUtils.lerp(
          spherical.radius,
          goal.radius,
          Math.min(delta * 4, 1),
        );
        camera.position.setFromSpherical(spherical).add(controls.target);
        if (Math.abs(spherical.theta - goal.theta) < 0.01) state.cameraGoal = null;
      }
      controls.update();
      renderer.render(scene, camera);
      const rect = renderer.domElement.getBoundingClientRect();
      anchors.forEach((anchor) => {
        const element = hotspotEls.get(anchor.id);
        if (!element) return;
        projected.copy(anchor.point).project(camera);
        const behind = projected.z > 1;
        element.style.opacity = behind ? "0" : "1";
        element.style.pointerEvents = behind ? "none" : "auto";
        if (!behind) {
          element.style.left = `${(projected.x * 0.5 + 0.5) * rect.width}px`;
          element.style.top = `${(-projected.y * 0.5 + 0.5) * rect.height}px`;
        }
      });
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener("start", onInteract);
      controls.dispose();
      pmrem.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const material = child.material;
          (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state || !ready) return;
    const { environment, studioGround, scene, sun } = state;
    environment.visible = terrain;
    studioGround.visible = !terrain;
    if (terrain) {
      if (!studioGround.parent) scene.add(studioGround);
      scene.background = null;
      scene.fog = new THREE.Fog(0xe7ddbc, 70, 300);
      sun.intensity = 2.6;
    } else {
      scene.background = new THREE.Color("#ececea");
      scene.fog = null;
      sun.intensity = 1.6;
    }
  }, [terrain, ready]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    state.controls.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state || !ready) return;
    if (!active) {
      state.cameraGoal = {
        theta: THREE.MathUtils.degToRad(140),
        phi: THREE.MathUtils.degToRad(68),
        radius: 11,
      };
      return;
    }
    const capability = capabilities.find((item) => item.id === active);
    if (!capability) return;
    const { theta, phi } = parseOrbit(capability.orbit);
    state.cameraGoal = {
      theta,
      phi,
      radius: Math.max(state.camera.position.distanceTo(state.controls.target) * 0.62, 4.5),
    };
  }, [active, ready]);

  const activeCapability = capabilities.find((item) => item.id === active) ?? null;

  return (
    <div
      ref={mount}
      data-scene-ready={ready || undefined}
      className="capability-stage relative h-full min-h-[410px] overflow-hidden bg-showroom"
    >
      {capabilities.map((capability, index) => (
        <button
          key={capability.id}
          ref={(element) => {
            const state = sceneRef.current;
            if (!element) {
              pendingHotspots.delete(capability.id);
              state?.hotspotEls.delete(capability.id);
              return;
            }
            if (state) state.hotspotEls.set(capability.id, element);
            else pendingHotspots.set(capability.id, element);
          }}
          type="button"
          aria-label={`${capability.label} — ${capability.part}`}
          title={capability.part}
          onClick={() => onSelect(capability.id)}
          className={`capability-point absolute z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-card bg-card/90 p-0 text-[10px] font-semibold shadow-sm transition-opacity ${active === capability.id ? "bg-primary text-primary-foreground" : ""} ${activeCapability && activeCapability.id !== capability.id ? "opacity-45" : ""}`}
        >
          {index + 1}
        </button>
      ))}
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 text-sm">
          <div className="h-1 w-48 overflow-hidden bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-muted-foreground">Préparation du terrain et du Mahindra 8000…</p>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-20 flex items-center justify-center bg-background p-8 text-center"
        >
          Le modèle n’a pas pu être chargé. Rechargez la page pour réessayer.
        </div>
      )}
      <span className="absolute bottom-7 right-5 z-20 bg-card/90 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {terrain ? "Champ d’oliviers · scène 3D" : "Studio · modèle 3D"}
      </span>
    </div>
  );
}

const pendingHotspots = new Map<CapabilityId, HTMLButtonElement | null>();
