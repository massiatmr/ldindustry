import type { ConfigCategory } from "@/lib/showroom/products";
import { Check, Lock } from "lucide-react";

export type Selection = Record<string, string>;

export function ConfigurationPanel({
  categories,
  selection,
  onChange,
}: {
  categories: ConfigCategory[];
  selection: Selection;
  onChange: (cat: string, opt: string) => void;
}) {
  return (
    <div className="space-y-5">
      {categories.map((c) => (
        <div key={c.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-sans text-xs font-bold normal-case tracking-wide">{c.label}</h3>
            {!c.available && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" /> Bientôt disponible
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {c.options.map((o) => {
              const on = selection[c.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={!c.available}
                  title={c.available ? o.label : "Option non disponible sur ce modèle 3D"}
                  onClick={() => onChange(c.id, o.id)}
                  className={`flex items-center gap-2 border px-3 py-2 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-primary bg-primary/5 font-semibold" : "border-border hover:border-foreground"}`}
                >
                  {o.swatch && (
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ background: o.swatch }}
                    />
                  )}
                  {o.label}
                  {on && <Check className="h-3 w-3 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function configSummary(categories: ConfigCategory[], selection: Selection) {
  return categories.flatMap((c) => {
    const o = c.options.find((x) => x.id === selection[c.id]);
    return o ? [`${c.label} : ${o.label}`] : [];
  });
}
