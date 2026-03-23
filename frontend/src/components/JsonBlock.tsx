import { useState } from "react";

export default function JsonBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="pre-toolbar">
        <button type="button" className="btn ghost" onClick={() => void copy()}>
          {copied ? "Copiado" : "Copiar JSON"}
        </button>
      </div>
      <pre className="json">{value}</pre>
    </div>
  );
}
