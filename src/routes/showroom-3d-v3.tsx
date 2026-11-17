import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Download, Mountain, Box, Check, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CapabilityViewer } from "@/components/showroom/CapabilityViewer";
import { capabilities, farmUses, mahindra8000, manufacturerSource, technicalSource, type CapabilityId } from "@/lib/showroom/mahindra8000";
import { downloadMahindraRecap } from "@/lib/showroom/mahindraPdf";

export const Route = createFileRoute("/showroom-3d-v3")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Mahindra 8000 — Showroom 3D | LD Azouaou" },
    { name: "description", content: "Explorez les atouts du Mahindra 8000 4WD : moteur 80 ch, transmission synchronisée et relevage 1 800 kg. Préparez votre projet avec LD Azouaou." },
    { property: "og:title", content: "Mahindra 8000 — Les atouts en 3D | LD Azouaou" },
    { property: "og:description", content: "Adhérence, moteur, manœuvres, relevage et freinage : découvrez le Mahindra 8000 dans un showroom dédié." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Showroom,
});

function Showroom() {
  const [active, setActive] = useState<CapabilityId | null>(null);
  const [terrain, setTerrain] = useState(false);
  const [uses, setUses] = useState<string[]>([]);
  const [quote, setQuote] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const feature = capabilities.find((item) => item.id === active) ?? capabilities[0];
  const featureIndex = capabilities.findIndex((item) => item.id === feature.id);
  const exportPdf = async () => {
    setExporting(true); setExportError(false);
    try { await downloadMahindraRecap(uses, message, name); } catch { setExportError(true); } finally { setExporting(false); }
  };
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link to="/" aria-label="LD Azouaou — Accueil"><BrandLogo className="h-8 sm:h-9" /></Link>
        <nav className="hidden items-center gap-6 text-xs font-medium text-muted-foreground md:flex" aria-label="Showrooms">
          <Link to="/showroom-3d">Showroom 01</Link><Link to="/showroom-3d-v2">Showroom 02</Link><span className="text-primary">Mahindra 8000</span>
        </nav>
        <Button onClick={() => setQuote(true)} className="px-3 sm:px-5">Devis <ArrowUpRight /></Button>
      </div>
    </header>
    <div className="mx-auto max-w-[1600px] px-5 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-[10px] uppercase tracking-wider text-muted-foreground">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-2"><Link to="/">Accueil</Link><ChevronRight className="h-3 w-3" /><span>Showroom 03</span></nav>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Série 00 · marché algérien</span>
      </div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Puissance · motricité · polyvalence</p><h1 className="text-4xl font-semibold leading-none sm:text-5xl">Mahindra <span className="text-primary">8000</span> <span className="text-xl text-muted-foreground">4WD</span></h1></div>
        <div className="flex gap-7 border-l border-border pl-5">
          {[[`${mahindra8000.horsepower}`, "ch moteur"], ["12 + 12", "rapports"], ["1 800", "kg relevage"]].map(([value, label]) => <div key={label}><b className="font-display text-2xl font-medium sm:text-3xl">{value}</b><span className="mt-1 block text-[10px] uppercase text-muted-foreground">{label}</span></div>)}
        </div>
      </div>
      <section className="grid border-y border-border lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="relative h-[470px] min-w-0 lg:h-[max(440px,calc(100svh-235px))] lg:max-h-[760px]">
          <CapabilityViewer active={active} onSelect={setActive} terrain={terrain} />
          <div className="absolute left-5 top-5 flex border border-border bg-card/95 p-1" role="group" aria-label="Décor">
            <Button variant={terrain ? "ghost" : "secondary"} size="sm" aria-pressed={!terrain} onClick={() => setTerrain(false)}><Box /> Studio</Button>
            <Button variant={terrain ? "secondary" : "ghost"} size="sm" aria-pressed={terrain} onClick={() => setTerrain(true)}><Mountain /> Terrain</Button>
          </div>
        </div>
        <aside className="border-t border-border bg-card lg:border-l lg:border-t-0">
          <div className="border-b border-border px-5 py-4"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Les atouts au travail</p></div>
          <div className="grid grid-cols-5 border-b border-border" role="tablist" aria-label="Atouts du Mahindra">
            {capabilities.map((item, index) => <Button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={feature.id === item.id} aria-controls="capability-detail" variant="ghost" onClick={() => setActive(item.id)} className={`h-[66px] flex-col gap-1 rounded-none px-0 text-[10px] ${feature.id === item.id ? "border-b-2 border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}><span className="font-display text-lg">0{index + 1}</span>{item.label}</Button>)}
          </div>
          <div id="capability-detail" role="tabpanel" aria-labelledby={`tab-${feature.id}`} className="px-6 py-6" aria-live="polite">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">0{featureIndex + 1} / 05 · {feature.part}</p>
            <p className="mb-3 font-display text-3xl text-primary">{feature.metric}</p>
            <h2 className="text-xl font-medium">{feature.title}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{feature.description}</p>
            <p className="mt-5 flex gap-2 border-l-2 border-accent pl-3 text-xs font-medium leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{feature.benefit}</p>
            <details className="mt-5 text-[11px] leading-relaxed text-muted-foreground"><summary className="cursor-pointer font-semibold text-foreground">À vérifier avec votre concession</summary><p className="mt-2">{feature.caution}</p></details>
            <Button variant="link" className="mt-4 h-auto px-0 text-xs" onClick={() => setActive(capabilities[(featureIndex + 1) % capabilities.length]?.id ?? "traction")}>Atout suivant <ArrowRight /></Button>
          </div>
        </aside>
      </section>
      <section className="grid gap-8 border-b border-border py-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_390px]">
        <div><p className="text-[10px] uppercase tracking-[0.2em] text-primary">Votre exploitation</p><h2 className="mt-2 text-2xl">Quels travaux envisagez-vous ?</h2>
          <div className="mt-4 flex flex-wrap gap-2">{farmUses.map((use) => <Button key={use} variant={uses.includes(use) ? "secondary" : "outline"} aria-pressed={uses.includes(use)} onClick={() => setUses((values) => values.includes(use) ? values.filter((value) => value !== use) : [...values, use])}>{uses.includes(use) && <Check />}{use}</Button>)}</div>
          <p className="mt-3 text-xs text-muted-foreground">Les outils, le lestage et les équipements sont à définir selon votre terrain et votre travail.</p>
        </div>
        <div className="flex flex-col justify-center gap-3"><Button size="lg" onClick={() => setQuote(true)}>Préparer ma demande de devis <ArrowUpRight /></Button><Button variant="outline" onClick={exportPdf} disabled={exporting}><Download />{exporting ? "Préparation…" : "Télécharger la fiche PDF"}</Button>{exportError && <p role="alert" className="text-xs text-destructive">Le PDF n’a pas pu être créé. Réessayez.</p>}</div>
      </section>
      <section className="py-10"><h2 className="text-2xl">La fiche technique, sans détour</h2><dl className="mt-5 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">{[["Moteur", "Turbo diesel · 4 cylindres"], ["Cylindrée", "3 192 cm³"], ["Transmission", "12 AV / 12 AR synchronisée"], ["Relevage nominal", "1 800 kg"], ["Traction", "4 roues motrices"], ["Freins", "Disques à bain d’huile"], ["Prise de force", "Indépendante · 65 ch"], ["Poids opérationnel", "3 135 kg"]].map(([label, value]) => <div key={label} className="border-b border-border py-4"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl>
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-muted-foreground">Données du Mahindra 8000 4WD, selon la gamme destinée à l’Algérie. Le modèle 3D fourni est une représentation extérieure, non une maquette d’ingénierie. Équipements et caractéristiques à confirmer sur la machine livrée.</p>
        <div className="mt-3 flex flex-wrap gap-5 text-xs"><a href={manufacturerSource} target="_blank" rel="noreferrer" className="underline underline-offset-4">Mahindra · gamme Algérie ↗</a><a href={technicalSource} target="_blank" rel="noreferrer" className="underline underline-offset-4">Rapport technique OCDE ↗</a></div>
      </section>
      <footer className="flex justify-between border-t border-border py-5 text-[10px] uppercase tracking-wider text-muted-foreground"><span>LD Azouaou · Tizi Ouzou</span><span>Mahindra 8000 / Showroom 03</span></footer>
    </div>
    <Dialog open={quote} onOpenChange={setQuote}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-2xl">Votre projet · Mahindra 8000</DialogTitle><DialogDescription>Fiche à transmettre à votre concession. Aucun envoi automatique n’est effectué depuis cette page.</DialogDescription></DialogHeader><p className="text-sm font-medium">{uses.length ? uses.join(" · ") : "Usages à préciser"}</p><div className="space-y-4"><div><Label htmlFor="project-name">Votre nom (facultatif)</Label><Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="mt-2" /></div><div><Label htmlFor="project-message">Terrain, outils et besoins</Label><Textarea id="project-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={1500} className="mt-2" /></div><Button className="w-full" disabled={exporting} onClick={exportPdf}><Download />{exporting ? "Préparation…" : "Télécharger ma demande préparée"}</Button>{exportError && <p role="alert" className="text-xs text-destructive">Le PDF n’a pas pu être créé. Réessayez.</p>}</div></DialogContent></Dialog>
  </main>;
}