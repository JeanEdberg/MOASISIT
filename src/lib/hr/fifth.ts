/**
 * Retención mensual del impuesto a la renta de quinta categoría (Perú).
 *
 * Módulo PURO (sin React ni base de datos): recibe los parámetros de la empresa
 * y la proyección anual de ingresos del colaborador, y devuelve el impuesto
 * anual y la retención del mes. Así se prueba sin servidor y RR.HH. puede
 * ajustar la UIT, la deducción y los tramos cuando cambie la norma.
 *
 * Regla (TUO de la Ley del Impuesto a la Renta, art. 40 y 74; referencia 2026):
 *   1. Se proyecta la renta del año: sueldos, gratificaciones, horas extra,
 *      comisiones y bonos (la CTS y las indemnizaciones no están afectas).
 *   2. Se resta la deducción fija (7 UIT = S/ 38,500 con UIT de S/ 5,500).
 *   3. A la renta neta se aplican tasas acumulativas por tramos:
 *      hasta 5 UIT 8%, hasta 20 UIT 14%, hasta 35 UIT 17%, hasta 45 UIT 20%
 *      y el exceso al 30%.
 *   4. El impuesto anual estimado se divide entre los 12 meses.
 */

import type { Company, Employee, FifthCategoryBand, FifthCategoryParams } from "@/lib/hr/types";

/** Escala vigente de referencia 2026 (tasas acumulativas por tramos en UIT). */
export const DEFAULT_FIFTH_BANDS: FifthCategoryBand[] = [
  { span: 5, rate: 0.08 },
  { span: 15, rate: 0.14 },
  { span: 15, rate: 0.17 },
  { span: 10, rate: 0.2 },
  { span: null, rate: 0.3 },
];

/** Deducción fija de referencia 2026: 7 UIT. */
export const DEFAULT_FIFTH_DEDUCTION_UIT = 7;

export const DEFAULT_FIFTH_CATEGORY: FifthCategoryParams = {
  deductionUit: DEFAULT_FIFTH_DEDUCTION_UIT,
  bands: DEFAULT_FIFTH_BANDS,
};

export const FIFTH_DEDUCTION_LABEL = "Deducción fija (UIT)";

/** Copia los parámetros completando lo que falte con los valores por defecto. */
export function fifthCategoryParamsOf(company: {
  fifthCategory?: Partial<FifthCategoryParams>;
}): FifthCategoryParams {
  const stored = company.fifthCategory;
  const bands = Array.isArray(stored?.bands) && stored!.bands.length ? stored!.bands : DEFAULT_FIFTH_BANDS;
  const deductionUit = Number.isFinite(stored?.deductionUit) ? Number(stored!.deductionUit) : DEFAULT_FIFTH_DEDUCTION_UIT;
  return { deductionUit, bands: bands.map((b) => ({ span: b.span ?? null, rate: b.rate })) };
}

/**
 * Completa los parámetros de quinta de cada empresa y el flag de afectación de
 * cada colaborador que aún no los tengan (datasets creados antes de esta
 * función). Idempotente: si ya están, devuelve el mismo objeto.
 */
export function withFifthCategory<T extends { companies: Company[]; company: Company; employees: Employee[] }>(data: T): T {
  let changed = false;
  const companies = data.companies.map((c) => {
    if (c.fifthCategory) return c;
    changed = true;
    return { ...c, fifthCategory: { ...DEFAULT_FIFTH_CATEGORY, bands: DEFAULT_FIFTH_BANDS.map((b) => ({ ...b })) } };
  });
  const employees = data.employees.map((e) => {
    if (typeof e.fifthCategory === "boolean") return e;
    changed = true;
    return { ...e, fifthCategory: e.regime === "general" };
  });
  if (!changed) return data;
  const company = companies.find((c) => c.id === data.company.id) ?? data.company;
  return { ...data, companies, company, employees };
}

/** Impuesto anual aplicando la escala acumulativa sobre la renta neta (en S/). */
export function fifthTaxFromNet(net: number, uit: number, bands: FifthCategoryBand[]): number {
  if (net <= 0) return 0;
  let left = net;
  let tax = 0;
  for (const band of bands) {
    if (left <= 0) break;
    const limit = band.span == null ? Number.POSITIVE_INFINITY : band.span * uit;
    const slice = Math.min(left, limit);
    tax += slice * band.rate;
    left -= slice;
  }
  return tax;
}

export type FifthProjectionInput = {
  /** Remuneración mensual afecta (básico pagado + asignación familiar), en S/. */
  ordinaryMonthly: number;
  /** Promedio mensual de horas extra y otros ingresos afectos, en S/. */
  extrasMonthly: number;
  /** Cantidad de gratificaciones anuales según régimen (2 general, 1 pequeña). */
  gratificationsPerYear: number;
  /** Parámetros editables de la empresa. */
  params: FifthCategoryParams;
  /** Valor de la UIT vigente. */
  uit: number;
};

export type FifthProjection = {
  /** Renta anual proyectada (sueldos + gratificaciones + extras). */
  annualIncome: number;
  /** Deducción fija aplicada (S/). */
  deduction: number;
  /** Renta neta imponible (S/). */
  taxable: number;
  /** Impuesto anual estimado (S/). */
  annualTax: number;
  /** Retención del mes (impuesto anual / 12), redondeada a 2 decimales. */
  monthlyTax: number;
};

/** Proyección anual y retención mensual de quinta categoría. */
export function projectFifthCategory(input: FifthProjectionInput): FifthProjection {
  const { ordinaryMonthly, extrasMonthly, gratificationsPerYear, params, uit } = input;
  const annualIncome = ordinaryMonthly * (12 + gratificationsPerYear) + extrasMonthly * 12;
  const deduction = params.deductionUit * uit;
  const taxable = Math.max(0, annualIncome - deduction);
  const annualTax = fifthTaxFromNet(taxable, uit, params.bands);
  const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
  return { annualIncome, deduction, taxable, annualTax, monthlyTax };
}
