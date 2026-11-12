/**
 * Hoja de liquidación de beneficios sociales para la "Calculadora".
 *
 * Reúne el cálculo de `liquidationOf` (CTS trunca, gratificación trunca con su
 * bonificación y vacaciones truncas y no gozadas) en las cuatro secciones del
 * modelo de la empresa: 1) CTS, 2) Gratificación y bono, 3) Vacaciones y
 * 4) Resumen con el descuento del aporte pensionario sobre las vacaciones.
 *
 * Módulo PURO (sin React ni base de datos): lo consumen la pantalla, el PDF y
 * las pruebas. Es referencial; la asesoría laboral valida cada caso.
 */

import { effectiveRegime } from "@/lib/hr/calc";
import { fullName, HOY, REGIME_LABEL, round2 } from "@/lib/hr/format";
import { liquidationOf } from "@/lib/hr/liquidacion";
import { numeroALetras } from "@/lib/hr/numbers";
import type { Company, Employee, Regime, TimeRequest } from "@/lib/hr/types";

export type SheetRow = {
  code: string;
  label: string;
  detail: string;
  amount: number;
};

export type SheetSection = {
  key: string;
  title: string;
  rows: SheetRow[];
  /** Suma de las filas que sí se pagan. */
  subtotal: number;
};

export type LiquidationSheet = {
  asOf: string;
  mode: "cese" | "simulacion";
  regime: Regime;
  regimeLabel: string;
  employeeName: string;
  dni: string;
  position: string;
  hireDate: string;
  sections: SheetSection[];
  /** Depósitos y pagos previos, solo como referencia informativa. */
  reference: SheetRow[];
  /** Suma de CTS + gratificación + bonificación + vacaciones. */
  gross: number;
  /** Descuento del aporte pensionario (ONP/AFP) sobre las vacaciones. */
  pensionDiscount: number;
  pensionRate: number;
  /** Neto a pagar al trabajador. */
  total: number;
  totalEnLetras: string;
};

/** Tasa del aporte pensionario del trabajador (ONP o AFP con su comisión). */
export function pensionRateOf(company: Company, emp: Employee): number {
  if (emp.pension === "ninguno") return 0;
  if (emp.pension === "onp") return company.onp;
  const comision = company.afpComision[emp.pension] ?? 0;
  return company.afpAporte + company.afpSeguro + comision;
}

/**
 * Arma la hoja de liquidación de un colaborador a una fecha. `mode` solo cambia
 * la etiqueta: "cese" para quien ya cesó y "simulacion" para proyectar el pago
 * de alguien activo. En ambos casos el cálculo se corta en `asOf`.
 */
export function liquidationSheet(
  emp: Employee,
  company: Company,
  requests: TimeRequest[] = [],
  asOf: string = (emp.endDate ?? "").slice(0, 10) || HOY,
  mode: "cese" | "simulacion" = emp.status === "cesado" ? "cese" : "simulacion",
): LiquidationSheet {
  const liq = liquidationOf(emp, company, requests, asOf);
  const regime = effectiveRegime(company, emp);

  const pick = (code: string): SheetRow[] =>
    liq.items
      .filter((it) => it.code === code)
      .map((it) => ({ code: it.code, label: it.label, detail: it.detail, amount: it.amount }));

  const cts = liq.cts;
  const grat = round2(liq.gratificacion + liq.bonificacion);
  const vac = liq.vacaciones;
  const gross = liq.total;

  const rate = regime === "practicante" ? 0 : pensionRateOf(company, emp);
  const pensionDiscount = round2(vac * rate);
  const total = round2(gross - pensionDiscount);

  const sections: SheetSection[] = [
    {
      key: "cts",
      title: "1. Compensación por Tiempo de Servicios (CTS) — período trunco",
      rows: pick("CTS"),
      subtotal: cts,
    },
    {
      key: "grati",
      title: "2. Gratificación trunca y bonificación extraordinaria",
      rows: [...pick("GRA"), ...pick("BON")],
      subtotal: grat,
    },
    {
      key: "vac",
      title: "3. Vacaciones truncas y no gozadas",
      rows: pick("VAC"),
      subtotal: vac,
    },
    {
      key: "resumen",
      title: "4. Resumen general de liquidación y descuentos de ley",
      rows: [
        { code: "SUB-CTS", label: "(+) Saldo neto CTS trunca", detail: "Sección 1", amount: cts },
        { code: "SUB-GRA", label: "(+) Saldo neto gratificación trunca + bono", detail: "Sección 2", amount: grat },
        { code: "SUB-VAC", label: "(+) Saldo neto vacaciones truncas", detail: "Sección 3", amount: vac },
        {
          code: "PEN",
          label: "(−) Aporte pensionario sobre vacaciones",
          detail: rate > 0 ? `${(rate * 100).toFixed(2)}% (ONP/AFP)` : "No aplica",
          amount: pensionDiscount,
        },
      ].filter((r) => Math.abs(r.amount) > 0.004),
      subtotal: total,
    },
  ];

  const reference: SheetRow[] = liq.reference.map((it) => ({
    code: it.code,
    label: it.label,
    detail: it.detail,
    amount: it.amount,
  }));

  return {
    asOf: liq.asOf,
    mode,
    regime,
    regimeLabel: REGIME_LABEL[regime],
    employeeName: fullName(emp),
    dni: emp.dni,
    position: emp.position,
    hireDate: emp.hireDate,
    sections,
    reference,
    gross,
    pensionDiscount,
    pensionRate: rate,
    total,
    totalEnLetras: numeroALetras(total),
  };
}
