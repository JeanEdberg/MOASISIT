/**
 * Consulta de RUC de SUNAT (vía un proveedor como apis.net.pe). Este módulo es
 * PURO: normaliza la entrada y traduce la respuesta del proveedor. La llamada
 * de red vive en `ruc.server.ts`, para que la llave nunca toque el navegador.
 */

export type RucInfo = {
  ruc: string;
  razonSocial: string;
  direccion: string;
  /** Distrito (ubigeo). Puede venir vacío en algunos contribuyentes. */
  distrito: string;
  provincia: string;
  departamento: string;
  /** `ACTIVO` | `BAJA` | `SUSPENSION TEMPORAL` | … */
  estado: string;
  /** `HABIDO` | `NO HABIDO` | `NO HALLADO` | … */
  condicion: string;
};

/** Deja solo los dígitos del RUC, recortado a 11. */
export function normalizeRuc(raw: string): string {
  return String(raw ?? "").replace(/\D/g, "").slice(0, 11);
}

/** Un RUC válido en Perú tiene 11 dígitos y empieza con 10, 15, 17 o 20. */
export function isValidRuc(raw: string): boolean {
  const ruc = normalizeRuc(raw);
  return ruc.length === 11 && /^(10|15|17|20)/.test(ruc);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Traduce la respuesta de apis.net.pe a `RucInfo`. Devuelve `null` cuando el
 * proveedor no reconoce el RUC (responde `{ message: "ruc no valido" }`).
 */
export function parseRucResponse(payload: unknown): RucInfo | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;
  const razonSocial = str(row.razonSocial);
  const ruc = normalizeRuc(str(row.numeroDocumento));
  if (!razonSocial || ruc.length !== 11) return null;
  return {
    ruc,
    razonSocial,
    direccion: str(row.direccion),
    distrito: str(row.distrito),
    provincia: str(row.provincia),
    departamento: str(row.departamento),
    estado: str(row.estado),
    condicion: str(row.condicion),
  };
}

/** Etiqueta legible para el estado y la condición (ej. "ACTIVO · HABIDO"). */
export function rucStatusLabel(info: RucInfo): string {
  return [info.estado, info.condicion].filter(Boolean).join(" · ");
}

/** ¿El contribuyente está activo y habido (apto para operar)? */
export function isRucOperativo(info: RucInfo): boolean {
  return info.estado.toUpperCase() === "ACTIVO" && info.condicion.toUpperCase() === "HABIDO";
}

/** Resultado de una consulta de RUC (éxito con datos, o error legible). */
export type RucLookupResult = { ok: true; info: RucInfo } | { ok: false; error: string };
