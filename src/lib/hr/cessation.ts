/**
 * Cese y reincorporación de un colaborador.
 *
 * Módulo PURO (sin React ni base de datos). El cese cierra el vínculo: marca la
 * ficha como cesada, bloquea su acceso y guarda un registro en el histórico.
 * La reincorporación abre un periodo nuevo (fecha de ingreso nueva) sin borrar
 * el histórico, para conservar la trazabilidad de fin de contrato y nuevo
 * inicio.
 */

import { todayIso } from "@/lib/hr/format";
import type { CessationRecord, Employee } from "@/lib/hr/types";

/** Motivos de cese frecuentes, para el selector del formulario. */
export const CESSATION_REASONS = [
  "Renuncia voluntaria",
  "Fin de contrato",
  "Despido justificado",
  "Mutuo disenso",
  "Jubilación",
  "Fallecimiento",
  "Otro",
] as const;

export type CessationReason = (typeof CESSATION_REASONS)[number];

export type CessationInput = {
  /** Fecha de cese (ISO). Si falta, se usa hoy. */
  endDate?: string;
  reason?: string;
  /** Fecha en que se registra (ISO). Por defecto, hoy. */
  registeredAt?: string;
};

/** Histórico de ceses del colaborador (nunca undefined). */
export function cessationsOf(emp: Pick<Employee, "cessations">): CessationRecord[] {
  return emp.cessations ?? [];
}

/**
 * Parche para cesar a un colaborador: marca el estado, fija la fecha de fin y
 * agrega el registro al histórico. No toca `hireDate`, que se conserva como el
 * inicio del periodo vigente.
 */
export function ceaseEmployee(emp: Employee, input: CessationInput = {}): Partial<Employee> {
  const endDate = (input.endDate ?? emp.endDate ?? todayIso()).slice(0, 10);
  const record: CessationRecord = {
    endDate,
    reason: (input.reason ?? "Fin de contrato").trim(),
    registeredAt: (input.registeredAt ?? todayIso()).slice(0, 10),
  };
  return {
    status: "cesado",
    endDate,
    cessations: [...cessationsOf(emp), record],
  };
}

export type RehireInput = {
  /** Nueva fecha de ingreso (ISO). Si falta, se usa hoy. */
  hireDate?: string;
};

/**
 * Parche para reincorporar a un colaborador: lo reactiva con una fecha de
 * ingreso nueva y limpia la fecha de fin del periodo anterior. El histórico de
 * ceses se conserva íntegro.
 */
export function rehireEmployee(emp: Employee, input: RehireInput = {}): Partial<Employee> {
  const hireDate = (input.hireDate ?? todayIso()).slice(0, 10);
  return {
    status: "activo",
    hireDate,
    endDate: null,
  };
}

/** ¿El colaborador tiene ceses previos (es una reincorporación)? */
export function isRehire(emp: Pick<Employee, "cessations" | "status">): boolean {
  return cessationsOf(emp).length > 0;
}
