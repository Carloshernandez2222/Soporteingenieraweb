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
    <div className={`flex flex-col lg:flex-row gap-12 lg:gap-16 items-center ${className}`.trim()}>
      <div className={`flex-1 min-w-0 ${contentOrder}`}>{children}</div>
      <div className={`flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end ${visualOrder}`}>
        {visual}
      </div>
    </div>
  );
}
