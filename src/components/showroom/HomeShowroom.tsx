import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Box, Mountain, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capabilities, mahindra8000, type CapabilityId } from "@/lib/showroom/mahindra8000";

const Viewer = lazy(() => import("./CapabilityViewer").then((module) => ({ default: module.CapabilityViewer })));

export function HomeShowroom() {
  const section = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<CapabilityId | null>(null);
  const [terrain, setTerrain] = useState(false);
  const feature = capabilities.find((item) => item.id === active) ?? capabilities[0];
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "250px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={section} id="showroom" aria-labelledby="home-showroom-title" className="scroll-mt-20 border-t border-border bg-background pb-16 pt-16 text-foreground sm:pb-24 sm:pt-24">
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Le showroom · Mahindra 8000 4WD</p><h2 id="home-showroom-title" className="text-4xl font-semibold leading-tight sm:text-5xl">La puissance, <span className="text-primary">sous tous les angles.</span></h2><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Adhérence, moteur, manœuvres : les atouts qui font la différence sur votre exploitation.</p></div>
        <Button asChild variant="link" className="h-auto px-0"><Link to="/showroom-3d-v3">Ouvrir le showroom complet <ArrowUpRight /></Link></Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div className="flex gap-6 sm:gap-10">{[[`${mahindra8000.horsepower} ch`, "Turbo diesel"], ["12 + 12", "Avant / arrière"], ["1 800 kg", "Relevage"]].map(([value, label]) => <div key={label}><b className="font-display text-xl font-medium sm:text-2xl">{value}</b><span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div>)}</div>
        <div role="group" aria-label="Décor du showroom" className="flex gap-1"><Button variant={terrain ? "ghost" : "secondary"} size="sm" aria-pressed={!terrain} onClick={() => setTerrain(false)}><Box /> Studio</Button><Button variant={terrain ? "secondary" : "ghost"} size="sm" aria-pressed={terrain} onClick={() => setTerrain(true)}><Mountain /> Terrain</Button></div>
      </div>
      <div className="grid border-b border-border lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[420px] min-w-0 sm:h-[510px]">{visible ? <Suspense fallback={<Loading />}><Viewer active={active} onSelect={setActive} terrain={terrain} /></Suspense> : <Loading />}</div>
        <div className="border-t border-border lg:border-l lg:border-t-0">
          <div className="flex border-b border-border" role="tablist" aria-label="Atouts du tracteur sur l’accueil">{capabilities.map((item, index) => <Button key={item.id} variant="ghost" role="tab" id={`home-tab-${item.id}`} aria-controls="home-feature-detail" aria-selected={feature.id === item.id} onClick={() => setActive(item.id)} className={`h-16 min-w-0 flex-1 flex-col gap-1 rounded-none px-1 text-[9px] ${feature.id === item.id ? "border-b-2 border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}><span className="font-display text-lg">0{index + 1}</span>{item.label}</Button>)}</div>
          <div id="home-feature-detail" role="tabpanel" aria-labelledby={`home-tab-${feature.id}`} aria-live="polite" className="p-6"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{feature.part}</p><p className="mt-4 font-display text-3xl text-primary">{feature.metric}</p><h3 className="mt-3 text-xl font-medium">{feature.title}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{feature.description}</p><p className="mt-5 border-l-2 border-accent pl-3 text-xs font-medium leading-relaxed">{feature.benefit}</p><Button asChild variant="link" className="mt-6 h-auto px-0 text-xs"><Link to="/showroom-3d-v3">Préparer mon projet <ArrowRight /></Link></Button></div>
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">Version 8000 4WD · représentation extérieure. Caractéristiques et compatibilité des outils à confirmer avec votre concession.</p>
    </div>
  </section>;
}

function Loading() {
  return <div className="flex h-full min-h-[410px] items-center justify-center gap-3 bg-showroom text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Mahindra 8000</div>;
}