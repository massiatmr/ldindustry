import { useEffect, useRef, useState } from "react";
import { Hand, Loader2, AlertTriangle } from "lucide-react";
import type { Product, ConfigOption } from "@/lib/showroom/products";
import { CameraControls, type CameraPreset } from "./CameraControls";
import { ModelHotspots } from "./ModelHotspots";

type MV = HTMLElement & {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  jumpCameraToGoal: () => void;
  model?: { materials: { name: string; pbrMetallicRoughness: { setBaseColorFactor: (c: number[]) => void } }[] };
};

const ORBITS: Record<CameraPreset, string> = {
  front: "0deg 75deg auto",
  rear: "180deg 75deg auto",
  side: "90deg 78deg auto",
  reset: "-35deg 72deg auto",
};

export function MachineryViewer({ product, colorOption }: { product: Product; colorOption?: ConfigOption | undefined }) {
  const ref = useRef<MV | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false); // custom element registered
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    let alive = true;
    // Check the file exists first so a missing GLB shows a clear message.
    fetch(product.modelUrl, { method: "HEAD" })
      .then((r) => { if (!r.ok) throw new Error(); })
      .then(() => import("@google/model-viewer"))
      .then(() => alive && setReady(true))
      .catch(() => alive && setError("Le modèle 3D de ce produit n'est pas encore disponible."));
    return () => { alive = false; };
  }, [product.modelUrl]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onP = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onL = () => setLoaded(true);
    const onE = () => setError("Impossible de charger le modèle 3D. Réessayez plus tard.");
    const onI = () => setHint(false);
    el.addEventListener("progress", onP);
    el.addEventListener("load", onL);
    el.addEventListener("error", onE);
    el.addEventListener("pointerdown", onI);
    return () => { el.removeEventListener("progress", onP); el.removeEventListener("load", onL); el.removeEventListener("error", onE); el.removeEventListener("pointerdown", onI); };
  }, [ready]);

  // Real material change on the GLB — only for options that name a material in the model.
  useEffect(() => {
    const m = colorOption?.material;
    if (!loaded || !m) return;
    const mat = ref.current?.model?.materials.find((x) => x.name === m.name);
    mat?.pbrMetallicRoughness.setBaseColorFactor(m.color);
  }, [loaded, colorOption]);

  const preset = (p: CameraPreset) => {
    const el = ref.current; if (!el) return;
    setAutoRotate(false);
    el.cameraOrbit = ORBITS[p];
    el.cameraTarget = "auto auto auto";
    el.fieldOfView = "auto";
  };
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrap.current?.requestFullscreen();
  };

  return (
    <div ref={wrap} className="showroom-stage relative h-full min-h-[420px] w-full overflow-hidden bg-showroom">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-primary" />
          <p className="font-display text-2xl uppercase">Modèle 3D indisponible</p>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
      ) : ready ? (
        <model-viewer
          ref={ref}
          src={product.modelUrl}
          alt={`Modèle 3D — ${product.name}`}
          camera-controls=""
          touch-action="pan-y"
          {...(autoRotate ? { "auto-rotate": "" } : {})}
          auto-rotate-delay="0"
          rotation-per-second="18deg"
          interaction-prompt="none"
          camera-orbit={ORBITS.reset}
          min-camera-orbit="auto 20deg auto"
          max-camera-orbit="auto 88deg auto"
          shadow-intensity="1.2"
          shadow-softness="0.8"
          exposure="1.05"
          environment-image="neutral"
          interpolation-decay="120"
          loading="lazy"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <ModelHotspots hotspots={product.hotspots} active={active} onSelect={(id) => { setActive(id); setAutoRotate(false); }} />
        </model-viewer>
      ) : null}

      {!loaded && !error && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="h-1 w-48 overflow-hidden bg-border"><div className="h-full bg-primary transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Chargement du modèle · {Math.round(progress * 100)}%</p>
        </div>
      )}

      {loaded && hint && (
        <div className="pointer-events-none absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 bg-card/90 px-4 py-2 text-xs font-medium shadow-sm backdrop-blur">
          <Hand className="h-4 w-4 text-primary" /> Faites glisser pour tourner · Molette ou pincement pour zoomer
        </div>
      )}

      {!error && (
        <CameraControls autoRotate={autoRotate} onToggleRotate={() => setAutoRotate((v) => !v)} onPreset={preset} onFullscreen={fullscreen} />
      )}
    </div>
  );
}
