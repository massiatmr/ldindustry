import type { Product } from "@/lib/showroom/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download } from "lucide-react";

export function TechnicalSpecifications({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="specs">
      <TabsList className="h-auto rounded-none bg-transparent p-0">
        <TabsTrigger
          value="specs"
          className="rounded-none border-b-2 border-transparent px-5 py-3 font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none"
        >
          Fiche technique
        </TabsTrigger>
        <TabsTrigger
          value="docs"
          className="rounded-none border-b-2 border-transparent px-5 py-3 font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none"
        >
          Documentation
        </TabsTrigger>
      </TabsList>
      <TabsContent value="specs" className="mt-8">
        {product.demo && (
          <p className="mb-6 text-sm text-muted-foreground">
            Valeurs fictives de démonstration — elles seront remplacées par les données officielles
            du constructeur.
          </p>
        )}
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {product.specs.map((g) => (
            <div key={g.title} className="bg-card p-6">
              <h3 className="text-lg font-bold text-primary">{g.title}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {g.rows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{r.k}</dt>
                    <dd className="font-semibold">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="docs" className="mt-8">
        <div className="flex items-center gap-5 border border-border bg-card p-6">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <p className="font-semibold">Fiche technique PDF</p>
            <p className="text-sm text-muted-foreground">
              {product.pdfUrl
                ? "Téléchargez la documentation officielle."
                : "Aucun document officiel disponible pour ce modèle pour le moment."}
            </p>
          </div>
          {product.pdfUrl ? (
            <a
              href={product.pdfUrl}
              download
              className="flex items-center gap-2 bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground"
            >
              <Download className="h-4 w-4" /> Télécharger
            </a>
          ) : (
            <span className="px-4 py-2.5 text-sm text-muted-foreground">Indisponible</span>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
