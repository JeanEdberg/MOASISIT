/**
 * Liquidación de beneficios sociales al cese (Perú).
 *
 * Módulo PURO (sin React ni base de datos). Reúne, a la fecha de cese, los
 * beneficios truncados que se le adeudan al colaborador:
 *
 *   - CTS trunca: meses y días computables desde el inicio del período trunco
 *     (May–Oct o Nov–Abr) hasta la fecha de cese (D. Leg. 650).
 *   - Gratificación trunca: meses calendario completos del semestre en curso
 *     (Ene–Jun o Jul–Dic) más la bonificación extraordinaria (Ley 27735 y
 *     Ley 29351/30334).
 *   - Vacaciones truncas y no gozadas: el saldo del récord en curso y de los
 *     períodos anteriores (D. Leg. 713).
 *
 * Reutiliza `ctsSemester` y `gratuityAmount`, que ya recortan el cálculo a la
 * fecha de fin de la ficha, para que la liquidación coincida con la planilla.
 * Es referencial: la asesoría laboral valida cada caso antes del pago.
 */

import { ctsSemester, effectiveRegime, gratuityAmount, vacationBalance, vacationRate } from "@/lib/hr/calc";
import { addMonths, differenceInCalendarDays, differenceInMonths } from "date-fns";
import { HOY, parseDay, round2 } from "@/lib/hr/format";
import { gratuityBonusRate } from "@/lib/hr/regime";
import type { Company, Employee, Regime, TimeRequest } from "@/lib/hr/types";

export type LiquidationItem = {
  code: string;
  label: string;
  /** Base o detalle del cálculo, para mostrar en la ficha. */
  detail: string;
  amount: number;
};

export type Liquidation = {
  /** Fecha de cese usada en el cálculo (ISO). */
  asOf: string;
  regime: Regime;
  /** CTS trunca (S/). */
  cts: number;
  /** Gratificación trunca sin bonificación (S/). */
  gratificacion: number;
  /** Bonificación extraordinaria de la gratificación (S/). */
  bonificacion: number;
  /** Vacaciones truncas y no gozadas (S/). */
  vacaciones: number;
  /** Total a liquidar (S/). */
  total: number;
  /** Detalle de la liquidación, línea por línea. */
  items: LiquidationItem[];
  /** Depósitos y pagos previos, solo como referencia informativa. */
  reference: LiquidationItem[];
};

/** Período de CTS (depósito de mayo o noviembre) que corresponde a una fecha. */
export function ctsPeriodFor(asOf: string): { year: number; which: "may" | "nov" } {
  const [y, m] = asOf.split("-").map(Number);
  if (m >= 5 && m <= 10) return { year: y, which: "nov" }; // May–Oct → depósito de noviembre
  if (m >= 11) return { year: y + 1, which: "may" }; // Nov–Dic → depósito de mayo del año siguiente
  return { year: y, which: "may" }; // Ene–Abr → depósito de mayo
}

/** Período de gratificación (Fiestas Patrias o Navidad) que corresponde a una fecha. */
export function gratuityPeriodFor(asOf: string): { year: number; which: "julio" | "navidad" } {
  const [y, m] = asOf.split("-").map(Number);
  if (m >= 1 && m <= 6) return { year: y, which: "julio" }; // Ene–Jun → Fiestas Patrias
  return { year: y, which: "navidad" }; // Jul–Dic → Navidad
}

/** Período de CTS inmediatamente anterior (el último depósito ya realizado). */
export function previousCtsPeriod(asOf: string): { year: number; which: "may" | "nov" } {
  const { year, which } = ctsPeriodFor(asOf);
  return which === "nov" ? { year, which: "may" } : { year: year - 1, which: "nov" };
}

/** Período de gratificación inmediatamente anterior (el último pago ya realizado). */
export function previousGratuityPeriod(asOf: string): { year: number; which: "julio" | "navidad" } {
  const { year, which } = gratuityPeriodFor(asOf);
  return which === "navidad" ? { year, which: "julio" } : { year: year - 1, which: "navidad" };
}

/**
 * Vacaciones truncas del récord en curso (desde el último aniversario) y no
 * gozadas de períodos anteriores. La trunca se liquida por meses y días
 * laborados proporcionalmente (D. Leg. 713, art. 22). Devuelve ambas por
 * separado y el total del saldo pendiente.
 */
export function vacationLiquidation(
  emp: Employee,
  requests: TimeRequest[],
  asOf: string,
  company: Company,
): { trunca: number; noGozadas: number; total: number } {
  const regime = effectiveRegime(company, emp);
  const total = Math.max(0, vacationBalance(emp, requests, asOf, company));
  const hire = parseDay(emp.hireDate);
  const end = parseDay(asOf);
  const rate = vacationRate(regime);

  // Meses completos totales; el récord en curso es el resto del ciclo anual,
  // más los días sueltos desde el último mes completo.
  const monthsTotal = Math.max(0, differenceInMonths(end, hire));
  const days = Math.max(0, differenceInCalendarDays(end, addMonths(hire, monthsTotal)));
  const trunca = round2((monthsTotal % 12 + days / 30) * rate);
  const noGozadas = round2(Math.max(0, total - trunca));
  return { trunca, noGozadas, total };
}

/**
 * Liquidación referencial de beneficios al cese. Si no se indica `asOf`, usa la
 * fecha de cese de la ficha o, en su defecto, hoy.
 */
export function liquidationOf(
  emp: Employee,
  company: Company,
  requests: TimeRequest[] = [],
  asOf: string = (emp.endDate ?? HOY).slice(0, 10),
): Liquidation {
  const regime = effectiveRegime(company, emp);
  const empAt = { ...emp, endDate: asOf, status: "cesado" as const };

  const cts = ctsSemester(empAt, company, ctsPeriodFor(asOf).year, ctsPeriodFor(asOf).which);
  const gratPeriod = gratuityPeriodFor(asOf);
  const { grat, bonif } = gratuityAmount(empAt, company, gratPeriod.year, gratPeriod.which);
  const vac = vacationLiquidation(emp, requests, asOf, company);

  const af = emp.familyAllowance ? company.rmv * 0.1 : 0;
  const computable = round2(emp.salary + af);
  const gratiLabel = gratPeriod.which === "julio" ? "Fiestas Patrias" : "Navidad";

  // La trunca y las no gozadas se pagan a razón de una remuneración diaria por
  // día de descanso (remuneración computable / 30).
  const dailyRate = computable / 30;
  const vacTruncaMoney = round2(vac.trunca * dailyRate);
  const vacNoGozadasMoney = round2(vac.noGozadas * dailyRate);
  const vacaciones = round2(vacTruncaMoney + vacNoGozadasMoney);

  const items: LiquidationItem[] = [];
  const push = (code: string, label: string, detail: string, amount: number) => {
    if (amount > 0.004) items.push({ code, label, detail, amount: round2(amount) });
  };

  push("CTS", "CTS trunca", `Remuneración computable S/ ${computable.toFixed(2)}`, cts);
  push("GRA", `Gratificación trunca (${gratiLabel})`, `S/ ${computable.toFixed(2)} × meses completos / 6`, grat);
  push("BON", "Bonificación extraordinaria", `Aporte de salud sobre la gratificación (${(gratuityBonusRate(emp.healthInsurance) * 100).toFixed(2)}%)`, bonif);
  push(
    "VAC",
    "Vacaciones truncas y no gozadas",
    `${vac.trunca.toFixed(2)} d truncas + ${vac.noGozadas.toFixed(2)} d no gozadas × S/ ${dailyRate.toFixed(2)}`,
    vacaciones,
  );

  const total = round2(cts + grat + bonif + vacaciones);

  // Depósitos y pagos previos ya realizados, solo como referencia informativa
  // (el marco legal pide mostrarlos sin sumarlos a la liquidación).
  const prevCts = previousCtsPeriod(asOf);
  const prevGrat = previousGratuityPeriod(asOf);
  const reference: LiquidationItem[] = [];
  const pushRef = (code: string, label: string, detail: string, amount: number) => {
    if (amount > 0.004) reference.push({ code, label, detail, amount: round2(amount) });
  };
  const ctsPrev = ctsSemester(empAt, company, prevCts.year, prevCts.which);
  const gratPrev = gratuityAmount(empAt, company, prevGrat.year, prevGrat.which);
  const ctsLabel = prevCts.which === "may" ? `mayo ${prevCts.year}` : `noviembre ${prevCts.year}`;
  const gratLabel = prevGrat.which === "julio" ? `Fiestas Patrias ${prevGrat.year}` : `Navidad ${prevGrat.year}`;
  pushRef("CTS-REF", `CTS depositada (${ctsLabel})`, "Depósito ya realizado en el período anterior", ctsPrev);
  pushRef("GRA-REF", `Gratificación pagada (${gratLabel})`, "Pago ya realizado en el semestre anterior", gratPrev.grat + gratPrev.bonif);

  return { asOf, regime, cts, gratificacion: grat, bonificacion: bonif, vacaciones, total, items, reference };
}
