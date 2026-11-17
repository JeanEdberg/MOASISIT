/**
 * Adicionales: conceptos que se pagan APARTE de la planilla (no afectan AFP/ONP,
 * quinta categoría, EsSalud, CTS ni gratificación).
 *
 * - Horas extra 25% / 35%: de las marcaciones (`extra25`/`extra35`).
 * - Tardanzas: descuento por minutos de ingreso posteriores al horario oficial.
 * - Feriados y domingos trabajados: se detectan solos desde la marcación. Si el
 *   colaborador marca asistencia un domingo o feriado, se pagan las horas
 *   marcadas con recargo del 100% (D.S. 007-2002-TR): medio día = 1 sueldo
 *   diario; día completo = 2 sueldos diarios.
 * - Comisiones y bonos: se registran a mano por período (0 si están vacíos).
 *
 * Módulo PURO (sin React ni base de datos), para poder probarlo sin servidor.
 */

import { round2 } from "@/lib/hr/format";
import { holidayName, isRestDay, isSunday } from "@/lib/hr/holidays";
import { salaryForPeriod } from "@/lib/hr/salary";
import type { AdditionalEntry, Attendance, Employee } from "@/lib/hr/types";

/** Horario oficial de ingreso (08:00) y tolerancia de 15 minutos. */
const OFFICIAL_START_MIN = 8 * 60;
const TOLERANCE_IN_MIN = 15;
/** Jornada completa: tope de horas para el pago de feriado/domingo (2 sueldos diarios). */
const FULL_DAY_HOURS = 8;

/** Marcaciones que cuentan como día trabajado (no falta ni licencia ni vacaciones). */
const WORKED_KINDS = new Set<Attendance["kind"]>(["presente", "remoto", "tardanza"]);

export type RestDayWork = {
  date: string;
  /** "Domingo" o el nombre del feriado. */
  label: string;
  hours: number;
  pay: number;
};

export type AdditionalRow = {
  employeeId: string;
  period: string;
  extra25Hours: number;
  extra35Hours: number;
  extra25Pay: number;
  extra35Pay: number;
  /** Total por horas extra (25% + 35%). */
  extraPay: number;
  /** Minutos de tardanza acumulados en el mes. */
  lateMinutes: number;
  /** Descuento por tardanzas (monto positivo). */
  lateDiscount: number;
  /** Domingos y feriados trabajados, con su pago. */
  restDays: RestDayWork[];
  /** Total por feriados/domingos. */
  holidayPay: number;
  commission: number;
  bonus: number;
  /** Suma de todo lo que se paga: extra + feriados + comisión + bono. */
  grossAdditions: number;
  /** Neto de Adicionales: lo que se paga menos el descuento por tardanzas. */
  total: number;
};

function minutesOf(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm ?? ""));
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

/** Horas trabajadas según las marcas de ingreso/salida (tope = jornada completa). */
function workedHours(mark: Attendance): number {
  const a = minutesOf(mark.checkIn);
  const b = minutesOf(mark.checkOut);
  if (a === null || b === null || b <= a) return 0;
  return Math.min(FULL_DAY_HOURS, (b - a) / 60);
}

/** Etiqueta de un día de descanso: el feriado manda sobre el domingo. */
function restLabel(isoDate: string): string {
  return holidayName(isoDate) ?? (isSunday(isoDate) ? "Domingo" : "Descanso");
}

/** Busca la comisión y el bono registrados para un colaborador y período. */
export function entryFor(
  entries: AdditionalEntry[] | undefined,
  employeeId: string,
  period: string,
): AdditionalEntry | null {
  return entries?.find((e) => e.employeeId === employeeId && e.period === period) ?? null;
}

/** Calcula los Adicionales de un colaborador en un período. */
export function calcAdditional(
  emp: Employee,
  period: string,
  attendance: Attendance[],
  entries: AdditionalEntry[] | undefined,
): AdditionalRow {
  const salary = salaryForPeriod(emp, period);
  const hourly = salary / 30 / 8;
  const marks = attendance.filter((a) => a.employeeId === emp.id && a.date.startsWith(period));

  let extra25Hours = 0;
  let extra35Hours = 0;
  let lateMinutes = 0;
  const restDays: RestDayWork[] = [];

  for (const m of marks) {
    if (isRestDay(m.date)) {
      if (!WORKED_KINDS.has(m.kind)) continue;
      const hours = workedHours(m);
      if (hours <= 0) continue;
      // Recargo del 100%: las horas trabajadas se pagan al doble.
      const pay = round2(hourly * hours * 2);
      restDays.push({ date: m.date, label: restLabel(m.date), hours: round2(hours), pay });
      continue;
    }
    extra25Hours += m.extra25 || 0;
    extra35Hours += m.extra35 || 0;
    if (m.kind === "tardanza") {
      const inMin = minutesOf(m.checkIn);
      if (inMin !== null && inMin > OFFICIAL_START_MIN + TOLERANCE_IN_MIN) {
        lateMinutes += inMin - OFFICIAL_START_MIN;
      }
    }
  }

  const extra25Pay = round2(hourly * 1.25 * extra25Hours);
  const extra35Pay = round2(hourly * 1.35 * extra35Hours);
  const extraPay = round2(extra25Pay + extra35Pay);
  const lateDiscount = round2((hourly / 60) * lateMinutes);
  const holidayPay = round2(restDays.reduce((s, d) => s + d.pay, 0));
  const entry = entryFor(entries, emp.id, period);
  const commission = round2(Math.max(0, entry?.commission ?? 0));
  const bonus = round2(Math.max(0, entry?.bonus ?? 0));
  const grossAdditions = round2(extraPay + holidayPay + commission + bonus);

  restDays.sort((a, b) => a.date.localeCompare(b.date));

  return {
    employeeId: emp.id,
    period,
    extra25Hours: round2(extra25Hours),
    extra35Hours: round2(extra35Hours),
    extra25Pay,
    extra35Pay,
    extraPay,
    lateMinutes,
    lateDiscount,
    restDays,
    holidayPay,
    commission,
    bonus,
    grossAdditions,
    total: round2(grossAdditions - lateDiscount),
  };
}

/** Adicionales de un conjunto de colaboradores en un período. */
export function calcAdditionals(
  employees: Employee[],
  period: string,
  attendance: Attendance[],
  entries: AdditionalEntry[] | undefined,
): AdditionalRow[] {
  return employees.map((e) => calcAdditional(e, period, attendance, entries));
}

/** Totales del período, para el resumen de la vista. */
export function additionalTotals(rows: AdditionalRow[]) {
  const sum = (fn: (r: AdditionalRow) => number) => round2(rows.reduce((s, r) => s + fn(r), 0));
  return {
    extraPay: sum((r) => r.extraPay),
    lateDiscount: sum((r) => r.lateDiscount),
    holidayPay: sum((r) => r.holidayPay),
    commission: sum((r) => r.commission),
    bonus: sum((r) => r.bonus),
    grossAdditions: sum((r) => r.grossAdditions),
    total: sum((r) => r.total),
  };
}
