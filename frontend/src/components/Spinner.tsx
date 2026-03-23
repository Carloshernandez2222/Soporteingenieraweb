export default function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <span className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
