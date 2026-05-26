import type { ReactNode, Ref } from "react";

type FLandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Bandas horizontales del patrón F (carrusel, CTA). */
  variant?: "default" | "band" | "hero";
  ariaLabelledBy?: string;
  sectionRef?: Ref<HTMLElement>;
};

const VARIANT_CLASS: Record<NonNullable<FLandingSectionProps["variant"]>, string> = {
  default: "py-16 md:py-24",
  band: "py-14 md:py-20 border-y border-gray-100",
  hero: "pt-28 pb-16 md:pt-36 md:pb-24",
};

/**
 * Contenedor de sección alineado al patrón F (UX): ancho máximo, padding lateral
 * y bloques apilados en columna flex para lectura top→left→horizontal.
 */
export function FLandingSection({
  id,
  children,
  className = "",
  variant = "default",
  ariaLabelledBy,
  sectionRef,
}: FLandingSectionProps) {
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      aria-labelledby={ariaLabelledBy}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
