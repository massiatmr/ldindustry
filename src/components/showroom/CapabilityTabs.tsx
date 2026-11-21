import { useEffect, useState } from "react";
import { Gauge, Tractor, ArrowLeftRight, MoveUp, ShieldCheck, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capabilities, type CapabilityId } from "@/lib/showroom/mahindra8000";

const icons = [Tractor, Gauge, ArrowLeftRight, MoveUp, ShieldCheck];
export function useCapabilityTour(enabled = true) {
  const [active, setActive] = useState<CapabilityId | null>(null);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!enabled || !playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(
      () =>
        setActive((current) => {
          const index = capabilities.findIndex((feature) => feature.id === (current ?? "traction"));
          return capabilities[(index + 1) % capabilities.length]?.id ?? "traction";
        }),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [enabled, playing]);
  const select = (id: CapabilityId | null) => {
    setPlaying(false);
    setActive(id);
  };
  return {
    active,
    select,
    playing,
    toggle: () => setPlaying((value) => !value),
    pause: () => setPlaying(false),
  };
}

export function CapabilityTabs({
  active,
  onSelect,
  playing,
  onToggle,
  prefix,
}: {
  active: CapabilityId;
  onSelect: (id: CapabilityId) => void;
  playing: boolean;
  onToggle: () => void;
  prefix: string;
}) {
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Les atouts au travail
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={playing ? "Mettre la visite en pause" : "Lancer la visite automatique"}
          title={playing ? "Mettre la visite en pause" : "Lancer la visite automatique"}
          onClick={onToggle}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
      </div>
      <div
        role="tablist"
        aria-label="Atouts du Mahindra"
        className="grid grid-cols-5 gap-1 px-2 pb-2"
      >
        {capabilities.map((feature, index) => {
          const Icon = icons[index] ?? Tractor;
          return (
            <Button
              key={feature.id}
              id={`${prefix}-tab-${feature.id}`}
              role="tab"
              aria-selected={active === feature.id}
              aria-controls={`${prefix}-detail`}
              variant={active === feature.id ? "default" : "outline"}
              onClick={() => onSelect(feature.id)}
              className="relative h-14 min-w-0 flex-col gap-1 overflow-hidden rounded-sm px-0 text-[9px] hover:-translate-y-0.5"
            >
              <Icon className="h-4 w-4" />
              {feature.label}
              {active === feature.id && playing && (
                <span
                  key={feature.id}
                  className="capability-tour-progress absolute inset-x-0 bottom-0 h-0.5 bg-primary-foreground/70"
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
