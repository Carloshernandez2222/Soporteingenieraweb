import type { ReactNode } from "react";

type FPatternRowProps = {
  /** Columna principal (titular, párrafo, CTA) — borde izquierdo del patrón F. */
  children: ReactNode;
  /** Ilustración, mockup o métricas a la derecha. */
  visual: ReactNode;
  /** Invierte columnas en desktop (zigzag entre secciones). */
  reverse?: boolean;
  className?: string;
};

/**
 * Fila flex de dos columnas del patrón F: contenido prioritario a la izquierda,
 * apoyo visual a la derecha (mobile: visual arriba salvo `reverse`).
 */
export function FPatternRow({ children, visual, reverse = false, className = "" }: FPatternRowProps) {
  const contentOrder = reverse ? "order-2 lg:order-2" : "order-2 lg:order-1";
  const visualOrder = reverse ? "order-1 lg:order-1" : "order-1 lg:order-2";

  return (
    <div className={`flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-16 items-stretch lg:items-center ${className}`.trim()}>
      <div className={`flex-1 w-full min-w-0 max-w-2xl mx-auto lg:mx-0 ${contentOrder}`}>{children}</div>
      <div
        className={`flex-shrink-0 w-full lg:w-auto max-w-2xl mx-auto lg:max-w-none lg:mx-0 flex justify-center lg:justify-end ${visualOrder}`}
      >
        {visual}
      </div>
    </div>
  );
}
