/**
 * Familiares a cargo (derechohabientes) del colaborador. Los hijos alimentan la
 * asignación familiar (Ley 25129) y la estructura 13 (ALTAS) del T-Registro.
 *
 * Módulo PURO para poder probarlo. `Employee.children` es un derivado: se
 * mantiene sincronizado con los dependientes de tipo hijo mediante
 * `withDependents`, que se aplica al guardar un colaborador o importar.
 */

import type { Dependent, DependentKind, Employee, Sex } from "@/lib/hr/types";

/** Etiquetas de vínculo familiar (tabla 19 del Anexo 2 de SUNAT). */
export const DEPENDENT_LABEL: Record<DependentKind, string> = {
  conyuge: "Cónyuge",
  concubino: "Concubina(o)",
  hijo: "Hijo(a)",
  hijo_incapacitado: "Hijo(a) mayor incapacitado",
  gestante: "Gestante",
};

/** Código de vínculo familiar de la tabla 19. */
export const DEPENDENT_KIND_CODE: Record<DependentKind, string> = {
  conyuge: "02",
  concubino: "03",
  gestante: "04",
  hijo: "05",
  hijo_incapacitado: "06",
};

/** Código de sexo (1 masculino / 2 femenino) para el T-Registro. */
export function sexCode(sex: Sex | undefined): string {
  if (sex === "masculino") return "1";
  if (sex === "femenino") return "2";
  return "";
}

/** ¿Este dependiente cuenta como hijo para la asignación familiar? */
export function isChild(dep: Dependent): boolean {
  return dep.kind === "hijo" || dep.kind === "hijo_incapacitado";
}

/** Hijos declarados (incluye al hijo mayor incapacitado). */
export function childDependents(emp: Pick<Employee, "dependents">): Dependent[] {
  return (emp.dependents ?? []).filter(isChild);
}

/** Cantidad de hijos, derivada de los dependientes. */
export function countChildren(emp: Pick<Employee, "dependents">): number {
  return childDependents(emp).length;
}

/**
 * Sincroniza `children` y `familyAllowance` con los dependientes declarados.
 * La asignación familiar corresponde cuando hay al menos un hijo (Ley 25129).
 *
 * Si `dependents` es `undefined` (datasets antiguos o importados por CSV, que
 * solo traen el número de hijos) se conserva el valor de `children` y
 * `familyAllowance` tal como vino, para no borrar la información existente.
 */
export function withDependents<T extends Employee>(emp: T): T {
  if (emp.dependents === undefined) return emp;
  const dependents = emp.dependents;
  const children = dependents.filter(isChild).length;
  if (children === emp.children && emp.familyAllowance === children > 0) return emp;
  return { ...emp, dependents, children, familyAllowance: children > 0 };
}

/** Dependiente vacío para el formulario de la ficha. */
export function emptyDependent(id: string): Dependent {
  return {
    id,
    kind: "hijo",
    names: "",
    paternal: "",
    maternal: "",
    dni: "",
    birthDate: "",
    sex: "masculino",
  };
}
