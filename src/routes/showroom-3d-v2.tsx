import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Toaster } from "@/components/ui/sonner";
import { products } from "@/lib/showroom/products";
import { MachineryViewer } from "@/components/showroom/MachineryViewer";
import { ProductInformation } from "@/components/showroom/ProductInformation";
import { ConfigurationPanel, configSummary, type Selection } from "@/components/showroom/ConfigurationPanel";
import { TechnicalSpecifications } from "@/components/showroom/TechnicalSpecifications";
import { ExplodedView } from "@/components/showroom/ExplodedView";
import { QuotationForm } from "@/components/showroom/QuotationForm";

export const Route = createFileRoute("/showroom-3d-v2")({
  head: () => ({
    meta: [
      { title: "Showroom 3D (v2) — LD Azouaou" },
      { name: "description", content: "Version 2 : explorez notre tracteur texturé en 3D à 360°, configurez votre machine et demandez un devis à LD Azouaou." },
      { property: "og:title", content: "Showroom 3D (v2) — LD Azouaou" },
      { property: "og:description", content: "Configurateur 3D interactif de machinisme agricole LD Azouaou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Showroom,
});

function Showroom() {
  const product = products.find((p) => p.slug === "tracteur-texture")!;
  const [selection, setSelection] = useState<Selection>(() =>
    Object.fromEntries(product.configurations.filter((c) => c.available).map((c) => [c.id, c.options[0]!.id])),
  );
  const [quote, setQuote] = useState(false);
  const [exploded, setExploded] = useState(false);
  const colorOption = useMemo(() => product.configurations.find((c) => c.id === "color")?.options.find((o) => o.id === selection['color']), [product, selection]);
  const summary = configSummary(product.configurations, selection);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-3">
          <Link to="/"><BrandLogo className="h-9" /></Link>
          <nav className="hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">Accueil</Link>
            <Link to="/" hash="gamme" className="hover:text-foreground">Produits</Link>
            <Link to="/" hash="industrie" className="hover:text-foreground">Services</Link>
            <Link to="/" hash="histoire" className="hover:text-foreground">À propos</Link>
          </nav>
          <button onClick={() => setQuote(true)} className="flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Demander un devis <ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 py-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Accueil</Link><ChevronRight className="h-3 w-3" /><span className="text-foreground">Showroom 3D · v2</span>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[7fr_3fr]">
          <div className="h-[60vh] lg:h-[calc(100svh-140px)]">
            <MachineryViewer product={product} colorOption={colorOption} />
          </div>
          <aside className="flex flex-col gap-6 lg:max-h-[calc(100svh-140px)] lg:overflow-y-auto lg:pr-1">
            <ProductInformation product={product} />
            <div>
              <h2 className="mb-4 text-xl font-bold">Configuration</h2>
              <ConfigurationPanel categories={product.configurations} selection={selection} onChange={(c, o) => setSelection((s) => ({ ...s, [c]: o }))} />
            </div>
            <ExplodedView supported={product.supportsExploded} active={exploded} onToggle={() => setExploded((v) => !v)} />
            <div className="border border-border bg-card p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Votre configuration</p>
              <ul className="mt-2 space-y-1">{summary.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <button onClick={() => setQuote(true)} className="bg-primary py-4 font-semibold text-primary-foreground shadow-red transition-transform hover:-translate-y-0.5">Demander un devis</button>
          </aside>
        </section>

        <section className="py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Caractéristiques</p>
          <h2 className="mb-8 mt-2 text-4xl font-bold">Données techniques</h2>
          <TechnicalSpecifications product={product} />
        </section>
      </div>

      <QuotationForm open={quote} onOpenChange={setQuote} product={`${product.name} (${product.reference})`} configuration={summary} />
    </main>
  );
}
