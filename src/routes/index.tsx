import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Factory, Cog, Wrench, Phone, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import t9200 from "@/assets/tracteur-9200.png.asset.json";
import t585 from "@/assets/tracteur-585.png.asset.json";
import t705 from "@/assets/tracteur-705.png.asset.json";
import t8000 from "@/assets/tracteur-8000.png.asset.json";
import siege from "@/assets/siege-oued-aissi.png.asset.json";
import disques from "@/assets/pulveriseur-disques.jpg.asset.json";
import mahindra from "@/assets/mahindra-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LD Azouaou — Représentant officiel Mahindra en Algérie" },
      { name: "description", content: "Depuis 2009, Eurl LD Azouaou distribue et fabrique du machinisme agricole Mahindra à Oued Aïssi, Tizi Ouzou." },
      { property: "og:title", content: "LD Azouaou — Tracteurs Mahindra, fabriqués en Algérie" },
      { property: "og:description", content: "Représentant officiel Mahindra & Mahindra et unité industrielle de machinisme agricole à Tizi Ouzou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const slides = [t9200.url, t585.url, t8000.url];
const tractors = [
  { name: "Mahindra 585 DI", hp: "50 CV", img: t585.url, tag: "2WD" },
  { name: "Mahindra 705", hp: "60 CV", img: t705.url, tag: "2WD" },
  { name: "Mahindra 8000", hp: "75 CV", img: t8000.url, tag: "4WD" },
  { name: "Mahindra 9200", hp: "92 CV", img: t9200.url, tag: "4WD" },
];
const timeline = [
  { y: "2009", t: "Création", d: "Fondation d'Eurl LD Azouaou : biens et services en machinisme agricole." },
  { y: "2010", t: "Mahindra & Mahindra", d: "Représentant officiel en Algérie du géant industriel indien, constructeur de tracteurs." },
  { y: "2014", t: "Investissement industriel", d: "Lancement d'une unité d'industrie mécanique, aux normes internationales, équipée de machines-outils de dernière génération." },
  { y: "2020", t: "Sous-traitance", d: "Unité de sous-traitance vers un tracteur typiquement algérien et des pièces pour les opérateurs nationaux." },
];

function Index() {
  const [i, setI] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on);
    return () => { clearInterval(id); window.removeEventListener("scroll", on); };
  }, []);

  return (
    <main className="bg-carbon text-carbon-foreground">
      {/* Header */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-carbon/90 py-3 backdrop-blur-md" : "py-6"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <BrandLogo variant="white" className="h-9 md:h-11" />
          <nav className="hidden gap-8 text-sm font-medium text-carbon-muted md:flex">
            {["Histoire", "Gamme", "Industrie", "Contact"].map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="transition-colors hover:text-carbon-foreground">{n}</a>
            ))}
          </nav>
          <a href="#contact" className="flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
            Devis <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen min-h-[680px] overflow-hidden">
        {slides.map((s, k) => (
          <div key={s} className={`absolute inset-0 transition-opacity duration-[1500ms] ${k === i ? "opacity-100" : "opacity-0"}`}>
            <img src={s} alt="" className="h-full w-full animate-kenburns object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-fade-carbon" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24">
          <p className="mb-6 flex animate-rise items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-carbon-muted">
            <span className="h-px w-12 bg-primary" /> Représentant officiel Mahindra · Algérie
          </p>
          <h1 className="max-w-4xl animate-rise text-6xl font-bold leading-[0.9] md:text-8xl lg:text-9xl" style={{ animationDelay: ".15s" }}>
            La puissance <span className="text-primary">Mahindra</span>,<br />
            <span className="text-outline">forgée en Algérie</span>
          </h1>
          <div className="mt-10 flex animate-rise flex-wrap items-center gap-4" style={{ animationDelay: ".3s" }}>
            <a href="#gamme" className="group flex items-center gap-3 bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-red">
              Découvrir la gamme <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#histoire" className="border border-carbon-foreground/30 px-8 py-4 font-semibold backdrop-blur transition-colors hover:bg-carbon-foreground/10">Notre histoire</a>
          </div>
          <div className="absolute bottom-24 right-6 hidden gap-2 md:flex">
            {slides.map((_, k) => (
              <button key={k} aria-label={`Image ${k + 1}`} onClick={() => setI(k)} className={`h-1 transition-all ${k === i ? "w-16 bg-primary" : "w-8 bg-carbon-foreground/30"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-carbon-foreground/10 bg-carbon-2">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[["2009", "Fondation"], ["15+", "Ans de partenariat Mahindra"], ["4", "Modèles 50 → 92 CV"], ["100%", "Normes internationales"]].map(([v, l]) => (
            <div key={l} className="border-carbon-foreground/10 p-8 md:border-r md:last:border-r-0">
              <div className="font-display text-5xl font-bold text-primary">{v}</div>
              <div className="mt-2 text-sm text-carbon-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Histoire */}
      <section id="histoire" className="grid-lines relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Depuis 2009</p>
              <h2 className="mt-4 text-5xl font-bold leading-none md:text-6xl">Une trajectoire <br />industrielle</h2>
              <p className="mt-6 max-w-md text-carbon-muted">De la distribution à la fabrication : un projet réalisé dans un cadre légal et réglementaire, bien avant le cahier des charges du Ministère de l'Industrie et des Mines.</p>
              <img src={mahindra.url} alt="Mahindra" className="mt-10 h-20 w-auto rounded bg-carbon-foreground p-3" />
            </div>
            <ol className="relative border-l border-carbon-foreground/15">
              {timeline.map((e) => (
                <li key={e.y} className="group relative pb-16 pl-10 last:pb-0">
                  <span className="absolute -left-[7px] top-3 h-3.5 w-3.5 rotate-45 bg-primary transition-transform group-hover:scale-150" />
                  <div className="font-display text-7xl font-bold text-carbon-foreground/10 transition-colors group-hover:text-primary/40">{e.y}</div>
                  <h3 className="-mt-6 text-2xl font-semibold">{e.t}</h3>
                  <p className="mt-3 max-w-lg text-carbon-muted">{e.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-carbon-foreground/10 bg-primary py-5 text-primary-foreground">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-3xl font-bold uppercase">
          {Array(2).fill(["Tracteurs Mahindra", "✦", "Pièces d'origine", "✦", "Sous-traitance mécanique", "✦", "Made in Tizi Ouzou", "✦"]).flat().map((w, k) => <span key={k}>{w}</span>)}
        </div>
      </div>

      {/* Gamme */}
      <section id="gamme" className="bg-background py-32 text-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">La gamme</p>
              <h2 className="mt-4 text-5xl font-bold md:text-6xl">Tracteurs Mahindra</h2>
            </div>
            <p className="max-w-sm text-muted-foreground">Des machines robustes pour améliorer les rendements et pallier le manque de main-d'œuvre.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {tractors.map((t) => (
              <article key={t.name} className="group relative overflow-hidden bg-carbon">
                <img src={t.img} alt={t.name} className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-fade-carbon opacity-90" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <span className="bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{t.hp}</span>
                  <span className="bg-carbon/80 px-3 py-1 text-xs font-bold text-carbon-foreground">{t.tag}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-carbon-foreground">
                  <h3 className="text-3xl font-bold">{t.name}</h3>
                  <span className="flex h-12 w-12 items-center justify-center bg-carbon-foreground text-carbon transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><ArrowUpRight /></span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industrie */}
      <section id="industrie" className="relative overflow-hidden py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Unité industrielle · Oued Aïssi</p>
            <h2 className="mt-4 text-5xl font-bold leading-none md:text-6xl">Vers un tracteur <span className="text-primary">typiquement algérien</span></h2>
            <p className="mt-6 text-carbon-muted">Notre plan d'action : extension et diversification, avec une unité de sous-traitance qui fournit pièces et accessoires mécaniques aux opérateurs économiques du pays pour améliorer leurs taux d'intégration.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[[Factory, "Montage"], [Cog, "Usinage"], [Wrench, "Pièces & SAV"]].map(([Icon, l]) => {
                const I = Icon as typeof Factory;
                return (
                  <div key={l as string} className="border border-carbon-foreground/10 bg-carbon-2 p-5 transition-colors hover:border-primary">
                    <I className="h-7 w-7 text-primary" /><div className="mt-3 font-semibold">{l as string}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <img src={siege.url} alt="Siège LD Azouaou à Oued Aïssi" className="w-full object-cover shadow-red" />
            <img src={disques.url} alt="Pulvériseur à disques" className="absolute -bottom-12 -left-8 w-1/2 border-4 border-carbon bg-carbon-foreground" />
          </div>
        </div>
      </section>

      {/* Contact / footer */}
      <footer id="contact" className="border-t border-carbon-foreground/10 bg-carbon-2">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="text-5xl font-bold md:text-7xl">Parlons de <span className="text-primary">votre exploitation</span></h2>
          <div className="mt-12 flex flex-wrap gap-8 text-carbon-muted">
            <span className="flex items-center gap-3"><MapPin className="text-primary" /> Zone Industrielle Aïssat Idir, Oued Aïssi, Tizi Ouzou</span>
            <a href="tel:+213555015743" className="flex items-center gap-3 hover:text-carbon-foreground"><Phone className="text-primary" /> +213 (0) 555 01 57 43</a>
          </div>
          <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-carbon-foreground/10 pt-8 text-sm text-carbon-muted">
            <BrandLogo variant="white" className="h-10" />
            <span>© {new Date().getFullYear()} Eurl LD Azouaou</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
