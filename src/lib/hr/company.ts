import { catalogInsurers } from "@/lib/hr/insurers";
import { DEFAULT_FIFTH_CATEGORY } from "@/lib/hr/fifth";
import { normalizeRuc } from "@/lib/hr/ruc";
import { DEFAULT_SUBSCRIPTION } from "@/lib/hr/subscription";
import type { Company } from "@/lib/hr/types";

/**
 * Parámetros legales por defecto (referencia 2026). Varían por norma, no por
 * empresa; se guardan en cada empresa para que RR.HH. pueda ajustarlos.
 */
export const LEGAL_DEFAULTS = {
  rmv: 1230,
  uit: 5500,
  fifthCategory: DEFAULT_FIFTH_CATEGORY,
  topeAfp: 12599,
  essalud: 0.09,
  onp: 0.13,
  afpAporte: 0.1,
  afpSeguro: 0.0137,
  afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
  epsAporteTrabajador: 0.0225,
} as const;

export const BRAND_DEFAULTS = {
  brandName: "Moasist",
  brandMark: "MO",
  brandColor: "#0284c7",
  accentColor: "#0369a1",
} as const;

export type NewCompanyInput = {
  ruc: string;
  name: string;
  shortName: string;
  tradeName: string;
  city: string;
  address: string;
  email: string;
  phone?: string;
  brandMark?: string;
  brandColor?: string;
  accentColor?: string;
  /** Correo del usuario RR.HH. que podrá entrar a esta empresa (opcional). */
  adminEmail?: string;
};

/** Convierte un texto en un id de empresa seguro ("Los 7 Pollitos" → "los7pollitos"). */
export function slugifyCompanyId(text: string): string {
  const base = String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return base || "empresa";
}

/** Id único frente a los ya existentes (agrega -2, -3, … si hace falta). */
export function uniqueCompanyId(preferred: string, existing: string[]): string {
  const taken = new Set(existing);
  const base = slugifyCompanyId(preferred);
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** Arma una `Company` completa con los valores por defecto y el catálogo de seguros. */
export function buildCompany(input: NewCompanyInput, id: string): Company {
  const name = input.name.trim();
  const shortName = (input.shortName.trim() || name).slice(0, 24);
  return {
    id,
    name,
    shortName,
    tradeName: input.tradeName.trim() || name,
    ruc: normalizeRuc(input.ruc),
    address: input.address.trim(),
    city: input.city.trim(),
    email: input.email.trim(),
    phone: (input.phone ?? "").trim(),
    brandName: BRAND_DEFAULTS.brandName,
    brandMark: (input.brandMark?.trim() || shortName.slice(0, 2)).toUpperCase().slice(0, 2),
    brandColor: input.brandColor?.trim() || BRAND_DEFAULTS.brandColor,
    accentColor: input.accentColor?.trim() || BRAND_DEFAULTS.accentColor,
    ...LEGAL_DEFAULTS,
    insurers: catalogInsurers(id),
    subscription: { ...DEFAULT_SUBSCRIPTION, startDate: new Date().toISOString().slice(0, 10) },
  };
}

/** Mensaje de error de validación, o `null` si el formulario está completo. */
export function validateNewCompany(input: NewCompanyInput, existingIds: string[]): string | null {
  if (!input.name.trim()) return "La razón social es obligatoria.";
  const ruc = normalizeRuc(input.ruc);
  if (ruc && ruc.length !== 11) return "El RUC debe tener 11 dígitos.";
  if (!input.shortName.trim()) return "El nombre corto es obligatorio.";
  if (existingIds.some((id) => slugifyCompanyId(input.shortName) === id)) {
    return "Ya existe una empresa con ese nombre corto.";
  }
  return null;
}
