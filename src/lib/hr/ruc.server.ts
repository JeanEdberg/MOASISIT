import { isValidRuc, normalizeRuc, parseRucResponse, type RucLookupResult } from "@/lib/hr/ruc";

/**
 * Consulta de RUC server-only. La llave del proveedor (`RUC_API_TOKEN`) vive en
 * el entorno del servidor y NUNCA se envía al navegador: el cliente solo pide
 * "consulta este RUC" y recibe los datos ya normalizados.
 */

const DEFAULT_ENDPOINT = "https://api.apis.net.pe/v2/ruc";
const TIMEOUT_MS = 8000;

function endpointFor(ruc: string): string {
  const base = (process.env.RUC_API_ENDPOINT?.trim() || DEFAULT_ENDPOINT).replace(/\/+$/, "");
  return `${base}?numero=${encodeURIComponent(ruc)}`;
}

/**
 * Consulta un RUC contra el proveedor configurado. Nunca lanza: devuelve un
 * resultado tipado para que la UI muestre un mensaje claro.
 */
export async function lookupRuc(raw: string): Promise<RucLookupResult> {
  const ruc = normalizeRuc(raw);
  if (!isValidRuc(ruc)) {
    return { ok: false, error: "El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20." };
  }

  const token = process.env.RUC_API_TOKEN?.trim();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpointFor(ruc), { headers, signal: controller.signal });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "El servicio de consulta RUC rechazó la llave (RUC_API_TOKEN)." };
    }
    if (res.status === 429) {
      return { ok: false, error: "Se agotó la cuota del servicio de consulta RUC. Intenta más tarde." };
    }
    if (!res.ok) {
      return { ok: false, error: `El servicio de consulta RUC respondió ${res.status}.` };
    }
    const payload: unknown = await res.json();
    const info = parseRucResponse(payload);
    if (!info) return { ok: false, error: "No se encontró el RUC en SUNAT." };
    return { ok: true, info };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted ? "La consulta RUC demoró demasiado. Intenta de nuevo." : "No se pudo consultar el RUC (sin conexión).",
    };
  } finally {
    clearTimeout(timer);
  }
}
