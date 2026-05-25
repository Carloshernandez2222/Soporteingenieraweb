/**
 * Cliente API para endpoints del taller y soporte (patrones: Adapter, Composite, Strategy).
 */

import { fetchJson } from "../api";
import type { CasoTemporal } from "../types";
export type PlantillaTaller = "default" | "amazon" | "shopify";
export type OrigenIntegracion = "amazon" | "shopify";
export type OrigenRegistro = "web" | "chatbot";

export type MetricasJerarquicas = {
  total_casos: number;
  prioridad_promedio_global: number;
  tiendas: Array<{
    nombre: string;
    total_casos: number;
    prioridad_promedio: number;
  }>;
};

export type CasoCrearBody = {
  id: number;
  cliente: string;
  activo: boolean;
  prioridad: number;
  categoria: string;
  plantilla?: PlantillaTaller;
};

const EJEMPLOS_INTEGRACION: Record<OrigenIntegracion, Record<string, unknown>> = {
  amazon: {
    case_id: 5001,
    buyer_name: "Cliente Amazon",
    priority_level: "high",
    issue_type: "envio",
    is_open: true,
  },
  shopify: {
    ticket_number: 5002,
    customer: { display_name: "Tienda Demo Shopify" },
    urgency_score: 6.5,
    tags: ["ecommerce"],
    status: "open",
  },
};

export function ejemploPayloadIntegracion(origen: OrigenIntegracion) {
  return EJEMPLOS_INTEGRACION[origen];
}

export async function crearCasoTaller(body: CasoCrearBody) {
  return fetchJson<{ status: string; data: CasoTemporal }>("/casos/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function crearCasoIntegracion(
  origen: OrigenIntegracion,
  payload: Record<string, unknown>
) {
  return fetchJson<{ status: string; origen: string; data: CasoTemporal }>(
    `/casos/integracion?${new URLSearchParams({ origen })}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

export async function obtenerMetricasJerarquicas() {
  return fetchJson<{ status: string; data: MetricasJerarquicas }>(
    "/casos/metricas-jerarquicas"
  );
}

// Retornamos Promise<any> para evitar conflictos de TypeScript con el Chatbot
export async function registrarCasoStrategy(payload: any): Promise<any> {
  // Si tiene user_id, es el flujo del nuevo backend SQL Server
  if (payload.user_id) {
    return fetchJson(
      "/api/casos/soporte", 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: payload.user_id,
          descripcion: payload.descripcion,
          case_type: payload.case_type || "General",
          priority: payload.priority || "Medium"
        }),
      }
    );
  }

  // Flujo antiguo para el Taller/Chatbot (SQLite)
  const q = new URLSearchParams({ origen: payload.origen || "web" });
  if (payload.nombre) q.set("nombre", payload.nombre);
  if (payload.email) q.set("email", payload.email);
  if (payload.descripcion) q.set("descripcion", payload.descripcion);
  if (payload.mensaje) q.set("mensaje", payload.mensaje);
  if (payload.categoria) q.set("categoria", payload.categoria);
  if (payload.creado_por_rol) q.set("creado_por_rol", payload.creado_por_rol);
  
  return fetchJson(`/registrar?${q}`, { method: "POST" });
}