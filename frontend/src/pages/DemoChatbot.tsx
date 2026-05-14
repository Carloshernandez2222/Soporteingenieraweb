import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Footer, Header } from "@/components";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Msg = { id: string; role: "user" | "bot"; text: string };

function botReply(text: string): string {
  const t = text.toLowerCase().trim();
  if (!t) return "Escribe algo y te respondo con una pista.";
  if (/hola|buen(os|as)\s|hey|hi\b/.test(t)) {
    return "¡Hola! Soy un asistente de demostración de TrackAid. Puedes preguntarme por tickets, registro o precios, o usa los accesos rápidos de abajo.";
  }
  if (/ticket|incidencia|registr(ar|o)|caso|problema/.test(t)) {
    return "Para registrar una incidencia de verdad, crea una cuenta y entra al panel: **Nuevo ticket** con tu nombre, correo y descripción. Aquí solo simulo respuestas.";
  }
  if (/precio|plan|costo|pagar/.test(t)) {
    return "En la web tienes la sección de precios en el menú. Los planes dependen de tu operación; esta demo no muestra importes reales.";
  }
  if (/trackaid|qu[eé]\s+es|para\s+qu[eé]/.test(t)) {
    return "TrackAid ayuda a dar seguimiento a incidencias en operaciones (por ejemplo eCommerce): menos pérdidas por fallas logísticas o de integración.";
  }
  if (/gracias|thanks/.test(t)) return "De nada. Si necesitas soporte humano, usa el registro y el panel cuando esté disponible para tu equipo.";
  if (/adi[oó]s|chao|bye/.test(t)) return "Hasta luego. Puedes volver cuando quieras a probar esta demo.";
  return "No tengo una respuesta fija para eso en esta demo. Prueba con «ticket», «precios» o «qué es TrackAid», o elige un acceso rápido.";
}

const QUICK = ["¿Qué es TrackAid?", "¿Cómo abro un ticket?", "Precios"] as const;

let idSeq = 0;
function nextId() {
  idSeq += 1;
  return `m-${idSeq}`;
}

export default function DemoChatbot() {
  useDocumentTitle("Demo asistente · TrackAid");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hola, soy el asistente de **demostración** de TrackAid. Las respuestas son fijas; sirven para ver cómo podría verse un chat en el producto.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollEnd();
  }, [messages, pending, scrollEnd]);

  function pushBot(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role: "bot", text }]);
  }

  function sendUser(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
    setInput("");
    setPending(true);
    window.setTimeout(() => {
      pushBot(botReply(trimmed));
      setPending(false);
    }, 550);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    sendUser(input);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6fb]">
      <Header />
      <main className="flex-1 flex flex-col pt-20 md:pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 min-h-[min(560px,calc(100vh-8rem))]">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-850 tracking-tight">Demo del asistente</h1>
            <p className="mt-1 text-sm text-gray-600">
              Chat de prueba con respuestas automáticas.{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Volver al inicio
              </Link>
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-gray-200/90 bg-white shadow-[0_8px_40px_rgba(74,61,114,0.08)] overflow-hidden">
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scroll-smooth"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm bg-primary text-white shadow-sm"
                        : "max-w-[90%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-gray-100 text-gray-800 border border-gray-200/80"
                    }
                  >
                    <MsgBody text={m.text} isUser={m.role === "user"} />
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-gray-100 border border-gray-200/80 flex gap-1.5 items-center text-gray-500">
                    <span className="inline-flex gap-1" aria-hidden>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </span>
                    Escribiendo…
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-3 sm:px-4 py-3 bg-gray-50/80">
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendUser(q)}
                    disabled={pending}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex gap-2 items-end">
                <label htmlFor="demo-chat-input" className="sr-only">
                  Mensaje para el asistente
                </label>
                <input
                  id="demo-chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  disabled={pending}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-850 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="shrink-0 rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-45 disabled:pointer-events-none"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Markdown mínimo **negrita** solo en burbujas del bot. */
function MsgBody({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) return <p className="whitespace-pre-wrap break-words m-0">{text}</p>;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
