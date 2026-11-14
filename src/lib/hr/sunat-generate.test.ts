import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCompany } from "@/lib/hr/company";
import { catalogInsurers } from "@/lib/hr/insurers";
import {
  generateFiles,
  generateStructure,
  generatedFileText,
  canGenerate,
  bankCode,
} from "@/lib/hr/sunat-generate";
import { IMPORT_STRUCTURES } from "@/lib/hr/sunat-imports";
import { withDependents } from "@/lib/hr/dependents";
import type { Attendance, Company, Employee, Payslip } from "@/lib/hr/types";

function makeCompany(): Company {
  const base = buildCompany(
    {
      ruc: "20512345678",
      name: "INMOA Logística y Soluciones E.I.R.L.",
      shortName: "INMOA",
      tradeName: "INMOA",
      city: "Puerto Maldonado",
      address: "Av. León Velarde 123",
      email: "rrhh@inmoa.pe",
    },
    "inmoa",
  );
  return { ...base, insurers: catalogInsurers("inmoa") };
}

function makeEmployee(patch: Partial<Employee>): Employee {
  return {
    id: "e1",
    code: "0001",
    companyId: "inmoa",
    names: "Ana",
    paternal: "Pérez",
    maternal: "López",
    dni: "45678912",
    email: "ana@inmoa.pe",
    phone: "987654321",
    birthDate: "1992-04-18",
    sex: "femenino",
    address: "Av. Siempre Viva 123",
    ubigeo: "170101",
    hireDate: "2024-01-15",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 3500,
    familyAllowance: false,
    fifthCategory: true,
    pension: "onp",
    cuspp: "",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "BCP",
    salaryAccount: "1931234567890",
    ctsBank: "BCP",
    ctsAccount: "1931234567890",
    children: 0,
    vacationHistory: 0,
    ...patch,
  } as Employee;
}

function makeSlip(employeeId: string, lines: Payslip["lines"]): Payslip {
  return {
    employeeId,
    period: "2026-11",
    factor: 1,
    lines,
    gross: 0,
    discounts: 0,
    net: 0,
    essalud: 0,
    eps: 0,
    sctr: 0,
    sctrSalud: 0,
    sctrPension: 0,
    vidaLey: 0,
    pensionBase: 0,
    fifth: 0,
    cts: null,
    cappedPension: false,
  };
}

const period = "2026-11";
const empty = { attendance: [] as Attendance[], slips: [] as Payslip[], period };

test("generateStructure arma E5 con el régimen, la pensión y el sueldo del colaborador", () => {
  const company = makeCompany();
  const employees = [makeEmployee({ pension: "habitat", cuspp: "610789HABIT3" })];
  const file = generateStructure("E5", { company, employees, ...empty });
  assert.ok(file);
  assert.equal(file.fileName, "RP_20512345678.tra");
  const cols = file.lines[0].split("|");
  assert.equal(cols.length, 23);
  assert.equal(cols[1], "45678912"); // DNI
  assert.equal(cols[3], "01"); // régimen laboral privado general
  assert.equal(cols[7], "610789HABIT3"); // CUSPP
  assert.equal(cols[15], "3500.00"); // remuneración básica
});

test("E5 omite a los practicantes", () => {
  const company = makeCompany();
  const employees = [
    makeEmployee({ id: "e1", dni: "45678912" }),
    makeEmployee({ id: "e2", dni: "40112233", regime: "practicante" }),
  ];
  const file = generateStructure("E5", { company, employees, ...empty });
  assert.ok(file);
  assert.equal(file.kind, "datos");
  assert.equal(file.lines.length, 1); // solo el trabajador, no el practicante
  assert.equal(file.lines[0].split("|")[1], "45678912");
});

test("E4 arma los 41 campos con DNI, sexo y nacionalidad Perú", () => {
  const company = makeCompany();
  const employees = [makeEmployee({})];
  const file = generateStructure("E4", { company, employees, ...empty });
  assert.ok(file);
  const cols = file.lines[0].split("|");
  assert.equal(cols.length, 41);
  assert.equal(cols[0], "01");
  assert.equal(cols[1], "45678912");
  assert.equal(cols[3], "18/04/1992");
  assert.equal(cols[7], "2"); // femenino
  assert.equal(cols[8], "9589"); // Perú
  assert.equal(cols[25], "170101"); // ubigeo
});

test("E4 deja el sexo vacío si no está registrado", () => {
  const company = makeCompany();
  const employees = [makeEmployee({ sex: undefined })];
  const file = generateStructure("E4", { company, employees, ...empty });
  assert.ok(file);
  assert.equal(file.lines[0].split("|")[7], "");
});

test("E18 traduce los conceptos de la boleta a los códigos de la tabla 22", () => {
  const company = makeCompany();
  const employees = [makeEmployee({})];
  const slips = [
    makeSlip("e1", [
      { code: "BAS", name: "Remuneración básica", amount: 3500, kind: "ingreso" },
      { code: "ONP", name: "Aporte ONP", amount: 455, kind: "descuento" },
      { code: "ESS", name: "EsSalud empleador", amount: 315, kind: "aporte" },
    ]),
  ];
  const file = generateStructure("E18", { company, employees, attendance: [], slips, period });
  assert.ok(file);
  assert.equal(file.lines.length, 2); // ESS (aporte) se excluye
  const first = file.lines[0].split("|");
  assert.equal(first[2], "121"); // básico
  assert.equal(first[3], "3500.00");
  assert.equal(file.lines[1].split("|")[2], "607"); // ONP
});

test("E14 cuenta horas ordinarias y sobretiempo de la asistencia", () => {
  const company = makeCompany();
  const employees = [makeEmployee({})];
  const attendance: Attendance[] = [
    { id: "a1", employeeId: "e1", companyId: "inmoa", date: "2026-11-03", kind: "presente", checkIn: "08:00", checkOut: "17:00", extra25: 2, extra35: 0 },
    { id: "a2", employeeId: "e1", companyId: "inmoa", date: "2026-11-04", kind: "tardanza", checkIn: "08:30", checkOut: "17:00", extra25: 0, extra35: 0 },
  ];
  const file = generateStructure("E14", { company, employees, attendance, slips: [makeSlip("e1", [])], period });
  assert.ok(file);
  const cols = file.lines[0].split("|");
  assert.equal(cols[2], "16"); // 2 días × 8 horas
  assert.equal(cols[4], "2"); // 2 horas extra
});

test("E15 agrupa los días no laborados por tipo de suspensión", () => {
  const company = makeCompany();
  const employees = [makeEmployee({})];
  const attendance: Attendance[] = [
    { id: "a1", employeeId: "e1", companyId: "inmoa", date: "2026-11-03", kind: "vacaciones", checkIn: "", checkOut: "", extra25: 0, extra35: 0 },
    { id: "a2", employeeId: "e1", companyId: "inmoa", date: "2026-11-04", kind: "vacaciones", checkIn: "", checkOut: "", extra25: 0, extra35: 0 },
  ];
  const file = generateStructure("E15", { company, employees, attendance, slips: [makeSlip("e1", [])], period });
  assert.ok(file);
  const cols = file.lines[0].split("|");
  assert.equal(cols[2], "23"); // descanso vacacional
  assert.equal(cols[3], "2");
});

test("E30 resuelve el código del banco y avisa de los no reconocidos", () => {
  const company = makeCompany();
  const employees = [makeEmployee({ salaryBank: "BCP" }), makeEmployee({ id: "e2", dni: "40112233", salaryBank: "Banco Raro" })];
  const file = generateStructure("E30", { company, employees, ...empty });
  assert.ok(file);
  assert.equal(file.lines[0].split("|")[3], "002");
  assert.equal(file.lines[1].split("|")[3], "");
  assert.ok(file.missing.some((m) => /Banco Raro/.test(m)));
});

test("E11 arma líneas de período, tipo de trabajador, salud y pensión", () => {
  const company = makeCompany();
  const employees = [makeEmployee({ pension: "integra", cuspp: "1" })];
  const file = generateStructure("E11", { company, employees, ...empty });
  assert.ok(file);
  // período (1) + tipo de trabajador (2) + salud (3) + pensión (4)
  assert.equal(file.lines.length, 4);
  assert.equal(file.lines[0].split("|")[4], "1");
  assert.equal(file.lines[1].split("|")[4], "2");
  assert.equal(file.lines[2].split("|")[4], "3");
  assert.equal(file.lines[3].split("|")[4], "4");
  assert.equal(file.lines[3].split("|")[7], "21"); // SPP Integra
});

test("E13 genera un derechohabiente por hijo con su vínculo y sexo", () => {
  const company = makeCompany();
  const emp = withDependents(
    makeEmployee({
      dependents: [
        { id: "d1", kind: "hijo", names: "Luis", paternal: "Pérez", maternal: "López", dni: "70001122", birthDate: "2018-06-01", sex: "masculino" },
        { id: "d2", kind: "hijo", names: "María", paternal: "Pérez", maternal: "López", dni: "70003344", birthDate: "2021-09-10", sex: "femenino" },
      ],
    }),
  );
  assert.equal(emp.children, 2);
  assert.equal(emp.familyAllowance, true);
  const file = generateStructure("E13", { company, employees: [emp], ...empty, date: "2026-11-09" });
  assert.ok(file);
  assert.equal(file.lines.length, 2);
  assert.equal(file.fileName, "RD_20512345678_09112026_ALTA.TXT");
  const cols = file.lines[0].split("|");
  assert.equal(cols.length, 46);
  assert.equal(cols[3], "70001122"); // DNI del hijo
  assert.equal(cols[9], "1"); // masculino
  assert.equal(cols[10], "05"); // hijo
});

test("E13 entrega plantilla cuando no hay derechohabientes", () => {
  const company = makeCompany();
  const file = generateStructure("E13", { company, employees: [makeEmployee({})], ...empty });
  assert.ok(file);
  assert.equal(file.kind, "plantilla");
  assert.equal(file.lines.length, 1);
});

test("todas las estructuras del catálogo son generables", () => {
  const company = makeCompany();
  const employees = [makeEmployee({})];
  for (const s of IMPORT_STRUCTURES) {
    assert.equal(canGenerate(s.id), true, `Estructura ${s.id} no es generable`);
    const files = generateFiles(s.id, { company, employees, ...empty });
    assert.ok(files.length >= 1, `Estructura ${s.id} no produjo archivos`);
    for (const f of files) {
      assert.ok(f.lines.length >= 1, `Estructura ${s.id} sin líneas`);
      assert.ok(f.fileName.length > 0, `Estructura ${s.id} sin nombre de archivo`);
    }
  }
});

test("las estructuras sin datos en la app se marcan como plantilla", () => {
  const company = makeCompany();
  const file = generateStructure("E20", { company, employees: [makeEmployee({})], ...empty });
  assert.ok(file);
  assert.equal(file.kind, "plantilla");
  assert.ok(file.warnings.some((w) => /plantilla/i.test(w)));
});

test("bankCode reconoce los principales bancos de la tabla 36", () => {
  assert.equal(bankCode("BCP"), "002");
  assert.equal(bankCode("Interbank"), "003");
  assert.equal(bankCode("BBVA Continental"), "011");
  assert.equal(bankCode("Caja Piura"), "824");
  assert.equal(bankCode(""), "");
});

test("generatedFileText une las líneas con CRLF y cierre final", () => {
  const file = { structureId: "X", destination: "PLAME" as const, fileName: "f.txt", lines: ["a|b", "c|d"], kind: "datos" as const, missing: [], warnings: [] };
  assert.equal(generatedFileText(file), "a|b\r\nc|d\r\n");
});
