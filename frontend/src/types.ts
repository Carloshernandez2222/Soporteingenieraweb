export type CasoTemporal = {
  id: number;
  cliente: string;
  activo: boolean;
  prioridad: number;
  categoria: string;
};

export type CasoSqlite = {
  id: number;
  nombre: string;
  email: string;
  descripcion: string;
};

export type RegistroOk = {
  status: string;
  message: string;
  msg: string;
  caso_id: number;
};
