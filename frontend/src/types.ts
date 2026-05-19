export type CasoTemporal = {
  id: number;
  cliente: string;
  activo: boolean;
  prioridad: number;
  categoria: string;
  created_at?: number;
};

export type CasoSqlite = {
  id: number;
  nombre: string;
  email: string;
  descripcion: string;
  categoria?: string;
  creado_por_rol?: "usuario" | "soporte" | "webmaster";
  created_at?: number;
};

export type RegistroOk = {
  status: string;
  message: string;
  msg: string;
  caso_id: number;
};

export type MetricasJerarquicas = {
  total_casos: number;
  prioridad_promedio_global: number;
  tiendas: Array<{
    nombre: string;
    total_casos: number;
    prioridad_promedio: number;
  }>;
};
