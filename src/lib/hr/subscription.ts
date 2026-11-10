/**
 * Suscripción mensual de cada empresa y su facturación.
 *
 * Módulo PURO (sin base de datos ni React): recibe fechas y montos y devuelve
 * el prorrateo del primer cobro y la alerta de vencimiento. Así se prueba sin
 * tocar el servidor y el superadmin ve siempre el mismo cálculo.
 *
 * Regla de cobro: la fecha de pago es un día fijo del mes (por defecto el
 * último día). Si la empresa se da de alta a mitad de mes, el primer cobro se
 * prorratea por los días usados; desde el mes siguiente se cobra el mes
 * completo. `paidUntil` es la fecha de vencimiento: el día en que corresponde
 * el próximo cobro.
 */

import { differenceInCalendarDays } from "date-fns";
import { inclusiveDays, isoDay, parseDay } from "@/lib/hr/format";
import type { HrData, Subscription, SubscriptionStatus } from "@/lib/hr/types";

export type { Subscription, SubscriptionStatus };

export const DEFAULT_SUBSCRIPTION: Subscription = {
  monthlyPrice: 0,
  billingDay: null,
  startDate: null,
  paidUntil: null,
  status: "activa",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  activa: "Activa",
  cancelada: "Cancelada",
};

/** La suscripción de una empresa, completando lo que falte con los valores por defecto. */
export function subscriptionOf(company: { subscription?: Subscription }): Subscription {
  return { ...DEFAULT_SUBSCRIPTION, ...company.subscription };
}

/**
 * Completa la suscripción de cada empresa que aún no la tenga (datasets creados
 * antes de esta función). Idempotente: si ya están todas, devuelve el mismo
 * objeto para no forzar un guardado.
 */
export function withSubscriptions(data: HrData): HrData {
  let changed = false;
  const companies = data.companies.map((c) => {
    if (c.subscription) return c;
    changed = true;
    return { ...c, subscription: { ...DEFAULT_SUBSCRIPTION } };
  });
  if (!changed) return data;
  const company = companies.find((c) => c.id === data.company.id) ?? data.company;
  return { ...data, companies, company };
}

/** Cantidad de días del mes de una fecha ISO. */
export function daysInMonth(iso: string): number {
  const d = parseDay(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Último día del mes de una fecha ISO. */
export function lastDayOfMonth(iso: string): string {
  const d = parseDay(iso);
  return isoDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

/**
 * Fecha de cobro dentro del mes de `iso`. Si `billingDay` es `null` usa el
 * último día; si el día pedido no existe en el mes (p. ej. 31 en febrero) lo
 * ajusta al último día.
 */
export function chargeDateInMonth(iso: string, billingDay: number | null): string {
  const d = parseDay(iso);
  const dim = daysInMonth(iso);
  const day = billingDay == null ? dim : Math.min(Math.max(1, Math.round(billingDay)), dim);
  return isoDay(new Date(d.getFullYear(), d.getMonth(), day));
}

/** Primer día de cobro en `from` o después (incluye el mismo día). */
export function nextChargeDate(from: string, billingDay: number | null): string {
  const thisMonth = chargeDateInMonth(from, billingDay);
  if (thisMonth >= from) return thisMonth;
  const d = parseDay(from);
  const nextMonth = isoDay(new Date(d.getFullYear(), d.getMonth() + 1, 15));
  return chargeDateInMonth(nextMonth, billingDay);
}

/** Día de cobro siguiente, estrictamente después de `from`. */
export function followingChargeDate(from: string, billingDay: number | null): string {
  const d = parseDay(from);
  const nextMonth = isoDay(new Date(d.getFullYear(), d.getMonth() + 1, 15));
  return chargeDateInMonth(nextMonth, billingDay);
}

export type Proration = {
  /** Fecha del primer cobro. */
  chargeDate: string;
  /** Días que cubre el primer cobro (desde el alta hasta el día de cobro). */
  daysCharged: number;
  /** Días del mes del alta. */
  daysInMonth: number;
  /** Monto del primer cobro. */
  amount: number;
  /** Monto de un mes completo. */
  monthly: number;
  /** true = el primer cobro es parcial; false = mes completo. */
  prorated: boolean;
};

/**
 * Primer cobro prorrateado. Cubre desde la fecha de alta hasta la fecha de
 * cobro (ambas incluidas). Ej.: alta el 18 y cobro el 30 → 13 de 30 días.
 */
export function prorateFirstCharge(
  monthlyPrice: number,
  startDate: string,
  billingDay: number | null,
): Proration {
  const monthly = Math.max(0, monthlyPrice);
  const chargeDate = nextChargeDate(startDate, billingDay);
  const dim = daysInMonth(startDate);
  const daysCharged = inclusiveDays(startDate, chargeDate);
  // Mes completo si el alta cae el propio día de cobro, si el periodo cruza de
  // mes o si cubre todo el mes.
  const prorated = daysCharged < dim && chargeDate !== startDate;
  const amount = prorated ? Math.round(monthly * (daysCharged / dim) * 100) / 100 : monthly;
  return { chargeDate, daysCharged, daysInMonth: dim, amount, monthly, prorated };
}

export type AlertLevel = "ok" | "warn" | "danger";

export type SubscriptionAlert = {
  level: AlertLevel;
  /** Días hasta el vencimiento del periodo pagado. Negativo = vencida. */
  daysLeft: number;
  /** Fecha del próximo cobro (o de regularización si ya venció). */
  nextCharge: string | null;
  title: string;
  detail: string;
};

const WARN_DAYS = 7;

/**
 * Alerta de vencimiento: avisa cuando el periodo pagado está por terminar o ya
 * terminó. `today` se pasa explícito para poder probarla.
 */
export function subscriptionAlert(sub: Subscription, today: string): SubscriptionAlert {
  if (sub.status === "cancelada") {
    return {
      level: "warn",
      daysLeft: 0,
      nextCharge: null,
      title: "Suscripción cancelada",
      detail: "Esta empresa ya no se cobra. Reactívala cuando quieras volver a facturarla.",
    };
  }

  const base = sub.paidUntil ?? sub.startDate;
  if (!base) {
    return {
      level: "warn",
      daysLeft: 0,
      nextCharge: null,
      title: "Suscripción sin fecha de alta",
      detail: "Define la fecha de alta y hasta cuándo está pagada para poder avisarte del vencimiento.",
    };
  }

  const daysLeft = differenceInCalendarDays(parseDay(base), parseDay(today));
  const nextCharge = base;

  if (daysLeft < 0) {
    const n = Math.abs(daysLeft);
    return {
      level: "danger",
      daysLeft,
      nextCharge,
      title: `Suscripción vencida hace ${n} ${n === 1 ? "día" : "días"}`,
      detail: "El periodo pagado ya terminó. Registra el cobro o cancela la suscripción para dejar de facturarla.",
    };
  }
  if (daysLeft === 0) {
    return {
      level: "warn",
      daysLeft,
      nextCharge,
      title: "La suscripción vence hoy",
      detail: "Hoy termina el periodo pagado. Corresponde el cobro del mes.",
    };
  }
  if (daysLeft <= WARN_DAYS) {
    return {
      level: "warn",
      daysLeft,
      nextCharge,
      title: `La suscripción vence en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}`,
      detail: "Se acerca la fecha de cobro. Prepara la renovación o avisa a la empresa.",
    };
  }
  return {
    level: "ok",
    daysLeft,
    nextCharge,
    title: `Suscripción al día (${daysLeft} días)`,
    detail: "El periodo pagado sigue vigente. El próximo cobro se calcula solo.",
  };
}
