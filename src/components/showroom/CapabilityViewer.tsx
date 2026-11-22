import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Maximize, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capabilities, mahindra8000, type CapabilityId } from "@/lib/showroom/mahindra8000";
type Viewer = HTMLElement & { cameraOrbit: string; cameraTarget: string; loaded: boolean };
export function CapabilityViewer({
  active,
  onSelect,
  terrain,
  onInteract,
}: {
  active: CapabilityId | null;
  onSelect: (id: CapabilityId | null) => void;
  terrain: boolean;
  onInteract?: () => void;
}) {
  const viewer = useRef<Viewer | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [registered, setRegistered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [rotate, setRotate] = useState(false);
  useEffect(() => {
    let alive = true;
    import("@google/model-viewer")
      .then(() => {
        if (alive) setRegistered(true);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const onLoad = () => setLoaded(true);
    const onError = () => setError(true);
    element.addEventListener("load", onLoad);
    element.addEventListener("error", onError);
    if (element.loaded) onLoad();
    return () => {
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
    };
  }, [registered]);
  useEffect(() => {
    const element = viewer.current;
    if (!element || !loaded) return;
    const feature = capabilities.find((item) => item.id === active);
    element.cameraOrbit = (feature?.orbit ?? "45deg 76deg auto").replace("auto", "115%");
    element.cameraTarget = "auto auto auto";
    setRotate(false);
  }, [active, loaded]);
  return (
    <div
      ref={wrapper}
      onPointerDown={onInteract}
      data-scene-ready={loaded || undefined}
      className={`capability-stage relative h-full min-h-[410px] overflow-hidden bg-showroom ${terrain ? "terrain-active" : "terrain-studio"}`}
    >
      {terrain && (
        <div className="terrain-scene" aria-hidden="true">
          <div className="terrain-sky" />
          <div className="terrain-sun" />
          <div className="terrain-mountain terrain-mountain-back" />
          <div className="terrain-mountain terrain-mountain-front" />
          <div className="terrain-horizon" />
          <div className="terrain-field">
            <span className="terrain-row terrain-row-one" />
            <span className="terrain-row terrain-row-two" />
            <span className="terrain-row terrain-row-three" />
            <span className="terrain-row terrain-row-four" />
            <span className="terrain-row terrain-row-five" />
            <span className="terrain-row terrain-row-six" />
          </div>
          <div className="terrain-dust terrain-dust-one" />
          <div className="terrain-dust terrain-dust-two" />
        </div>
      )}
      {registered && (
        <model-viewer
          ref={viewer}
          src={mahindra8000.modelUrl}
          alt="Mahindra 8000 — tracteur 3D"
          camera-controls=""
          touch-action="pan-y"
          interaction-prompt="none"
          camera-orbit="45deg 76deg 115%"
          min-camera-orbit="auto 30deg 0.8m"
          max-camera-orbit="auto 88deg 3m"
          field-of-view="auto"
          shadow-intensity="1.1"
          shadow-softness="1"
          exposure="1.1"
          environment-image="neutral"
          loading="eager"
          {...(rotate ? { "auto-rotate": "", "rotation-per-second": "12deg" } : {})}
          className="relative z-10 h-full w-full"
        >
          {capabilities.map((feature, index) => (
            <Button
              key={feature.id}
              slot={`hotspot-${feature.id}`}
              data-position={feature.position.map((n) => `${n}m`).join(" ")}
              data-visibility-attribute="visible"
              variant={active === feature.id ? "default" : "secondary"}
              size="icon"
              aria-label={`${feature.label} — ${feature.part}`}
              title={feature.part}
              onClick={() => onSelect(feature.id)}
              className="capability-point h-5 w-5 rounded-full border border-card p-0 text-[9px] font-semibold shadow-sm"
            >
              {index + 1}
            </Button>
          ))}
        </model-viewer>
      )}
      {!loaded && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 bg-background/80 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Chargement du Mahindra 8000…
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-background p-8 text-center"
        >
          Le modèle n’a pas pu être chargé. Rechargez la page pour réessayer.
        </div>
      )}
      <div className="absolute bottom-5 left-5 flex gap-1 border border-border bg-card/95 p-1">
        <Button
          variant="ghost"
          size="icon"
          title="Vue d’ensemble"
          aria-label="Vue d’ensemble"
          onClick={() => onSelect(null)}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title={rotate ? "Arrêter la rotation" : "Rotation automatique"}
          aria-label="Rotation automatique"
          aria-pressed={rotate}
          onClick={() => setRotate((value) => !value)}
        >
          {rotate ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Plein écran"
          aria-label="Plein écran"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void wrapper.current?.requestFullscreen();
          }}
        >
          <Maximize />
        </Button>
      </div>
      <span className="absolute bottom-7 right-5 bg-card/90 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {terrain ? "Kabylie · décor illustratif" : "Vue extérieure · modèle fourni"}
      </span>
    </div>
  );
}
