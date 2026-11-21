import { RotateCw, Pause, Maximize, RefreshCcw } from "lucide-react";

export type CameraPreset = "front" | "rear" | "side" | "reset";

export function CameraControls({
  autoRotate,
  onToggleRotate,
  onPreset,
  onFullscreen,
}: {
  autoRotate: boolean;
  onToggleRotate: () => void;
  onPreset: (p: CameraPreset) => void;
  onFullscreen: () => void;
}) {
  const btn =
    "flex h-10 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-secondary hover:text-secondary-foreground";
  return (
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 divide-x divide-border border border-border bg-card/95 shadow-lg backdrop-blur">
      {(
        [
          ["front", "Avant"],
          ["side", "Côté"],
          ["rear", "Arrière"],
        ] as const
      ).map(([p, l]) => (
        <button key={p} type="button" className={btn} onClick={() => onPreset(p)}>
          {l}
        </button>
      ))}
      <button
        type="button"
        className={btn}
        onClick={onToggleRotate}
        aria-label="Rotation automatique"
      >
        {autoRotate ? <Pause className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
        <span className="hidden sm:inline">Rotation</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => onPreset("reset")}
        aria-label="Réinitialiser la caméra"
      >
        <RefreshCcw className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={onFullscreen} aria-label="Plein écran">
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  );
}
