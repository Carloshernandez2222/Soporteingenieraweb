export type ChatRole = "user" | "bot";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "normal" | "success" | "error";
  ticketId?: number;
};

export const CHAT_QUICK_PROMPTS = [
  { id: "what", label: "¿Qué es TrackAid?", send: "¿Qué es TrackAid?" },
  { id: "how", label: "¿Cómo abro un ticket?", send: "¿Cómo abro un ticket?" },
  { id: "demo", label: "Registrar ejemplo", send: "Registrar ticket de prueba" },
] as const;

export const CHAT_EXAMPLE_TICKET =
  "Me llamo Ana Demo. Correo ana.demo@ejemplo.com. Problema de software en la integración del pedido.";

let idSeq = 0;
export function nextChatId() {
  idSeq += 1;
  return `chat-${idSeq}`;
}

export function botReply(text: string): string {
  const t = text.toLowerCase().trim();
  if (!t) return "Cuéntame qué ocurre con tu pedido o integración y te guío paso a paso.";
  if (/hola|buen(os|as)\s|hey|hi\b/.test(t)) {
    return "¡Hola! Soy el asistente de TrackAid. Si incluyes tu **correo** y describes el problema, puedo **registrar un ticket real** en segundos.";
  }
  if (/precio|plan|costo|pagar/.test(t)) {
    return "En la sección **Precios** de esta web verás los planes. Si quieres, también puedo ayudarte a registrar una incidencia de prueba aquí mismo.";
  }
  if (/trackaid|qu[eé]\s+es|para\s+qu[eé]/.test(t)) {
    return "TrackAid centraliza el **seguimiento de incidencias** en operaciones eCommerce: menos cancelaciones y más visibilidad para tu equipo.";
  }
  if (/c[oó]mo.*ticket|abrir.*ticket|crear.*ticket/.test(t)) {
    return "Escribe en una sola frase: tu **nombre**, **correo** y **qué falló**. Ejemplo: «Me llamo Ana, ana@tienda.com, el pedido #4582 no actualiza estado.»";
  }
  if (/gracias|thanks/.test(t)) return "Con gusto. Si surge otra incidencia, escríbeme de nuevo.";
  if (/adi[oó]s|chao|bye/.test(t)) return "Hasta pronto. Tu operación queda en buenas manos.";
  return "Para un ticket real, incluye **correo** y describe el problema. También puedes pulsar **Registrar ejemplo** abajo.";
}

export function pareceSolicitudTicket(text: string): boolean {
  return /@/.test(text) && /(ticket|incidencia|problema|falla|error|pedido|registr)/i.test(text);
}

export const CHAT_WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hola, soy **TrackAid Assistant**. Describe tu incidencia con tu correo y la registro en el sistema (demo con backend real).",
};
