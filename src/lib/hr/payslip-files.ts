import { todayIso, uid } from "@/lib/hr/format";
import type { EmployeePayslipFile } from "@/lib/hr/types";

/**
 * Boletas de pago anteriores cargadas por RR.HH. Módulo PURO: agrega, reemplaza
 * y ordena la lista de archivos de un colaborador sin tocar la base de datos, de
 * modo que se pueda probar sin el servidor.
 *
 * Regla: una boleta por periodo. Si se sube otra del mismo mes, reemplaza a la
 * anterior (así corregir un archivo no deja duplicados).
 */

/** Valida el periodo `YYYY-MM`. */
export function isValidPeriod(period: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}

/** Boletas de un colaborador, ordenadas del mes más reciente al más antiguo. */
export function payslipFilesOf(emp: Pick<{ payslipFiles?: EmployeePayslipFile[] }, "payslipFiles">): EmployeePayslipFile[] {
  return [...(emp.payslipFiles ?? [])].sort((a, b) => b.period.localeCompare(a.period));
}

/**
 * Agrega (o reemplaza) la boleta de un periodo. Devuelve la lista nueva, sin
 * mutar la original. `uploadedAt` por defecto es hoy.
 */
export function addPayslipFile(
  files: EmployeePayslipFile[] | undefined,
  input: { period: string; name: string; dataUrl: string; uploadedAt?: string },
): EmployeePayslipFile[] {
  const period = input.period.slice(0, 7);
  const next = (files ?? []).filter((f) => f.period !== period);
  next.push({
    id: uid("bp"),
    period,
    name: input.name,
    dataUrl: input.dataUrl,
    uploadedAt: (input.uploadedAt ?? todayIso()).slice(0, 10),
  });
  return next.sort((a, b) => b.period.localeCompare(a.period));
}

/** Quita la boleta de un periodo (o por id). Devuelve la lista nueva. */
export function removePayslipFile(
  files: EmployeePayslipFile[] | undefined,
  key: { id?: string; period?: string },
): EmployeePayslipFile[] {
  return (files ?? []).filter((f) => (key.id ? f.id !== key.id : f.period !== key.period));
}
