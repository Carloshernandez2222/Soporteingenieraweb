export type ChatRole = "user" | "bot";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "normal" | "success" | "error";
  ticketId?: number;
};

/** Datos reunidos a lo largo de la conversación. */
export type ChatCollectState = {
  nombre?: string;
  email?: string;
  descripcion?: string;
};

export type ChatRegisterPayload = {
  mensaje: string;
  nombre?: string;
  email?: string;
  descripcion?: string;
};

export type TurnResult = {
  reply: string;
  state: ChatCollectState;
  shouldRegister: boolean;
  registerPayload?: ChatRegisterPayload;
};

export const CHAT_QUICK_PROMPTS = [
  { id: "what", label: "¿Qué es TrackAid?", send: "¿Qué es TrackAid?" },
  { id: "how", label: "¿Cómo abro un ticket?", send: "¿Cómo abro un ticket?" },
  { id: "help", label: "Ayuda con un pedido", send: "Tengo un problema con un pedido, ¿me ayudas?" },
] as const;

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w+/;
const MIN_DESCRIPCION = 6;

/** Palabras o frases que indican un problema (sin lista cerrada rígida). */
const ISSUE_RE =
  /\b(no\s+funciona|no\s+carga|no\s+llega|falla|falló|fallo|error|problema|incidencia|ticket|pedido|orden|compra|env[ií]o|pago|factura|reembolso|devoluci[oó]n|demora|retraso|urgente|ayuda|bloqueado|roto|dañado|ca[ií]da|bug|soporte|seguimiento|actualiza|cancelad[oa]|integraci[oó]n|checkout|carrito|stock|inventario)\b/i;

const SALUDO_RE =
  /^(hola|buenas|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|hey|hi|hello|qu[eé]\s+tal|saludos)[\s!.?]*$/i;

const CONFIRMA_RE =
  /^(s[ií]|si|ok|vale|listo|adelante|de\s+acuerdo|confirmo|registra|registrar|hazlo|por\s+favor)[\s!.?]*$/i;

let idSeq = 0;
export function nextChatId() {
  idSeq += 1;
  return `chat-${idSeq}`;
}

export function extraerEmail(text: string): string | undefined {
  const m = text.match(EMAIL_RE);
  return m?.[0]?.toLowerCase();
}

function capitalizarNombre(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function esNombreValido(candidato: string): boolean {
  const t = candidato.trim();
  if (t.length < 2 || t.length > 48) return false;
  if (/@/.test(t)) return false;
  return /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]+$/.test(t);
}

export function extraerNombre(text: string): string | undefined {
  const patrones = [
    /(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+([a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]{2,48})/i,
    /(?:nombre:?)\s*([a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]{2,48})/i,
  ];
  for (const re of patrones) {
    const m = text.match(re);
    if (m?.[1] && esNombreValido(m[1])) {
      return capitalizarNombre(m[1].split(/[,;.]/)[0] ?? m[1]);
    }
  }

  const email = extraerEmail(text);
  if (email) {
    const antes = text.split(email)[0] ?? "";
    const limpio = antes.replace(/[,;:\-–—]+$/g, "").trim();
    const palabras = limpio
      .split(/[\s,]+/)
      .filter((w) => w.length > 1 && !/^(hola|buenas|oye|soy|me|llamo)$/i.test(w));
    if (palabras.length >= 1 && palabras.length <= 4) {
      const candidato = palabras.join(" ");
      if (esNombreValido(candidato)) return capitalizarNombre(candidato);
    }
  }
  return undefined;
}

function limpiarTextoDescripcion(text: string, email?: string, nombre?: string): string {
  let t = text;
  if (email) t = t.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  if (nombre) t = t.replace(new RegExp(nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  t = t
    .replace(/(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+[^,.@]+/gi, " ")
    .replace(/[,;:\-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

export function mergeCollectState(state: ChatCollectState, text: string): ChatCollectState {
  const email = extraerEmail(text) ?? state.email;
  const nombre = extraerNombre(text) ?? state.nombre;
  const fragmento = limpiarTextoDescripcion(text, email, nombre);

  let descripcion = state.descripcion?.trim() ?? "";
  if (fragmento && !SALUDO_RE.test(fragmento)) {
    const aporta =
      ISSUE_RE.test(fragmento) ||
      fragmento.length >= MIN_DESCRIPCION ||
      (!descripcion && fragmento.length >= 3);
    if (aporta) {
      if (!descripcion) descripcion = fragmento;
      else if (!descripcion.toLowerCase().includes(fragmento.toLowerCase())) {
        descripcion = `${descripcion}. ${fragmento}`;
      }
    }
  }

  if (!descripcion && text.length >= MIN_DESCRIPCION && !SALUDO_RE.test(text) && !extraerEmail(text)) {
    descripcion = text.trim();
  }

  return {
    nombre,
    email,
    descripcion: descripcion || state.descripcion,
  };
}

export function puedeRegistrar(state: ChatCollectState): boolean {
  const desc = (state.descripcion ?? "").trim();
  return Boolean(state.email && desc.length >= MIN_DESCRIPCION);
}

function mensajeRegistro(state: ChatCollectState): string {
  const partes: string[] = [];
  if (state.nombre) partes.push(`Me llamo ${state.nombre}.`);
  if (state.email) partes.push(state.email);
  if (state.descripcion) partes.push(state.descripcion);
  return partes.join(" ").trim();
}

function truncar(s: string | undefined, max = 80): string {
  if (!s) return "";
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

/** Respuestas informativas (FAQ); null si no aplica. */
export function intentFAQ(text: string): string | null {
  const t = text.toLowerCase().trim();
  if (!t) return "Cuéntame qué ocurre y, si puedes, tu correo para registrar el caso.";
  if (SALUDO_RE.test(t)) {
    return "¡Hola! Cuéntame qué te pasa (pedido, pago, sistema…) y tu correo. Puedes escribir como quieras, en varios mensajes.";
  }
  if (/precio|plan|costo|pagar|tarifa/.test(t)) {
    return "En la sección Precios verás los planes. Si necesitas soporte, describe tu caso y deja tu correo.";
  }
  if (/trackaid|qu[eé]\s+es|para\s+qu[eé]/.test(t)) {
    return "TrackAid centraliza incidencias de operaciones eCommerce. ¿Tienes algún problema ahora? Escríbelo con tu correo.";
  }
  if (/c[oó]mo.*ticket|abrir.*ticket|crear.*ticket|registr/.test(t)) {
    return "No hace falta un formato rígido: di qué falla y tu correo. Ejemplo: «No me carga el panel, soy Ana, ana@tienda.com».";
  }
  if (/gracias|thanks|agradezco/.test(t)) return "Con gusto. Si necesitas algo más, escríbeme.";
  if (/adi[oó]s|chao|bye|hasta\s+luego/.test(t)) return "Hasta pronto. Aquí estaré si surge otra incidencia.";
  return null;
}

export function procesarTurno(state: ChatCollectState, text: string): TurnResult {
  const t = text.trim();
  if (!t) {
    return {
      reply: "Escribe tu mensaje cuando quieras; acepto texto libre.",
      state,
      shouldRegister: false,
    };
  }

  if (CONFIRMA_RE.test(t) && puedeRegistrar(state)) {
    return {
      reply: "Perfecto, registro tu ticket ahora…",
      state,
      shouldRegister: true,
      registerPayload: buildRegisterPayload(state),
    };
  }

  const faq = intentFAQ(t);
  const merged = mergeCollectState(state, t);
  const soloFaq = faq && !merged.email && !(merged.descripcion && merged.descripcion.length >= 3);

  if (soloFaq && !ISSUE_RE.test(t) && !extraerEmail(t)) {
    return { reply: faq, state: merged, shouldRegister: false };
  }

  if (puedeRegistrar(merged)) {
    const listo =
      ISSUE_RE.test(t) ||
      Boolean(extraerEmail(t)) ||
      CONFIRMA_RE.test(t) ||
      (merged.descripcion?.length ?? 0) >= 12;
    if (listo) {
      return {
        reply: "Entendido. Estoy registrando tu incidencia…",
        state: merged,
        shouldRegister: true,
        registerPayload: buildRegisterPayload(merged),
      };
    }
    return {
      reply:
        `Tengo tu correo ${merged.email}` +
        (merged.descripcion ? ` y anoté: «${truncar(merged.descripcion)}»` : "") +
        ". Si es correcto, responde sí para crear el ticket, o añade más detalle.",
      state: merged,
      shouldRegister: false,
    };
  }

  if (!merged.email && !merged.descripcion) {
    return {
      reply:
        faq ??
        "Cuéntame el problema con tus palabras (no necesitas tecnicismos). Luego tu correo para el seguimiento.",
      state: merged,
      shouldRegister: false,
    };
  }

  if (!merged.email) {
    return {
      reply: `Anoté: «${truncar(merged.descripcion)}». ¿Cuál es tu correo? Puedes pegarlo en el siguiente mensaje.`,
      state: merged,
      shouldRegister: false,
    };
  }

  if (!merged.descripcion || merged.descripcion.length < MIN_DESCRIPCION) {
    return {
      reply: `Tengo ${merged.email}. ¿Qué está pasando? (pedido, pago, acceso, error…). Con una frase corta basta.`,
      state: merged,
      shouldRegister: false,
    };
  }

  return {
    reply: "Registrando tu ticket…",
    state: merged,
    shouldRegister: true,
    registerPayload: buildRegisterPayload(merged),
  };
}

function buildRegisterPayload(state: ChatCollectState): ChatRegisterPayload {
  return {
    mensaje: mensajeRegistro(state),
    nombre: state.nombre,
    email: state.email,
    descripcion: state.descripcion,
  };
}

/** @deprecated Usar procesarTurno; se mantiene por compatibilidad. */
export function botReply(text: string): string {
  return intentFAQ(text) ?? "Puedes escribir libremente: correo + qué te falla. Te voy guiando.";
}

/** @deprecated Usar procesarTurno + puedeRegistrar. */
export function pareceSolicitudTicket(text: string): boolean {
  return Boolean(extraerEmail(text) && (ISSUE_RE.test(text) || text.trim().length >= 20));
}

export const CHAT_WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hola, soy TrackAid Assistant. Cuéntame qué ocurre (como quieras) y tu correo; puedes ir en varios mensajes y yo armo el ticket.",
};
