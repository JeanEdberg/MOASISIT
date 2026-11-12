import { differenceInCalendarDays } from "date-fns";
import { ctsSemester, gratuityAmount, vacationBalance, vacationPending, vacationTaken } from "@/lib/hr/calc";
import { todayIso, parseDay, periodLabel } from "@/lib/hr/format";
import { subscriptionAlert, subscriptionOf, type SubscriptionAlert } from "@/lib/hr/subscription";
import type { Attendance, Company, Employee, Payslip, TimeRequest } from "@/lib/hr/types";

/**
 * Métricas del dashboard, separadas de los componentes de interfaz.
 *
 * Todo es PURO: recibe el dataset (ya filtrado por rol) y devuelve números y
 * listas listas para pintar. Así el dashboard de cada rol se prueba sin montar
 * React y la UI no repite lógica de negocio.
 */

export type AttendanceSummary = {
  presente: number;
  tardanza: number;
  falta: number;
  remoto: number;
  extraHours: number;
  total: number;
};

/** Resume las marcaciones de un conjunto de colaboradores en un periodo (YYYY-MM). */
export function attendanceSummary(marks: Attendance[], period: string): AttendanceSummary {
  const ofPeriod = marks.filter((m) => m.date.startsWith(period));
  return {
    presente: ofPeriod.filter((m) => m.kind === "presente").length,
    tardanza: ofPeriod.filter((m) => m.kind === "tardanza").length,
    falta: ofPeriod.filter((m) => m.kind === "falta").length,
    remoto: ofPeriod.filter((m) => m.kind === "remoto").length,
    extraHours: ofPeriod.reduce((s, m) => s + m.extra25 + m.extra35, 0),
    total: ofPeriod.length,
  };
}

export type PayrollTotals = {
  gross: number;
  net: number;
  discounts: number;
  fifth: number;
  count: number;
};

/** Suma los totales de un conjunto de boletas. */
export function payrollTotals(slips: Payslip[]): PayrollTotals {
  return slips.reduce<PayrollTotals>(
    (acc, p) => ({
      gross: acc.gross + p.gross,
      net: acc.net + p.net,
      discounts: acc.discounts + p.discounts,
      fifth: acc.fifth + p.fifth,
      count: acc.count + 1,
    }),
    { gross: 0, net: 0, discounts: 0, fifth: 0, count: 0 },
  );
}

export type CompanyHeadcount = {
  company: Company;
  active: number;
  total: number;
};

/** Cantidad de colaboradores por empresa (consolidado del superadmin). */
export function headcountByCompany(companies: Company[], employees: Employee[]): CompanyHeadcount[] {
  return companies.map((company) => {
    const people = employees.filter((e) => e.companyId === company.id);
    return {
      company,
      active: people.filter((e) => e.status === "activo").length,
      total: people.length,
    };
  });
}

export type ExpiringContract = { employee: Employee; days: number };

/** Contratos que vencen dentro de `windowDays` (inclusive hoy). */
export function contractsExpiring(employees: Employee[], windowDays = 120, today = todayIso()): ExpiringContract[] {
  return employees
    .filter((e) => e.status === "activo" && e.endDate)
    .map((e) => ({ employee: e, days: differenceInCalendarDays(parseDay(e.endDate as string), parseDay(today)) }))
    .filter((x) => x.days >= 0 && x.days <= windowDays)
    .sort((a, b) => a.days - b.days);
}

export type CompanyAlert = { company: Company; alert: SubscriptionAlert };

/** Alertas de suscripción de todas las empresas (vencidas o por vencer). */
export function subscriptionAlerts(companies: Company[], today = todayIso()): CompanyAlert[] {
  return companies
    .map((company) => ({ company, alert: subscriptionAlert(subscriptionOf(company), today) }))
    .filter((x) => x.alert.level !== "ok")
    .sort((a, b) => a.alert.daysLeft - b.alert.daysLeft);
}

export type VacationSummary = {
  balanceDays: number;
  takenDays: number;
  pendingDays: number;
  pendingRequests: number;
};

/** Resumen de vacaciones de un conjunto de colaboradores. */
export function vacationSummary(people: Employee[], requests: TimeRequest[], company?: Company): VacationSummary {
  const ids = new Set(people.map((e) => e.id));
  const mine = requests.filter((r) => ids.has(r.employeeId));
  return {
    balanceDays: people.reduce((s, e) => s + vacationBalance(e, requests, todayIso(), company), 0),
    takenDays: people.reduce((s, e) => s + vacationTaken(e, requests), 0),
    pendingDays: people.reduce((s, e) => s + vacationPending(e, requests), 0),
    pendingRequests: mine.filter((r) => r.status === "pendiente").length,
  };
}

export type BenefitsProjection = {
  /** CTS del semestre en curso (mayo–octubre) o del próximo cierre. */
  cts: number;
  ctsSemester: "may" | "nov";
  ctsDeadline: string;
  /** Gratificación del cierre más próximo (julio o navidad). */
  gratuity: number;
  gratuityKind: "julio" | "navidad";
  gratuityDeadline: string;
};

/**
 * Proyección de beneficios sociales del colaborador: CTS del semestre y la
 * gratificación del cierre más próximo, con la fecha límite de depósito/pago.
 */
export function benefitsProjection(employee: Employee, company: Company, year: number, month: number): BenefitsProjection {
  // CTS: se deposita en mayo (semestre nov–abr) y noviembre (semestre may–oct).
  const ctsWhich: "may" | "nov" = month >= 5 && month <= 10 ? "nov" : "may";
  const cts = ctsSemester(employee, company, year, ctsWhich);
  const ctsDeadline = ctsWhich === "nov" ? `${year}-11-15` : `${year + (month > 10 ? 1 : 0)}-05-15`;

  // Gratificación: julio (enero–junio) y navidad (julio–diciembre).
  const gratWhich: "julio" | "navidad" = month >= 7 && month <= 11 ? "navidad" : "julio";
  const { grat, bonif } = gratuityAmount(employee, company, year, gratWhich);
  const gratuityDeadline = gratWhich === "navidad" ? `${year}-12-15` : `${year}-07-15`;

  return {
    cts,
    ctsSemester: ctsWhich,
    ctsDeadline,
    gratuity: grat + bonif,
    gratuityKind: gratWhich,
    gratuityDeadline,
  };
}

/** Personas que cumplen años en el mes indicado (1–12). */
export function birthdaysInMonth(employees: Employee[], month: number): Employee[] {
  const mm = String(month).padStart(2, "0");
  return employees.filter((e) => e.birthDate.slice(5, 7) === mm);
}

/** Etiqueta corta de un periodo (YYYY-MM) reutilizando el formato del producto. */
export function dashboardPeriodLabel(period: string): string {
  return periodLabel(period);
}
