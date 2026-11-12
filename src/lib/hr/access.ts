import type { AttachmentKind, Employee, Viewer } from "@/lib/hr/types";

export function directReports(employees: Employee[], managerId: string): Employee[] {
  return employees.filter((e) => e.managerId === managerId);
}

/** ¿Este rol administra toda la empresa (no solo su equipo)? */
export function isCompanyAdmin(mode: Viewer["mode"]): boolean {
  return mode === "rrhh" || mode === "superadmin";
}

/**
 * Tipos de adjunto que un viewer puede ver de un colaborador. RR.HH. y el
 * superadmin ven todo el legajo; cada persona ve, de sí misma, su T-Registro de
 * alta y su contrato. La liquidación y el T-Registro de baja quedan en RR.HH.
 */
export function visibleAttachmentKinds(viewer: Viewer, emp: Employee): AttachmentKind[] {
  if (isCompanyAdmin(viewer.mode)) return ["tRegistroAlta", "contrato", "tRegistroBaja", "liquidacion"];
  if (viewer.employeeId === emp.id) return ["tRegistroAlta", "contrato"];
  return [];
}

/**
 * Deja en la ficha solo los adjuntos que el viewer puede ver. La liquidación y
 * el T-Registro de baja no salen del servidor hacia el propio colaborador.
 */
export function restrictAttachments(emp: Employee, viewer: Viewer): Employee {
  const allowed = visibleAttachmentKinds(viewer, emp);
  const current = emp.attachments ?? {};
  const next: NonNullable<Employee["attachments"]> = {};
  for (const kind of allowed) {
    const file = current[kind];
    if (file) next[kind] = file;
  }
  return { ...emp, attachments: Object.keys(next).length ? next : undefined };
}

export function visibleEmployees(employees: Employee[], viewer: Viewer): Employee[] {
  if (!viewer.employeeId && !isCompanyAdmin(viewer.mode)) return [];
  if (isCompanyAdmin(viewer.mode)) return employees;
  if (viewer.mode === "colaborador") return employees.filter((e) => e.id === viewer.employeeId);
  const ids = new Set([
    viewer.employeeId,
    ...directReports(employees, viewer.employeeId).map((e) => e.id),
  ]);
  return employees.filter((e) => ids.has(e.id));
}

export function canSeeMoney(viewer: Viewer, employeeId: string): boolean {
  if (isCompanyAdmin(viewer.mode)) return true;
  return viewer.mode === "colaborador" && viewer.employeeId === employeeId;
}

export function canApprove(viewer: Viewer, employees: Employee[], employeeId: string): boolean {
  if (viewer.mode === "colaborador") return false;
  if (viewer.employeeId === employeeId) return isCompanyAdmin(viewer.mode);
  if (isCompanyAdmin(viewer.mode)) return true;
  return employees.some((e) => e.id === employeeId && e.managerId === viewer.employeeId);
}
