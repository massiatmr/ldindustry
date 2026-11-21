import type { Product } from "@/lib/showroom/products";

export function ProductInformation({ product }: { product: Product }) {
  return (
    <div>
      {product.demo && (
        <p className="mb-4 inline-block bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Données de démonstration · fictives
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
        {product.brand}
      </p>
      <h1 className="mt-1 text-4xl font-bold leading-none">{product.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Réf. <b className="text-foreground">{product.reference}</b> · {product.category}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
      <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
        {product.summary.map((s) => (
          <div key={s.k} className="flex justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">{s.k}</dt>
            <dd className="text-right font-semibold">{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
