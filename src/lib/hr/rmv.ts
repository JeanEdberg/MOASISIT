/**
 * Histórico de la Remuneración Mínima Vital (RMV) del Perú.
 *
 * La RMV se usa sobre todo para la asignación familiar (10%). Como las boletas
 * y beneficios se pueden generar para períodos pasados, el cálculo debe tomar
 * la RMV vigente en ese momento y no siempre la última.
 *
 * Cada cambio rige desde la fecha indicada (inclusive). Fuente: decretos
 * supremos del MTPE publicados en El Peruano. Mantener en orden ascendente.
 */
export type RmvChange = {
  /** Fecha desde la que rige (inclusive), en formato ISO `YYYY-MM-DD`. */
  from: string;
  /** Monto mensual en soles. */
  amount: number;
  /** Norma que fijó el monto (referencia). */
  note?: string;
};

export const RMV_HISTORY: readonly RmvChange[] = [
  { from: "1997-09-01", amount: 345 },
  { from: "2000-03-10", amount: 410 },
  { from: "2003-09-15", amount: 460 },
  { from: "2006-01-01", amount: 500 },
  { from: "2007-10-01", amount: 530 },
  { from: "2008-01-01", amount: 550 },
  { from: "2010-12-01", amount: 580, note: "D.S. 011-2010-TR" },
  { from: "2011-02-01", amount: 600, note: "D.S. 011-2010-TR" },
  { from: "2011-08-14", amount: 675, note: "D.S. 011-2011-TR" },
  { from: "2012-06-01", amount: 750, note: "D.S. 007-2012-TR" },
  { from: "2016-05-01", amount: 850, note: "D.S. 005-2016-TR" },
  { from: "2018-04-01", amount: 930, note: "D.S. 004-2018-TR" },
  { from: "2022-05-01", amount: 1025, note: "D.S. 003-2022-TR" },
  { from: "2025-01-01", amount: 1130, note: "D.S. 006-2024-TR" },
  { from: "2026-10-01", amount: 1230, note: "D.S. 009-2026-TR" },
];

/** RMV vigente más reciente (el último cambio de la serie). */
export const RMV_CURRENT = RMV_HISTORY[RMV_HISTORY.length - 1].amount;

/** Fecha desde la que rige la RMV vigente. */
export const RMV_CURRENT_FROM = RMV_HISTORY[RMV_HISTORY.length - 1].from;

/** RMV vigente en una fecha (`YYYY-MM-DD`). Antes del primer registro, el más antiguo. */
export function rmvForDate(iso: string): number {
  const day = String(iso).slice(0, 10);
  let amount = RMV_HISTORY[0].amount;
  for (const change of RMV_HISTORY) {
    if (day >= change.from) amount = change.amount;
    else break;
  }
  return amount;
}

/** RMV vigente en un período de planilla (`YYYY-MM`), evaluada al primer día del mes. */
export function rmvForPeriod(period: string): number {
  return rmvForDate(`${period.slice(0, 7)}-01`);
}
