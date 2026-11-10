import type { Area, Employee, Pension } from "@/lib/hr/types";
import { HOY } from "@/lib/hr/format";

const PENSIONS = new Set<Pension>(["onp", "habitat", "integra", "prima", "profuturo", "ninguno"]);

export const CSV_SAMPLE = `nombres,paterno,materno,dni,email,cargo,area,sueldo,ingreso,pension,hijos
Ana,Pérez,López,45678912,ana.perez@miempresa.pe,Analista,Finanzas,3500,2024-01-15,onp,1
Luis,García,Quispe,40112233,luis.garcia@miempresa.pe,Asistente,Operaciones,1800,2025-03-01,habitat,0`;

function unquote(value: string): string {
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replaceAll('""', '"');
  return v;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map(unquote);
}

export type CsvImport = {
  employees: Omit<Employee, "vacationHistory">[];
  areas: Area[];
  errors: string[];
};

export function parseEmployeeCsv(text: string, existingAreas: Area[], startCode: number): CsvImport {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const errors: string[] = [];
  if (lines.length < 2) {
    return { employees: [], areas: [], errors: ["El archivo no tiene filas de datos."] };
  }
  const header = splitCsvLine(lines[0] ?? "").map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const required = ["nombres", "paterno", "dni", "cargo", "area", "sueldo", "ingreso"];
  for (const key of required) {
    if (idx(key) < 0) errors.push(`Falta la columna ${key}.`);
  }
  if (errors.length) return { employees: [], areas: [], errors };

  const areas = [...existingAreas];
  const employees: Omit<Employee, "vacationHistory">[] = [];
  let code = startCode;

  for (let r = 1; r < lines.length; r++) {
    const cols = splitCsvLine(lines[r] ?? "");
    const get = (name: string) => cols[idx(name)]?.trim() ?? "";
    const names = get("nombres");
    const paternal = get("paterno");
    const dni = get("dni").replace(/\D/g, "");
    const position = get("cargo");
    const areaName = get("area");
    const salary = Number(get("sueldo").replace(",", "."));
    const hireDate = get("ingreso");
    if (!names || !paternal || !position || !areaName) {
      errors.push(`Fila ${r + 1}: faltan nombres, apellido, cargo o área.`);
      continue;
    }
    if (!/^\d{8}$/.test(dni)) {
      errors.push(`Fila ${r + 1}: el DNI debe tener 8 dígitos.`);
      continue;
    }
    if (!Number.isFinite(salary) || salary < 0) {
      errors.push(`Fila ${r + 1}: sueldo inválido.`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDate)) {
      errors.push(`Fila ${r + 1}: ingreso debe ser AAAA-MM-DD.`);
      continue;
    }
    let area = areas.find((a) => a.name.toLowerCase() === areaName.toLowerCase());
    if (!area) {
      area = { id: `a-${dni}`, name: areaName };
      areas.push(area);
    }
    const pensionRaw = (get("pension") || "onp").toLowerCase() as Pension;
    const pension = PENSIONS.has(pensionRaw) ? pensionRaw : "onp";
    const children = Math.max(0, Number(get("hijos") || "0") || 0);
    const maternal = get("materno");
    const email = get("email") || `${names}.${paternal}`.toLowerCase().replace(/\s+/g, "") + "@empresa.pe";
    code += 1;
    employees.push({
      id: `imp-${dni}`,
      code: `EMP-${String(code).padStart(3, "0")}`,
      names,
      paternal,
      maternal,
      dni,
      email,
      phone: "",
      birthDate: "1995-01-01",
      address: "",
      hireDate,
      endDate: null,
      status: "activo",
      areaId: area.id,
      position,
      managerId: null,
      contract: "indefinido",
      regime: "general",
      salary,
      familyAllowance: children > 0,
      pension,
      workMode: "presencial",
      salaryBank: "BCP",
      salaryAccount: "",
      ctsBank: "BCP",
      ctsAccount: "",
      bank: "BCP",
      account: "",
      children,
    });
  }
  if (!employees.length && !errors.length) errors.push("No se importó ninguna fila.");
  return { employees: employees.map((e) => ({ ...e, hireDate: e.hireDate || HOY })), areas: areas.filter((a) => !existingAreas.some((x) => x.id === a.id)), errors };
}
