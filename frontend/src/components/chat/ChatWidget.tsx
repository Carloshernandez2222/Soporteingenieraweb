import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { mensajeError } from "@/api";
import { registrarCasoStrategy } from "@/lib/panelPatronesApi";
import { ChatMessageBody } from "./ChatMessageBody";
import {
  CHAT_QUICK_PROMPTS,
  CHAT_WELCOME,
  nextChatId,
  procesarTurno,
  type ChatCollectState,
  type ChatMessage,
  type ChatRegisterPayload,
} from "./chatLogic";

const MAX_CHAT_CHARS = 500;

type ChatWidgetProps = {
  /** Solo cuerpo del chat (sin cabecera shell). */
  bare?: boolean;
  className?: string;
  /** Si se define, guarda/restaura la conversación para sesión autenticada. */
  storageKey?: string;
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

export function ChatWidget({ bare = false, className = "", storageKey }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([CHAT_WELCOME]);
  const [collect, setCollect] = useState<ChatCollectState>({});
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

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { messages?: ChatMessage[]; collect?: ChatCollectState };
      if (parsed.messages?.length) setMessages(parsed.messages);
      if (parsed.collect) setCollect(parsed.collect);
    } catch {
      // Ignorar estado corrupto.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ messages, collect }));
    } catch {
      // Ignorar si el navegador bloquea storage.
    }
  }, [messages, collect, storageKey]);

  function pushMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: nextChatId() }]);
  }

  async function intentarRegistro(payload: ChatRegisterPayload) {
    setPending(true);
    try {
      const data = await registrarCasoStrategy({
        origen: "chatbot",
        mensaje: payload.mensaje,
        nombre: payload.nombre,
        email: payload.email,
        descripcion: payload.descripcion,
      });
      setCollect({});
      pushMessage({
        role: "bot",
        kind: "success",
        ticketId: data.caso_id,
        text: `Listo: tu incidencia quedó registrada como ticket #${data.caso_id}.\n\n${data.message || data.msg || "El equipo puede dar seguimiento con tu correo."}`,
      });
    } catch (e) {
      pushMessage({
        role: "bot",
        kind: "error",
        text: `No pude registrar el ticket: ${mensajeError(e)}\n\nRevisa que el correo sea válido y que hayas descrito el problema. Puedes seguir escribiendo.`,
      });
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  async function responderUsuario(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const turn = procesarTurno(collect, trimmed);
    setCollect(turn.state);

    if (turn.shouldRegister && turn.registerPayload) {
      pushMessage({ role: "bot", text: turn.reply });
      await intentarRegistro(turn.registerPayload);
      return;
    }

    pushMessage({ role: "bot", text: turn.reply });
  }

  function sendUser(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    if (trimmed.length > MAX_CHAT_CHARS) return;
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
          Escribe como quieras: el bot entiende varios mensajes (correo + problema). Máx. {MAX_CHAT_CHARS}{" "}
          caracteres.
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
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHAT_CHARS))}
            onKeyDown={onInputKeyDown}
            placeholder="Ej: No me carga el pedido… luego tu correo cuando quieras"
            disabled={pending}
            className="chat-input"
            autoComplete="off"
            maxLength={MAX_CHAT_CHARS}
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
        <p className="chat-counter m-0" aria-live="polite">
          {input.length}/{MAX_CHAT_CHARS}
        </p>
      </div>
    </div>
  );
}
