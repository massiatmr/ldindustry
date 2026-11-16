import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().trim().min(2, "Nom requis").max(100),
  phone: z.string().trim().regex(/^[+0-9 ()-]{8,20}$/, "Numéro invalide"),
  email: z.string().trim().email("E-mail invalide").max(255),
  message: z.string().trim().max(1000).optional(),
});
export type QuoteRequest = z.infer<typeof schema> & { product: string; configuration: string[] };

/** Swap this for a database insert / server function when the backend is connected. */
async function submitQuote(_req: QuoteRequest) {
  await new Promise((r) => setTimeout(r, 600));
}

export function QuotationForm({ open, onOpenChange, product, configuration }: { open: boolean; onOpenChange: (o: boolean) => void; product: string; configuration: string[] }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(fd);
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setState("sending");
    await submitQuote({ ...r.data, product, configuration });
    setState("done");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setState("idle"); }}>
      <DialogContent className="max-w-lg rounded-none border-t-4 border-t-primary">
        {state === "done" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
            <DialogTitle className="mt-4 font-display text-3xl uppercase">Demande envoyée</DialogTitle>
            <DialogDescription className="mt-2">Merci ! Notre équipe vous recontacte rapidement au sujet du {product}.</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl uppercase">Demander un devis</DialogTitle>
              <DialogDescription>Le modèle et la configuration sont déjà renseignés.</DialogDescription>
            </DialogHeader>
            <div className="border border-border bg-muted/50 p-4 text-sm">
              <p className="font-semibold">{product}</p>
              <ul className="mt-1 text-muted-foreground">{configuration.map((c) => <li key={c}>· {c}</li>)}</ul>
            </div>
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              {([["fullName", "Nom complet", "text"], ["phone", "Téléphone", "tel"], ["email", "E-mail", "email"]] as const).map(([n, l, t]) => (
                <div key={n}>
                  <Label htmlFor={n}>{l}</Label>
                  <Input id={n} name={n} type={t} className="mt-1 rounded-none" />
                  {errors[n] && <p className="mt-1 text-xs text-destructive">{errors[n]}</p>}
                </div>
              ))}
              <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" className="mt-1 rounded-none" rows={3} /></div>
              <button disabled={state === "sending"} className="w-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-red disabled:opacity-60">{state === "sending" ? "Envoi…" : "Envoyer la demande"}</button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
