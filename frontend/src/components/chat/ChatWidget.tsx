import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { mensajeError } from "@/api";
import { registrarCasoStrategy } from "@/lib/panelPatronesApi";
import { ChatMessageBody } from "./ChatMessageBody";
import {
  botReply,
  CHAT_EXAMPLE_TICKET,
  CHAT_QUICK_PROMPTS,
  CHAT_WELCOME,
  nextChatId,
  pareceSolicitudTicket,
  type ChatMessage,
} from "./chatLogic";

type ChatWidgetProps = {
  /** Solo cuerpo del chat (sin cabecera shell). */
  bare?: boolean;
  className?: string;
};

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatWidget({ bare = false, className = "" }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([CHAT_WELCOME]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollEnd();
  }, [messages, pending, scrollEnd]);

  function pushMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: nextChatId() }]);
  }

  async function intentarRegistro(mensaje: string) {
    setPending(true);
    try {
      const data = await registrarCasoStrategy({ origen: "chatbot", mensaje });
      pushMessage({
        role: "bot",
        kind: "success",
        ticketId: data.caso_id,
        text: `Listo: tu incidencia quedó registrada como ticket **#${data.caso_id}**.\n\n${data.message || data.msg || "El equipo puede dar seguimiento con tu correo."}`,
      });
    } catch (e) {
      pushMessage({
        role: "bot",
        kind: "error",
        text: `No pude registrar el ticket: ${mensajeError(e)}\n\n${botReply(mensaje)}`,
      });
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  async function responderUsuario(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed === "Registrar ticket de prueba" || trimmed === "Registrar ejemplo") {
      await intentarRegistro(CHAT_EXAMPLE_TICKET);
      return;
    }

    if (pareceSolicitudTicket(trimmed)) {
      await intentarRegistro(trimmed);
      return;
    }

    pushMessage({ role: "bot", text: botReply(trimmed) });
  }

  function sendUser(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    pushMessage({ role: "user", text: trimmed });
    setInput("");
    void responderUsuario(trimmed);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    sendUser(input);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendUser(input);
    }
  }

  const rootClass = bare
    ? `chat-widget-body flex flex-col min-h-0 flex-1 ${className}`.trim()
    : `chat-widget-body flex flex-col min-h-[320px] flex-1 ${className}`.trim();

  return (
    <div className={rootClass}>
      <div
        ref={listRef}
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
      >
        <div className="chat-messages-inner">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-row ${m.role === "user" ? "chat-row--user" : "chat-row--bot"}`}
            >
              {m.role === "bot" && <span className="chat-mini-avatar">TA</span>}
              <div
                className={`chat-bubble ${
                  m.role === "user"
                    ? "chat-bubble--user"
                    : m.kind === "success"
                      ? "chat-bubble--success"
                      : m.kind === "error"
                        ? "chat-bubble--error"
                        : "chat-bubble--bot"
                }`}
              >
                <ChatMessageBody text={m.text} isUser={m.role === "user"} />
                {m.kind === "success" && m.ticketId != null && (
                  <div className="chat-ticket-card">
                    <strong>Ticket #{m.ticketId}</strong>
                    <div className="text-gray-600 mt-0.5">Guardado en base de datos (demo).</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {pending && (
            <div className="chat-row chat-row--bot">
              <span className="chat-mini-avatar">TA</span>
              <div className="chat-bubble chat-bubble--bot">
                <div className="chat-typing" aria-label="Escribiendo">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-composer">
        <p className="chat-hint">
          <span aria-hidden>💡</span>
          Incluye tu correo para registrar un ticket real
        </p>
        <div className="chat-quick">
          {CHAT_QUICK_PROMPTS.map((q) => (
            <button
              key={q.id}
              type="button"
              className="chat-quick-btn"
              disabled={pending}
              onClick={() => sendUser(q.send)}
            >
              {q.label}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="chat-input-row">
          <label htmlFor="trackaid-chat-input" className="sr-only">
            Mensaje para el asistente
          </label>
          <textarea
            id="trackaid-chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Ej: Me llamo Ana, ana@tienda.com, falla en pedido #4582…"
            disabled={pending}
            className="chat-input"
            autoComplete="off"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={pending || !input.trim()}
            aria-label="Enviar mensaje"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
