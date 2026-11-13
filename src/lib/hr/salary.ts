/**
 * Histórico de remuneraciones del colaborador.
 *
 * El sueldo puede subir (o cambiar) durante el vínculo laboral. Como las boletas
 * y los beneficios se calculan por período, cada cálculo debe usar el sueldo que
 * regía en esa fecha y no el último. `Employee.salaryHistory` guarda los cambios
 * con su fecha; `Employee.salary` sigue siendo el sueldo vigente hoy.
 *
 * Módulo PURO (sin React ni base de datos), para probarlo sin servidor.
 */

import { todayIso } from "@/lib/hr/format";
import type { Employee, SalaryChange } from "@/lib/hr/types";

/** Empleado con (o sin) histórico de sueldos: basta el sueldo actual como respaldo. */
type SalaryCarrier = Pick<Employee, "salary"> & { salaryHistory?: SalaryChange[] };

/** Histórico ordenado por fecha (sin tocar el original). */
export function sortedSalaryHistory(emp: SalaryCarrier): SalaryChange[] {
  const history = emp.salaryHistory ?? [];
  return [...history].sort((a, b) => a.from.localeCompare(b.from));
}

/**
 * Sueldo vigente en una fecha (`YYYY-MM-DD`): el cambio más reciente cuya fecha
 * sea menor o igual. Si la fecha es anterior a todos los cambios, usa el más
 * antiguo. Sin histórico, devuelve `emp.salary`.
 */
export function salaryForDate(emp: SalaryCarrier, iso: string): number {
  const history = sortedSalaryHistory(emp);
  if (history.length === 0) return emp.salary;
  const day = String(iso).slice(0, 10);
  if (day < history[0].from) return history[0].salary;
  let amount = history[0].salary;
  for (const change of history) {
    if (day >= change.from) amount = change.salary;
    else break;
  }
  return amount;
}

/** Sueldo vigente en un período de planilla (`YYYY-MM`), evaluado al primer día del mes. */
export function salaryForPeriod(emp: SalaryCarrier, period: string): number {
  return salaryForDate(emp, `${period.slice(0, 7)}-01`);
}

/** Sueldo vigente hoy (el que se muestra como "sueldo actual"). */
export function currentSalary(emp: SalaryCarrier, asOf: string = todayIso()): number {
  return salaryForDate(emp, asOf);
}

/**
 * Deja el histórico listo para operar: lo ordena y, si falta, lo crea con el
 * sueldo de ingreso. Deja `salary` igual al último cambio (el sueldo vigente).
 * Idempotente cuando ya está completo.
 */
export function reconcileSalary(emp: Employee): Employee {
  const history = emp.salaryHistory;
  if (!history || history.length === 0) {
    return { ...emp, salaryHistory: [{ from: emp.hireDate, salary: emp.salary }] };
  }
  const sorted = [...history].sort((a, b) => a.from.localeCompare(b.from));
  const current = sorted[sorted.length - 1].salary;
  const same =
    sorted.length === history.length &&
    sorted.every((c, i) => c.from === history[i].from && c.salary === history[i].salary) &&
    current === emp.salary;
  return same ? emp : { ...emp, salaryHistory: sorted, salary: current };
}

/**
 * Normaliza el histórico de sueldos de todos los colaboradores que aún no lo
 * tengan (datasets creados antes de esta función). Idempotente.
 */
export function withSalaryHistory<T extends { employees: Employee[] }>(data: T): T {
  let changed = false;
  const employees = data.employees.map((e) => {
    const next = reconcileSalary(e);
    if (next !== e) changed = true;
    return next;
  });
  return changed ? { ...data, employees } : data;
}
