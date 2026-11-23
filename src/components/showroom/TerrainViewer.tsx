import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { capabilities, mahindra8000, type CapabilityId } from "@/lib/showroom/mahindra8000";

const TRACTOR_SIZE = 4.2;

type TerrainViewerProps = {
  terrain: boolean;
  autoRotate: boolean;
  active: CapabilityId | null;
  onSelect: (id: CapabilityId | null) => void;
  onInteract: () => void;
};

type Anchor = { id: CapabilityId; label: string; part: string; point: THREE.Vector3 };

const GROUND_SIZE = 400;
const GROUND_SEGMENTS = 400;

function fbm(x: number, z: number, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * (Math.sin(x * 0.08 * frequency) * Math.cos(z * 0.07 * frequency));
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function heightAt(x: number, z: number) {
  const dist = Math.hypot(x, z);
  const flatten = THREE.MathUtils.smoothstep(dist, 14, 60);
  return flatten * fbm(x, z) * 3.2;
}

function makeGround() {
  const geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, GROUND_SEGMENTS, GROUND_SEGMENTS);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const grass = new THREE.Color("#5a6b35");
  const grassDry = new THREE.Color("#7d8a4a");
  const soil = new THREE.Color("#6b5a38");
  const scratch = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    position.setY(i, heightAt(x, z));
    const n = fbm(x + 100, z + 100, 3);
    const dryness = THREE.MathUtils.clamp(n * 1.2 + 0.5, 0, 1);
    scratch.copy(grass).lerp(grassDry, dryness);
    const dist = Math.hypot(x, z);
    if (dist > 30) {
      const soilMix = THREE.MathUtils.smoothstep(dist, 30, 80);
      scratch.lerp(soil, soilMix * 0.4);
    }
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

function makeSky() {
  const geometry = new THREE.SphereGeometry(380, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color("#4a90c2") },
      horizon: { value: new THREE.Color("#cfe0ec") },
    },
    vertexShader: `varying vec3 v_position; void main() { v_position = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying vec3 v_position;
      void main() { float h = clamp(v_position.y / 280.0, 0.0, 1.0); gl_FragColor = vec4(mix(horizon, top, pow(h, 0.6)), 1.0); }`,
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
    viewRadius: number;
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
    environment.add(ground, makeSky());
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
      viewRadius: 11,
    };
    sceneRef.current = state;

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      mahindra8000.modelUrl,
      (gltf) => {
        if (disposed) return;
        const object = gltf.scene;
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Step 1: Measure raw model and compute scale.
        const rawBox = new THREE.Box3().setFromObject(object);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const rawCenter = rawBox.getCenter(new THREE.Vector3());
        const scale = TRACTOR_SIZE / Math.max(rawSize.x, rawSize.y, rawSize.z);

        // Step 2: Center the geometry at origin via a wrapper, so rotation
        // pivots around the tractor's true center — not the GLTF's arbitrary
        // local origin (which is often offset from the geometry).
        const wrapper = new THREE.Group();
        object.scale.setScalar(scale);
        object.position.set(-rawCenter.x * scale, -rawBox.min.y * scale, -rawCenter.z * scale);
        wrapper.add(object);

        // Step 3: Rotate the wrapper (pivots around origin = tractor center).
        if (rawSize.z > rawSize.x) wrapper.rotation.y = Math.PI / 2;

        tractor.add(wrapper);
        wrapper.updateWorldMatrix(true, true);

        // Step 4: Measure final bounding box for camera setup.
        const finalBox = new THREE.Box3().setFromObject(wrapper);
        const size = finalBox.getSize(new THREE.Vector3());
        const centerY = size.y / 2;

        controls.target.set(0, centerY, 0);
        const viewRadius = Math.max(size.x, size.z) * 2.6;
        state.viewRadius = viewRadius;
        controls.minDistance = viewRadius * 0.35;
        controls.maxDistance = viewRadius * 4;
        const initSpherical = new THREE.Spherical(
          viewRadius,
          THREE.MathUtils.degToRad(68),
          THREE.MathUtils.degToRad(140),
        );
        camera.position.setFromSpherical(initSpherical).add(controls.target);
        controls.update();

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
      scene.fog = new THREE.Fog(0xcfe0ec, 120, 350);
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
        radius: state.viewRadius,
      };
      return;
    }
    const capability = capabilities.find((item) => item.id === active);
    if (!capability) return;
    const { theta, phi } = parseOrbit(capability.orbit);
    state.cameraGoal = {
      theta,
      phi,
      radius: Math.max(state.viewRadius * 0.55, 4.5),
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
        {terrain ? "Terrain · scène 3D" : "Studio · modèle 3D"}
      </span>
    </div>
  );
}

const pendingHotspots = new Map<CapabilityId, HTMLButtonElement | null>();
