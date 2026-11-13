/**
 * Histórico de cobertura de salud del colaborador.
 *
 * La cobertura de salud (EsSalud o EPS) define la bonificación extraordinaria
 * de la gratificación: 9% de la gratificación con EsSalud y 6.75% con EPS
 * (Ley 29351 / 30334). Como un colaborador puede pasar de EsSalud a EPS (o al
 * revés) a mitad de año, cada gratificación debe usar la cobertura vigente al
 * cierre de su semestre, y no la actual. `Employee.healthHistory` guarda los
 * cambios con su fecha; `Employee.healthInsurance` sigue siendo el vigente hoy.
 *
 * Módulo PURO (sin React ni base de datos), para probarlo sin servidor.
 */

import { todayIso } from "@/lib/hr/format";
import type { Employee, HealthChange, HealthInsurance } from "@/lib/hr/types";

/** Empleado con (o sin) histórico de cobertura: basta la cobertura actual como respaldo. */
type HealthCarrier = Pick<Employee, "healthInsurance" | "epsInsurerId"> & {
  healthHistory?: HealthChange[];
};

/** Cobertura vigente en una fecha: tipo de seguro y EPS (si aplica). */
export type HealthAt = {
  healthInsurance: HealthInsurance;
  epsInsurerId: string | null;
};

/** Histórico ordenado por fecha (sin tocar el original). */
export function sortedHealthHistory(emp: HealthCarrier): HealthChange[] {
  const history = emp.healthHistory ?? [];
  return [...history].sort((a, b) => a.from.localeCompare(b.from));
}

/**
 * Cobertura vigente en una fecha (`YYYY-MM-DD`): el cambio más reciente cuya
 * fecha sea menor o igual. Si la fecha es anterior a todos los cambios, usa el
 * más antiguo. Sin histórico, devuelve la cobertura actual.
 */
export function healthForDate(emp: HealthCarrier, iso: string): HealthAt {
  const history = sortedHealthHistory(emp);
  if (history.length === 0) {
    return { healthInsurance: emp.healthInsurance, epsInsurerId: emp.epsInsurerId };
  }
  const day = String(iso).slice(0, 10);
  let change = history[0];
  if (day >= history[0].from) {
    for (const c of history) {
      if (day >= c.from) change = c;
      else break;
    }
  }
  const healthInsurance = change.healthInsurance;
  // La EPS solo aplica con cobertura EPS; si el cambio no la precisa, se hereda
  // la registrada en la ficha (p. ej. al cambiar solo EsSalud → EPS del mismo año).
  const epsInsurerId =
    healthInsurance === "eps" ? change.epsInsurerId ?? emp.epsInsurerId ?? null : null;
  return { healthInsurance, epsInsurerId };
}

/** Cobertura vigente en un período de planilla (`YYYY-MM`), evaluada al primer día del mes. */
export function healthForPeriod(emp: HealthCarrier, period: string): HealthAt {
  return healthForDate(emp, `${period.slice(0, 7)}-01`);
}

/** Cobertura vigente hoy (la que se muestra como "cobertura actual"). */
export function currentHealth(emp: HealthCarrier, asOf: string = todayIso()): HealthAt {
  return healthForDate(emp, asOf);
}

/**
 * Deja el histórico listo para operar: lo ordena y, si falta, lo crea con la
 * cobertura de ingreso. Deja `healthInsurance`/`epsInsurerId` iguales al último
 * cambio (la cobertura vigente). Idempotente cuando ya está completo.
 */
export function reconcileHealth(emp: Employee): Employee {
  const history = emp.healthHistory;
  if (!history || history.length === 0) {
    return {
      ...emp,
      healthHistory: [
        {
          from: emp.hireDate,
          healthInsurance: emp.healthInsurance,
          epsInsurerId: emp.epsInsurerId,
        },
      ],
    };
  }
  const sorted = [...history].sort((a, b) => a.from.localeCompare(b.from));
  const last = sorted[sorted.length - 1];
  const same =
    sorted.length === history.length &&
    sorted.every(
      (c, i) =>
        c.from === history[i].from &&
        c.healthInsurance === history[i].healthInsurance &&
        (c.epsInsurerId ?? null) === (history[i].epsInsurerId ?? null),
    ) &&
    last.healthInsurance === emp.healthInsurance &&
    (last.epsInsurerId ?? null) === (emp.epsInsurerId ?? null);
  return same
    ? emp
    : { ...emp, healthHistory: sorted, healthInsurance: last.healthInsurance, epsInsurerId: last.epsInsurerId ?? null };
}

/**
 * Normaliza el histórico de cobertura de todos los colaboradores que aún no lo
 * tengan (datasets creados antes de esta función). Idempotente.
 */
export function withHealthHistory<T extends { employees: Employee[] }>(data: T): T {
  let changed = false;
  const employees = data.employees.map((e) => {
    const next = reconcileHealth(e);
    if (next !== e) changed = true;
    return next;
  });
  return changed ? { ...data, employees } : data;
}
