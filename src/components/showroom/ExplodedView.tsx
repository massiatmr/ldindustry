import { Layers } from "lucide-react";
import { toast } from "sonner";

export const EXPLODED_PARTS = [
  "Moteur",
  "Cabine",
  "Roues",
  "Transmission",
  "Châssis",
  "Attelage arrière",
];

/** Interface only: activates when a product's GLB ships separable component nodes. */
export function ExplodedView({
  supported,
  active,
  onToggle,
}: {
  supported: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        supported
          ? onToggle()
          : toast("Vue éclatée indisponible", {
              description:
                "Ce modèle 3D ne contient pas encore de composants séparés (" +
                EXPLODED_PARTS.join(", ") +
                ").",
            })
      }
      className={`flex w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:border-foreground"} ${supported ? "" : "text-muted-foreground"}`}
    >
      <Layers className="h-4 w-4" /> Vue éclatée{" "}
      {!supported && <span className="text-[10px] uppercase tracking-wider">· bientôt</span>}
    </button>
  );
}
