/** Unix timestamp mínimo razonable (2001-09-09) para descartar placeholders (p. ej. id usado por error). */
const MIN_TS_SEC = 1_000_000_000;

/**
 * Formatea fecha de creación guardada en backend como `time.time()` (segundos Unix).
 * Acepta milisegundos si el valor es claramente > 1e12.
 */
export function formatCreatedAt(ts: number | undefined | null): string {
  if (ts == null || !Number.isFinite(ts) || ts <= 0) return "—";
  const sec = ts > 1e12 ? ts / 1000 : ts;
  if (sec < MIN_TS_SEC) return "—";
  const d = new Date(sec * 1000);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
