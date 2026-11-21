const logoUrl =
  "https://ldindustry.lovable.app/__l5e/assets-v1/8f375e97-d642-474c-ac01-9a76c23d3862/logo-ld-industry-white.png";

export function BrandLogo({
  variant = "white",
  className = "h-10",
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt="LD Industry Mahindra"
      className={`w-auto object-contain ${className}`}
    />
  );
}
