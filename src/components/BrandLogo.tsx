import logo from "@/assets/logo-ld-industry.png.asset.json";
import logoWhite from "@/assets/logo-ld-industry-white.png.asset.json";

/** variant="white" pour les fonds sombres */
export function BrandLogo({ variant = "color", className = "h-10" }: { variant?: "color" | "white"; className?: string }) {
  return <img src={variant === "white" ? logoWhite.url : logo.url} alt="LD Industry Mahindra" className={`w-auto ${className}`} />;
}
