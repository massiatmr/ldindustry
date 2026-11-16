/**
 * Showroom product catalogue. Static for now; shaped so it can later be loaded
 * from a database table without changing the components.
 * All values below are DEMONSTRATION data, not manufacturer specifications.
 */
import farmallAsset from "@/assets/farmall-super-a.glb.asset.json";

export type Vec3 = [number, number, number];

export interface Hotspot {
  id: string;
  label: string;
  description: string;
  position: Vec3; // model-space metres
  normal?: Vec3;
  specs?: { k: string; v: string }[];
  image?: string;
}

export interface ConfigOption {
  id: string;
  label: string;
  /** Visual change applied to the GLB when supported. */
  material?: { names: string[]; color: [number, number, number, number] };
  swatch?: string;
}

export interface ConfigCategory {
  id: string;
  label: string;
  /** false when the GLB has no separate objects/materials/variants for it */
  available: boolean;
  options: ConfigOption[];
}

export interface SpecGroup { title: string; rows: { k: string; v: string }[] }

export interface Product {
  slug: string;
  name: string;
  brand: string;
  reference: string;
  category: string;
  description: string;
  demo: boolean;
  modelUrl: string;
  posterImage?: string;
  images: string[];
  summary: { k: string; v: string }[];
  specs: SpecGroup[];
  hotspots: Hotspot[];
  configurations: ConfigCategory[];
  pdfUrl?: string;
  /** true only when the GLB contains separable component nodes */
  supportsExploded: boolean;
}

const BODY = ["tractor_body_pbr","tractor_paint_sage_x","tractor_paint_sage_x.001","tractor_paint_sage_x.002","tractor_paint_sage_x.003"];

export const products: Product[] = [
  {
    slug: "farmall-super-a",
    name: "Farmall Super A",
    brand: "Modèle CAO GrabCAD",
    reference: "FARMALL-A",
    category: "Tracteur agricole classique",
    description: "Modèle 3D d'ingénierie détaillé (moteur, transmission, direction, attelage) converti depuis un fichier CAO. Les caractéristiques affichées sont indicatives, en attendant les fiches officielles.",
    demo: true,
    modelUrl: farmallAsset.url,
    images: [],
    summary: [
      { k: "Type de moteur", v: "Essence 4 cylindres (indicatif)" },
      { k: "Transmission", v: "2 roues motrices" },
      { k: "Dimensions L × l × H", v: "3,13 × 2,01 × 2,45 m (modèle 3D)" },
    ],
    specs: [
      { title: "Moteur", rows: [{ k: "Cylindres", v: "4 (modèle 3D)" }, { k: "Puissance", v: "À confirmer" }] },
      { title: "Transmission", rows: [{ k: "Traction", v: "Arrière" }] },
      { title: "Dimensions", rows: [{ k: "Longueur", v: "3,13 m" }, { k: "Largeur", v: "2,01 m" }, { k: "Hauteur (échappement)", v: "2,45 m" }] },
    ],
    hotspots: [
      { id: "engine", label: "Moteur", position: [0.8, 1.0, -0.66], normal: [0, 0, -1], description: "Moteur 4 cylindres apparent, bougies, ventilateur et alternateur." },
      { id: "seat", label: "Poste de conduite", position: [-1.1, 1.47, 0], description: "Siège en tôle et volant de direction." },
      { id: "front-wheels", label: "Roues avant", position: [1.2, 0.35, 0.89], normal: [0, 0, 1], description: "Essieu avant directeur." },
      { id: "rear-wheels", label: "Roues arrière", position: [-0.88, 0.64, 0.92], normal: [0, 0, 1], description: "Grandes roues motrices avec masses de roue." },
      { id: "exhaust", label: "Échappement", position: [0.78, 2.45, -0.55], description: "Échappement vertical." },
      { id: "grille", label: "Calandre", position: [1.56, 1.1, 0], normal: [1, 0, 0], description: "Calandre et radiateur." },
      { id: "hitch", label: "Relevage arrière", position: [-1.56, 0.7, 0], normal: [-1, 0, 0], description: "Relevage et attelage arrière." },
    ],
    configurations: [
      {
        id: "color", label: "Couleur carrosserie", available: true,
        options: [
          { id: "red", label: "Rouge Mahindra", swatch: "oklch(0.53 0.21 23)", material: { names: ["paint"], color: [0.78, 0.086, 0.07, 1] } },
          { id: "green", label: "Vert agricole", swatch: "oklch(0.45 0.11 150)", material: { names: ["paint"], color: [0.1, 0.4, 0.15, 1] } },
          { id: "charcoal", label: "Anthracite", swatch: "oklch(0.22 0.005 260)", material: { names: ["paint"], color: [0.08, 0.08, 0.09, 1] } },
        ],
      },
    ],
    supportsExploded: false,
  },
  {
    slug: "tracteur-demo",
    name: "Tracteur de démonstration",
    brand: "LD Azouaou (démo)",
    reference: "DEMO-T01",
    category: "Tracteur agricole à cabine",
    description: "Modèle 3D générique utilisé pour présenter le showroom. Les données affichées sont fictives en attendant les fiches techniques officielles.",
    demo: true,
    modelUrl: "/models/tractor-demo.glb",
    images: [],
    summary: [
      { k: "Puissance moteur", v: "— CV (fictif)" },
      { k: "Type de moteur", v: "Diesel 4 cylindres (fictif)" },
      { k: "Transmission", v: "4WD (fictif)" },
      { k: "Poids", v: "≈ 3 000 kg (fictif)" },
      { k: "Dimensions L × l × H", v: "4,72 × 2,38 × 3,03 m (modèle 3D)" },
    ],
    specs: [
      { title: "Moteur", rows: [{ k: "Type", v: "Diesel (fictif)" }, { k: "Cylindres", v: "4 (fictif)" }, { k: "Puissance", v: "À confirmer" }] },
      { title: "Transmission", rows: [{ k: "Traction", v: "4 roues motrices (fictif)" }, { k: "Rapports", v: "À confirmer" }] },
      { title: "Dimensions", rows: [{ k: "Longueur", v: "4,72 m" }, { k: "Largeur", v: "2,38 m" }, { k: "Hauteur", v: "3,03 m" }] },
      { title: "Poids", rows: [{ k: "À vide", v: "À confirmer" }] },
      { title: "Performance", rows: [{ k: "Capacité de relevage", v: "À confirmer" }] },
      { title: "Équipement", rows: [{ k: "Cabine", v: "Vitrée (modèle 3D)" }, { k: "Attelage", v: "Barre arrière" }] },
    ],
    hotspots: [
      { id: "engine", label: "Moteur", position: [0, 1.9, -1.4], description: "Bloc moteur sous le capot avant.", specs: [{ k: "Type", v: "Diesel (fictif)" }] },
      { id: "cabin", label: "Cabine", position: [0, 2.75, 0.55], description: "Cabine vitrée avec bonne visibilité pour l'opérateur." },
      { id: "front-wheels", label: "Roues avant", position: [1.0, 0.6, -1.6], normal: [1, 0, 0], description: "Roues directrices avant." },
      { id: "rear-wheels", label: "Roues arrière", position: [1.2, 1.0, 0.9], normal: [1, 0, 0], description: "Grandes roues arrière motrices pour la traction." },
      { id: "exhaust", label: "Échappement", position: [-0.55, 2.9, -0.5], description: "Sortie d'échappement verticale." },
      { id: "grille", label: "Calandre", position: [0, 1.4, -2.35], normal: [0, 0, -1], description: "Calandre avant et refroidissement." },
      { id: "hitch", label: "Attelage arrière", position: [0, 0.6, 2.3], normal: [0, 0, 1], description: "Barre d'attelage pour outils tractés." },
    ],
    configurations: [
      {
        id: "color", label: "Couleur carrosserie", available: true,
        options: [
          { id: "original", label: "Vert sauge d'origine", swatch: "oklch(0.86 0.07 140)", material: { names: BODY, color: [1, 1, 1, 1] } },
          { id: "red", label: "Rouge Mahindra", swatch: "oklch(0.53 0.21 23)", material: { names: BODY, color: [1, 0.04, 0.05, 1] } },
          { id: "green", label: "Vert agricole", swatch: "oklch(0.45 0.11 150)", material: { names: BODY, color: [0.25, 0.75, 0.35, 1] } },
          { id: "charcoal", label: "Anthracite", swatch: "oklch(0.22 0.005 260)", material: { names: BODY, color: [0.12, 0.12, 0.13, 1] } },
        ],
      },
      { id: "tires", label: "Pneumatiques", available: false, options: [{ id: "std", label: "Agraires standard" }, { id: "wide", label: "Basse pression" }] },
      { id: "cabin", label: "Équipement cabine", available: false, options: [{ id: "ac", label: "Climatisation" }, { id: "radio", label: "Radio" }] },
      { id: "accessories", label: "Accessoires", available: false, options: [{ id: "lights", label: "Phares de travail" }, { id: "weights", label: "Masses avant" }] },
      { id: "rear", label: "Outils arrière", available: false, options: [{ id: "plough", label: "Charrue" }, { id: "disc", label: "Pulvériseur à disques" }] },
    ],
    supportsExploded: false,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
