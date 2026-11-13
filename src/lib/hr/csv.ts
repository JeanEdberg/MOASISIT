import type {
  Area,
  ContractType,
  Employee,
  HealthInsurance,
  Pension,
  Regime,
  WorkMode,
} from "@/lib/hr/types";
import { todayIso } from "@/lib/hr/format";

const PENSIONS = new Set<Pension>(["onp", "habitat", "integra", "prima", "profuturo", "ninguno"]);
const CONTRACTS = new Set<ContractType>(["indefinido", "plazo_fijo", "practicas"]);
const REGIMES = new Set<Regime>(["general", "pequena", "micro", "practicante"]);
const HEALTH = new Set<HealthInsurance>(["essalud", "eps"]);
const WORK_MODES = new Set<WorkMode>(["presencial", "campo", "virtual", "hibrido", "itinerante"]);

/**
 * Plantilla completa para importar colaboradores. Las primeras siete columnas
 * son obligatorias; el resto se puede dejar vacío y la app usa un valor por
 * defecto. El orden de las columnas no importa: se lee por el nombre del
 * encabezado. Sirve tanto de ejemplo como de archivo listo para llenar.
 */
export const CSV_SAMPLE = `nombres,paterno,materno,dni,email,telefono,nacimiento,direccion,cargo,area,sueldo,ingreso,fin,contrato,regimen,pension,cuspp,hijos,quinta,salud,modalidad,banco,cuenta,banco_cts,cuenta_cts,jefe_dni
Ana,Pérez,López,45678912,ana.perez@miempresa.pe,987654321,1992-04-18,Av. Siempre Viva 123,Analista,Finanzas,3500,2024-01-15,,indefinido,general,onp,,1,si,essalud,presencial,BCP,1931234567890,BCP,1931234567890,
Luis,García,Quispe,40112233,luis.garcia@miempresa.pe,912345678,1988-09-02,Jr. Los Álamos 456,Asistente,Operaciones,1800,2025-03-01,,plazo_fijo,general,habitat,610789HABIT3,0,si,essalud,campo,Interbank,2003001234567,Interbank,2003001234567,45678912
Rosa,Mendoza,Silva,45566778,rosa.mendoza@miempresa.pe,,1995-12-30,,Practicante,Administración,1200,2026-02-01,2026-08-01,practicas,practicante,ninguno,,0,no,essalud,presencial,,,,
`;

/** Encabezados válidos de la plantilla (para el mensaje de ayuda y la validación). */
export const CSV_COLUMNS = [
  "nombres",
  "paterno",
  "materno",
  "dni",
  "email",
  "telefono",
  "nacimiento",
  "direccion",
  "cargo",
  "area",
  "sueldo",
  "ingreso",
  "fin",
  "contrato",
  "regimen",
  "pension",
  "cuspp",
  "hijos",
  "quinta",
  "salud",
  "modalidad",
  "banco",
  "cuenta",
  "banco_cts",
  "cuenta_cts",
  "jefe_dni",
] as const;

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

export function parseEmployeeCsv(text: string, existingAreas: Area[], startCode: number, companyId: string): CsvImport {
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
  // Solo estas columnas son obligatorias. El resto es opcional: si falta la
  // columna o el valor, se usa un valor por defecto razonable.
  const required = ["nombres", "paterno", "dni", "cargo", "area", "sueldo", "ingreso"];
  for (const key of required) {
    if (idx(key) < 0) errors.push(`Falta la columna ${key}.`);
  }
  if (errors.length) {
    return { employees: [], areas: [], errors: [...errors, `Columnas válidas: ${CSV_COLUMNS.join(", ")}.`] };
  }

  const areas = [...existingAreas];
  const employees: Omit<Employee, "vacationHistory">[] = [];
  const byDni = new Map<string, Omit<Employee, "vacationHistory">>();
  const managerDni = new Map<string, string>();
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
    if (byDni.has(dni)) {
      errors.push(`Fila ${r + 1}: el DNI ${dni} está repetido en el archivo.`);
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
    let area = areas.find((a) => a.name.toLowerCase() === areaName.toLowerCase() && a.companyId === companyId);
    if (!area) {
      area = { id: `a-${companyId}-${dni}`, name: areaName, companyId };
      areas.push(area);
    }

    const pensionRaw = (get("pension") || "onp").toLowerCase() as Pension;
    const pension = PENSIONS.has(pensionRaw) ? pensionRaw : "onp";
    const cuspp = pension === "onp" || pension === "ninguno" ? "" : get("cuspp").toUpperCase().trim();
    const contractRaw = (get("contrato") || "indefinido").toLowerCase() as ContractType;
    const contract = CONTRACTS.has(contractRaw) ? contractRaw : "indefinido";
    const regimeRaw = (get("regimen") || "general").toLowerCase() as Regime;
    const regime = REGIMES.has(regimeRaw) ? regimeRaw : "general";
    const healthRaw = (get("salud") || "essalud").toLowerCase() as HealthInsurance;
    const healthInsurance = HEALTH.has(healthRaw) ? healthRaw : "essalud";
    const workRaw = (get("modalidad") || "presencial").toLowerCase() as WorkMode;
    const workMode = WORK_MODES.has(workRaw) ? workRaw : "presencial";
    const children = Math.max(0, Number(get("hijos") || "0") || 0);
    const quintaRaw = get("quinta").toLowerCase();
    const fifthCategory = quintaRaw ? ["si", "sí", "1", "true", "x"].includes(quintaRaw) : regime === "general";
    const maternal = get("materno");
    const email = get("email") || `${names}.${paternal}`.toLowerCase().replace(/\s+/g, "") + "@empresa.pe";
    const bank = get("banco") || "BCP";
    const ctsBank = get("banco_cts") || bank;
    code += 1;
    const employee: Omit<Employee, "vacationHistory"> = {
      id: `imp-${dni}`,
      code: `EMP-${String(code).padStart(3, "0")}`,
      companyId,
      names,
      paternal,
      maternal,
      dni,
      email,
      phone: get("telefono"),
      birthDate: get("nacimiento") || "1995-01-01",
      address: get("direccion"),
      hireDate,
      endDate: get("fin") || null,
      status: "activo",
      areaId: area.id,
      position,
      managerId: null,
      contract,
      regime,
      salary,
      familyAllowance: children > 0,
      fifthCategory,
      pension,
      cuspp,
      healthInsurance,
      healthHistory: [{ from: hireDate, healthInsurance, epsInsurerId: null }],
      epsInsurerId: null,
      sctrInsurerId: null,
      vidaLeyInsurerId: null,
      workMode,
      salaryBank: bank,
      salaryAccount: get("cuenta"),
      ctsBank,
      ctsAccount: get("cuenta_cts"),
      bank,
      account: get("cuenta"),
      children,
    };
    const jefe = get("jefe_dni").replace(/\D/g, "");
    if (jefe) managerDni.set(dni, jefe);
    byDni.set(dni, employee);
    employees.push(employee);
  }

  // Segunda pasada: resolver el jefe por DNI (puede venir antes o después).
  for (const [dni, jefe] of managerDni) {
    const emp = byDni.get(dni);
    if (!emp) continue;
    if (jefe === dni) {
      errors.push(`DNI ${dni}: no puede ser su propio jefe.`);
      continue;
    }
    const manager = byDni.get(jefe);
    if (manager) emp.managerId = manager.id;
    else errors.push(`DNI ${dni}: el jefe con DNI ${jefe} no está en el archivo.`);
  }

  if (!employees.length && !errors.length) errors.push("No se importó ninguna fila.");
  return {
    employees: employees.map((e) => ({ ...e, hireDate: e.hireDate || todayIso() })),
    areas: areas.filter((a) => !existingAreas.some((x) => x.id === a.id)),
    errors,
  };
}
