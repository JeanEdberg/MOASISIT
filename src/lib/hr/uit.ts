/**
 * Histórico de la Unidad Impositiva Tributaria (UIT) del Perú.
 *
 * La UIT se usa en la retención de renta de quinta categoría (deducción fija de
 * 7 UIT y los tramos de la escala). Cambia cada 1 de enero, así que una boleta
 * de un año anterior debe usar la UIT de ese año y no la última.
 *
 * Fuente: SUNAT (Índices y tasas – UIT) y MEF (Valor de la UIT 1992–2024).
 * Cada año rige desde el 1 de enero. Mantener en orden ascendente.
 */
export type UitYear = {
  /** Año al que corresponde (rige desde el 1 de enero). */
  year: number;
  /** Valor en soles. */
  amount: number;
  /** Norma que lo fijó (referencia). */
  note?: string;
};

export const UIT_HISTORY: readonly UitYear[] = [
  { year: 1992, amount: 1040 },
  { year: 1993, amount: 1350 },
  { year: 1994, amount: 1700 },
  { year: 1995, amount: 2000 },
  { year: 1996, amount: 2200 },
  { year: 1997, amount: 2400 },
  { year: 1998, amount: 2600 },
  { year: 1999, amount: 2800 },
  { year: 2000, amount: 2900 },
  { year: 2001, amount: 3000 },
  { year: 2002, amount: 3100 },
  { year: 2003, amount: 3100 },
  { year: 2004, amount: 3200 },
  { year: 2005, amount: 3300 },
  { year: 2006, amount: 3400 },
  { year: 2007, amount: 3450 },
  { year: 2008, amount: 3500 },
  { year: 2009, amount: 3550 },
  { year: 2010, amount: 3600 },
  { year: 2011, amount: 3600 },
  { year: 2012, amount: 3650 },
  { year: 2013, amount: 3700 },
  { year: 2014, amount: 3800 },
  { year: 2015, amount: 3850 },
  { year: 2016, amount: 3950, note: "D.S. 397-2015-EF" },
  { year: 2017, amount: 4050, note: "D.S. 353-2016-EF" },
  { year: 2018, amount: 4150, note: "D.S. 380-2017-EF" },
  { year: 2019, amount: 4200, note: "D.S. 298-2018-EF" },
  { year: 2020, amount: 4300, note: "D.S. 380-2019-EF" },
  { year: 2021, amount: 4400, note: "D.S. 392-2020-EF" },
  { year: 2022, amount: 4600, note: "D.S. 398-2021-EF" },
  { year: 2023, amount: 4950, note: "D.S. 309-2022-EF" },
  { year: 2024, amount: 5150, note: "D.S. 309-2023-EF" },
  { year: 2025, amount: 5350, note: "D.S. 260-2024-EF" },
  { year: 2026, amount: 5500, note: "D.S. 301-2025-EF" },
];

/** UIT vigente más reciente (el último año de la serie). */
export const UIT_CURRENT = UIT_HISTORY[UIT_HISTORY.length - 1].amount;

/** Año de la UIT vigente más reciente. */
export const UIT_CURRENT_YEAR = UIT_HISTORY[UIT_HISTORY.length - 1].year;

/** UIT vigente en un año. Antes del primer registro, la más antigua. */
export function uitForYear(year: number): number {
  if (!Number.isFinite(year) || year <= UIT_HISTORY[0].year) return UIT_HISTORY[0].amount;
  let amount = UIT_HISTORY[0].amount;
  for (const entry of UIT_HISTORY) {
    if (year >= entry.year) amount = entry.amount;
    else break;
  }
  return amount;
}

/** UIT vigente en un período de planilla (`YYYY-MM`). */
export function uitForPeriod(period: string): number {
  return uitForYear(Number(String(period).slice(0, 4)));
}

/** UIT vigente en una fecha (`YYYY-MM-DD`). */
export function uitForDate(iso: string): number {
  return uitForYear(Number(String(iso).slice(0, 4)));
}
