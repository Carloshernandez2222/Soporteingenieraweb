/**
 * Cliente API para endpoints del taller (patrones: Adapter, Composite, Strategy).
 */

import { fetchJson } from "../api";
import type { CasoTemporal, RegistroOk } from "../types";

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

export async function registrarCasoStrategy(params: {
  origen: OrigenRegistro;
  nombre?: string;
  email?: string;
  descripcion?: string;
  mensaje?: string;
  categoria?: string;
  creado_por_rol?: string;
}) {
  const q = new URLSearchParams({ origen: params.origen });
  if (params.nombre) q.set("nombre", params.nombre);
  if (params.email) q.set("email", params.email);
  if (params.descripcion) q.set("descripcion", params.descripcion);
  if (params.mensaje) q.set("mensaje", params.mensaje);
  if (params.categoria) q.set("categoria", params.categoria);
  if (params.creado_por_rol) q.set("creado_por_rol", params.creado_por_rol);
  return fetchJson<RegistroOk>(`/registrar?${q}`, { method: "POST" });
}
