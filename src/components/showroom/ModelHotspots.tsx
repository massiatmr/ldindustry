import type { Hotspot } from "@/lib/showroom/products";
import { X } from "lucide-react";

/** Hotspots are slotted into <model-viewer>, which keeps them attached to 3D coordinates. */
export function ModelHotspots({ hotspots, active, onSelect }: { hotspots: Hotspot[]; active: string | null; onSelect: (id: string | null) => void }) {
  return (
    <>
      {hotspots.map((h) => {
        const on = active === h.id;
        return (
          <button
            key={h.id}
            type="button"
            slot={`hotspot-${h.id}`}
            data-position={h.position.map((n) => `${n}m`).join(" ")}
            {...(h.normal ? { "data-normal": h.normal.map((n) => `${n}m`).join(" ") } : {})}
            data-visibility-attribute="visible"
            onClick={(e) => { e.stopPropagation(); onSelect(on ? null : h.id); }}
            className="hotspot group relative"
            aria-label={h.label}
          >
            <span className={`block h-4 w-4 rotate-45 border-2 border-card transition-all ${on ? "scale-125 bg-primary" : "bg-secondary group-hover:bg-primary"}`} />
            {!on && <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground opacity-0 transition-opacity group-hover:opacity-100">{h.label}</span>}
            {on && (
              <span className="absolute left-7 top-1/2 z-10 w-64 -translate-y-1/2 cursor-default border-l-4 border-primary bg-card p-4 text-left text-card-foreground shadow-xl" onClick={(e) => e.stopPropagation()}>
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-lg uppercase">{h.label}</span>
                  <span role="button" tabIndex={0} aria-label="Fermer" onClick={() => onSelect(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></span>
                </span>
                {h.image && <img src={h.image} alt="" className="mt-2 aspect-video w-full object-cover" />}
                <span className="mt-1 block text-sm text-muted-foreground">{h.description}</span>
                {h.specs && (
                  <span className="mt-3 block border-t border-border pt-2 text-xs">
                    {h.specs.map((s) => <span key={s.k} className="flex justify-between py-0.5"><span className="text-muted-foreground">{s.k}</span><b>{s.v}</b></span>)}
                  </span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
