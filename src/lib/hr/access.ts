import type { Employee, Viewer } from "@/lib/hr/types";

export function directReports(employees: Employee[], managerId: string): Employee[] {
  return employees.filter((e) => e.managerId === managerId);
}

export function visibleEmployees(employees: Employee[], viewer: Viewer): Employee[] {
  if (!viewer.employeeId && viewer.mode !== "rrhh") return [];
  if (viewer.mode === "rrhh") return employees;
  if (viewer.mode === "colaborador") return employees.filter((e) => e.id === viewer.employeeId);
  const ids = new Set([
    viewer.employeeId,
    ...directReports(employees, viewer.employeeId).map((e) => e.id),
  ]);
  return employees.filter((e) => ids.has(e.id));
}

export function canSeeMoney(viewer: Viewer, employeeId: string): boolean {
  if (viewer.mode === "rrhh") return true;
  return viewer.mode === "colaborador" && viewer.employeeId === employeeId;
}

export function canApprove(viewer: Viewer, employees: Employee[], employeeId: string): boolean {
  if (viewer.mode === "colaborador") return false;
  if (viewer.employeeId === employeeId) return viewer.mode === "rrhh";
  if (viewer.mode === "rrhh") return true;
  return employees.some((e) => e.id === employeeId && e.managerId === viewer.employeeId);
}
