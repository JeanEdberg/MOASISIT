/**
 * Régimen laboral de la empresa y su efecto en los beneficios sociales.
 *
 * Módulo PURO (sin React ni base de datos). La SUNAT no expone el régimen
 * laboral (REMYPE) en la consulta de RUC, así que RR.HH. lo elige a mano y
 * adjunta la resolución de acogimiento como sustento. Aquí se centralizan las
 * reglas para que los cálculos y los avisos de la UI salgan del mismo lugar.
 *
 * Referencia (Perú, 2026):
 *   - Régimen general (D. Leg. 728 / 650 / 27735): CTS, gratificación y 30 días
 *     de vacaciones completos.
 *   - Pequeña empresa (D. Leg. 1086, REMYPE): CTS y gratificación al 50% y 15
 *     días de vacaciones.
 *   - Microempresa (D. Leg. 1086, REMYPE): sin CTS ni gratificación; 15 días de
 *     vacaciones.
 *   - MYPE por control tributario: se calcula como el régimen general.
 */

import type { CompanyRegime, HrData, Regime } from "@/lib/hr/types";

export const COMPANY_REGIMES: CompanyRegime[] = ["general", "mype", "pequena", "micro"];

export const DEFAULT_COMPANY_REGIME: CompanyRegime = "general";

/** Normaliza un valor guardado (datasets antiguos sin el campo) a un régimen válido. */
export function normalizeCompanyRegime(value: unknown): CompanyRegime {
  return COMPANY_REGIMES.includes(value as CompanyRegime) ? (value as CompanyRegime) : DEFAULT_COMPANY_REGIME;
}

/**
 * Régimen del colaborador que corresponde al régimen de su empresa. La MYPE de
 * control tributario se resuelve como régimen general para el cálculo.
 */
export function employeeRegimeFor(companyRegime: CompanyRegime): Regime {
  if (companyRegime === "pequena") return "pequena";
  if (companyRegime === "micro") return "micro";
  return "general";
}

/** Fracción de CTS y gratificación que aplica el régimen (1 = completa, 0.5 = mitad, 0 = exenta). */
export function benefitShare(companyRegime: CompanyRegime): number {
  if (companyRegime === "pequena") return 0.5;
  if (companyRegime === "micro") return 0;
  return 1;
}

/** Días de vacaciones que genera el régimen por año laborado. */
export function vacationDaysPerYear(companyRegime: CompanyRegime): number {
  return companyRegime === "general" || companyRegime === "mype" ? 30 : 15;
}

/** Gratificaciones al año consideradas para la proyección de renta de quinta. */
export function gratificationsPerYear(companyRegime: CompanyRegime): number {
  if (companyRegime === "pequena") return 1;
  if (companyRegime === "micro") return 0;
  return 2;
}

/**
 * Tasa de la bonificación extraordinaria que acompaña a la gratificación
 * (Ley N° 29351, modificada por la Ley N° 30334). Corresponde al aporte
 * patronal al seguro de salud que se entrega directamente al trabajador:
 * 9% con EsSalud o 6.75% con el crédito de una EPS.
 */
export function gratuityBonusRate(healthInsurance: "essalud" | "eps" | undefined): number {
  return healthInsurance === "eps" ? 0.0675 : 0.09;
}

/** ¿El régimen obliga a registrar la resolución de acogimiento REMYPE? */
export function requiresMypeResolution(companyRegime: CompanyRegime): boolean {
  return companyRegime === "pequena" || companyRegime === "micro";
}

export type RegimeBenefits = {
  cts: string;
  gratificacion: string;
  vacaciones: string;
  essalud: string;
};

/** Resumen legible de los beneficios del régimen, para los avisos de la UI. */
export function regimeBenefits(companyRegime: CompanyRegime): RegimeBenefits {
  const share = benefitShare(companyRegime);
  const cts = share === 1 ? "Completa" : share === 0.5 ? "50%" : "No aplica";
  return {
    cts,
    gratificacion: cts,
    vacaciones: `${vacationDaysPerYear(companyRegime)} días`,
    essalud: "9% a cargo del empleador",
  };
}

/**
 * Falta la resolución de acogimiento cuando la empresa es MYPE y no registró el
 * número ni la fecha. Devuelve un aviso, o `null` si no hay problema.
 */
export function mypeResolutionWarning(company: {
  regime?: CompanyRegime;
  mypeResolutionNumber?: string;
  mypeResolutionDate?: string;
}): string | null {
  const regime = normalizeCompanyRegime(company.regime);
  if (!requiresMypeResolution(regime)) return null;
  if (!(company.mypeResolutionNumber ?? "").trim() || !(company.mypeResolutionDate ?? "").trim()) {
    return "Falta la resolución de acogimiento REMYPE (número y fecha). Sin ella no se puede sustentar el régimen ante una fiscalización.";
  }
  return null;
}

/**
 * Completa el régimen de cada empresa que aún no lo tenga (datasets creados
 * antes de este campo). Idempotente: si ya están, devuelve el mismo objeto.
 */
export function withCompanyRegime(data: HrData): HrData {
  let changed = false;
  const companies = data.companies.map((c) => {
    if (c.regime && typeof c.mypeResolutionNumber === "string" && typeof c.mypeResolutionDate === "string") {
      return c;
    }
    changed = true;
    return {
      ...c,
      regime: normalizeCompanyRegime(c.regime),
      mypeResolutionNumber: c.mypeResolutionNumber ?? "",
      mypeResolutionDate: c.mypeResolutionDate ?? "",
    };
  });
  if (!changed) return data;
  const company = companies.find((c) => c.id === data.company.id) ?? data.company;
  return { ...data, companies, company };
}
