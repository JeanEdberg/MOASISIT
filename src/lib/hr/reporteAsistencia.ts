import type { Employee, Attendance } from "./types";
import { fullName } from "./format";

export interface ResumenColaboradorAsistencia {
  employeeId: string;
  documento: string;
  empleado: string;
  cargo: string;
  diasPresente: number;
  tardanzas: number;
  faltas: number;
  horasExtra25: number;
  horasExtra35: number;
  totalHorasExtra: number;
}

export function generarConsolidadoMensual(
  employees: Employee[],
  attendance: Attendance[],
  periodo: string // Formato "YYYY-MM" (ej: "2026-11")
): ResumenColaboradorAsistencia[] {
  
  // Filtramos las asistencias que correspondan al año y mes del periodo
  const marcasDelMes = attendance.filter((a) => a.date.startsWith(periodo));

  return employees.map((emp) => {
    const marcasEmp = marcasDelMes.filter((m) => m.employeeId === emp.id);

    const diasPresente = marcasEmp.filter((m) => m.kind === "presente" || m.kind === "remoto").length;
    const tardanzas = marcasEmp.filter((m) => m.kind === "tardanza").length;
    const faltas = marcasEmp.filter((m) => m.kind === "falta").length;
    
    const extra25 = marcasEmp.reduce((sum, m) => sum + (m.extra25 || 0), 0);
    const extra35 = marcasEmp.reduce((sum, m) => sum + (m.extra35 || 0), 0);

    return {
      employeeId: emp.id,
      documento: emp.dni,
      empleado: fullName(emp),
      cargo: emp.position,
      diasPresente,
      tardanzas,
      faltas,
      horasExtra25: extra25,
      horasExtra35: extra35,
      totalHorasExtra: extra25 + extra35,
    };
  });
}