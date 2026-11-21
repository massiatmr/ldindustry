export function BrandLogo({
  variant = "color",
  className = "h-10",
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  const isWhite = variant === "white";

  return (
    <div className={`flex w-fit items-center gap-3 ${className}`} aria-label="LD Azouaou Industry">
      <span
        className={`flex aspect-square h-full items-center justify-center rounded-sm border-2 ${isWhite ? "border-white text-white" : "border-carbon text-carbon"}`}
      >
        <span className="font-display text-[0.7em] font-bold leading-none">LD</span>
      </span>
      <span
        className={`font-display text-[0.82em] font-bold uppercase leading-none tracking-[0.12em] ${isWhite ? "text-white" : "text-carbon"}`}
      >
        Azouaou <span className="font-normal tracking-[0.2em]">Industry</span>
      </span>
    </div>
  );
}
