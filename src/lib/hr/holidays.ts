/**
 * Feriados nacionales del Perú (Decreto Legislativo 713) y utilidades de
 * calendario laboral.
 *
 * Los feriados de fecha fija se declaran una sola vez; los movibles (Jueves y
 * Viernes Santo) se derivan del Domingo de Pascua. Así el módulo sirve para
 * cualquier año sin mantenimiento manual: al cambiar de año los feriados se
 * recalculan solos.
 *
 * Módulo PURO (sin React ni base de datos), para poder probarlo sin servidor.
 */

export type Holiday = { date: string; name: string };

/** Feriados de fecha fija: [mes, día, nombre]. */
const FIXED_HOLIDAYS: [number, number, string][] = [
  [1, 1, "Año Nuevo"],
  [5, 1, "Día del Trabajo"],
  [6, 7, "Batalla de Arica y Día de la Bandera"],
  [6, 29, "San Pedro y San Pablo"],
  [7, 23, "Día de la Fuerza Aérea del Perú"],
  [7, 28, "Fiestas Patrias"],
  [7, 29, "Fiestas Patrias"],
  [8, 6, "Batalla de Junín"],
  [8, 30, "Santa Rosa de Lima"],
  [10, 8, "Combate de Angamos"],
  [11, 1, "Todos los Santos"],
  [12, 8, "Inmaculada Concepción"],
  [12, 9, "Batalla de Ayacucho"],
  [12, 25, "Navidad"],
];

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Domingo de Pascua (algoritmo de Gauss/Meeus, calendario gregoriano). */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function shiftIso(base: Date, days: number): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** Todos los feriados nacionales de un año, ordenados por fecha. */
export function holidaysForYear(year: number): Holiday[] {
  const easter = easterSunday(year);
  const movable: Holiday[] = [
    { date: shiftIso(easter, -3), name: "Jueves Santo" },
    { date: shiftIso(easter, -2), name: "Viernes Santo" },
  ];
  const fixed: Holiday[] = FIXED_HOLIDAYS.map(([m, d, name]) => ({ date: iso(year, m, d), name }));
  return [...fixed, ...movable].sort((a, b) => a.date.localeCompare(b.date));
}

/** Feriados de un año indexados por fecha (`YYYY-MM-DD`) → nombre. */
export function holidayMap(year: number): Map<string, string> {
  return new Map(holidaysForYear(year).map((h) => [h.date, h.name]));
}

/** Año de una fecha `YYYY-MM-DD` (o de un período `YYYY-MM`). */
function yearOf(isoDate: string): number {
  return Number(String(isoDate).slice(0, 4));
}

/** Nombre del feriado si la fecha es feriado nacional, o null. */
export function holidayName(isoDate: string): string | null {
  return holidayMap(yearOf(isoDate)).get(isoDate) ?? null;
}

/** ¿La fecha es un feriado nacional? */
export function isHoliday(isoDate: string): boolean {
  return holidayName(isoDate) !== null;
}

/** ¿La fecha cae domingo? */
export function isSunday(isoDate: string): boolean {
  const [y, m, d] = String(isoDate).slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay() === 0;
}

/**
 * ¿La fecha es día de descanso obligatorio? (domingo o feriado nacional).
 * Trabajarlo sin descanso sustitutorio genera el pago con recargo del 100%.
 */
export function isRestDay(isoDate: string): boolean {
  return isSunday(isoDate) || isHoliday(isoDate);
}
