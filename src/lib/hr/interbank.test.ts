import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCompany } from "@/lib/hr/company";
import {
  buildInterbankCts,
  buildInterbankFile,
  buildInterbankRemuneraciones,
  encodeInterbank,
  remuneracionBancaria,
  type InterbankRecord,
} from "@/lib/hr/interbank";
import type { Employee, Payslip } from "@/lib/hr/types";

const COMPANY = buildCompany(
  {
    ruc: "20614684772",
    name: "Test Logística E.I.R.L.",
    shortName: "Test",
    tradeName: "Test",
    city: "Lima",
    address: "Av. Siempre Viva 123",
    email: "rrhh@test.pe",
    regime: "general",
  },
  "test",
);

function emp(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "e1",
    code: "TST-001",
    companyId: "test",
    names: "Ana",
    paternal: "Quispe",
    maternal: "Rojas",
    dni: "12345678",
    email: "ana@test.pe",
    phone: "999111222",
    birthDate: "1990-01-01",
    address: "",
    hireDate: "2024-01-01",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 2400,
    familyAllowance: false,
    fifthCategory: false,
    pension: "onp",
    cuspp: "",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "Interbank",
    salaryAccount: "001-3001234567-0-99",
    ctsBank: "Interbank",
    ctsAccount: "001-3001234567-0-88",
    children: 0,
    vacationHistory: 0,
    ...overrides,
  };
}

function slip(lines: { code: string; amount: number }[]): Payslip {
  return {
    employeeId: "e1",
    period: "2026-11",
    factor: 1,
    lines: lines.map((l) => ({
      code: l.code,
      name: l.code,
      amount: l.amount,
      kind: "ingreso" as const,
    })),
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

const FIXED_NOW = new Date(2026, 10, 30, 12, 0, 0);

describe("interbank", () => {
  it("el monto bancario es básico + asignación familiar", () => {
    assert.equal(
      remuneracionBancaria(
        slip([
          { code: "BAS", amount: 2400 },
          { code: "AF", amount: 113 },
        ]),
      ),
      2513,
    );
    assert.equal(remuneracionBancaria(slip([{ code: "BAS", amount: 2400 }])), 2400);
  });

  it("genera cabecera y detalle con ancho fijo de 104 y 380", () => {
    const file = buildInterbankRemuneraciones(
      [emp()],
      [
        slip([
          { code: "BAS", amount: 2400 },
          { code: "AF", amount: 113 },
        ]),
      ],
      COMPANY,
      FIXED_NOW,
    );
    const lines = file.content.split("\r\n").filter((l) => l.length > 0);
    assert.equal(lines.length, 2);
    assert.equal(lines[0].length, 104);
    assert.equal(lines[1].length, 380);
    assert.equal(lines[0].slice(0, 2), "01");
    assert.equal(lines[0].slice(2, 4), "04"); // Remuneraciones
    assert.equal(lines[0].slice(63, 69), "000001"); // 1 registro
    assert.equal(lines[0].slice(69, 84), "000000000251300"); // 2513.00 en céntimos
    assert.equal(lines[1].slice(0, 2), "02");
  });

  it("separa oficina y cuenta de la cuenta Interbank de 13 dígitos", () => {
    const file = buildInterbankRemuneraciones(
      [emp()],
      [slip([{ code: "BAS", amount: 100 }])],
      COMPANY,
      FIXED_NOW,
    );
    const rec = file.content.split("\r\n").filter((l) => l.length > 0)[1];
    assert.equal(rec.slice(2, 12), "0112345678"); // código = tipoDoc + DNI
    assert.equal(rec.slice(69, 71), "09"); // abono en cuenta
    assert.equal(rec.slice(71, 74), "002"); // tipo de cuenta (ahorros)
    assert.equal(rec.slice(76, 79), "001"); // oficina
    assert.equal(rec.slice(79, 89), "3001234567"); // cuenta
    assert.equal(rec.slice(99, 100), "P"); // persona natural
    assert.equal(rec.slice(100, 102), "01"); // tipo de documento (DNI)
    assert.equal(rec.slice(102, 117).trim(), "12345678"); // N° de documento
    assert.equal(rec.slice(117, 177).trim(), "QUISPE ROJAS ANA"); // nombre en mayúsculas
  });

  it("usa abono interbancario (99) y el CCI para cuentas de 20 dígitos", () => {
    const records: InterbankRecord[] = [
      {
        employeeId: "e1",
        code: "TST-001",
        dni: "12345678",
        names: "Ana",
        paternal: "Quispe",
        maternal: "Rojas",
        account: "00219300123456789012",
        amount: 500,
      },
    ];
    const file = buildInterbankFile("remuneraciones", records, FIXED_NOW);
    const rec = file.content.split("\r\n").filter((l) => l.length > 0)[1];
    assert.equal(rec.slice(69, 71), "99");
    assert.equal(rec.slice(71, 74), "   "); // producto vacío en interbancario
    assert.equal(rec.slice(76, 79), "   "); // oficina vacía en interbancario
    assert.equal(rec.slice(79, 99), "00219300123456789012");
  });

  it("deja fuera a quien no tiene cuenta válida y lo reporta", () => {
    const file = buildInterbankRemuneraciones(
      [emp({ salaryAccount: "" })],
      [slip([{ code: "BAS", amount: 100 }])],
      COMPANY,
      FIXED_NOW,
    );
    assert.equal(file.count, 0);
    assert.equal(file.incomplete.length, 1);
  });

  it("CTS usa tipo de archivo 06 y tipo de cuenta 007", () => {
    const file = buildInterbankCts([emp()], COMPANY, 2026, "nov", FIXED_NOW);
    const lines = file.content.split("\r\n").filter((l) => l.length > 0);
    assert.equal(lines[0].slice(2, 4), "06");
    assert.equal(lines[1].slice(71, 74), "007");
    assert.ok(file.count >= 1);
  });

  it("codifica en Windows-1252 para no descuadrar el ancho fijo", () => {
    const file = buildInterbankRemuneraciones(
      [emp({ paternal: "Coveñas", maternal: "Mogollón", names: "Ericka" })],
      [slip([{ code: "BAS", amount: 100 }])],
      COMPANY,
      FIXED_NOW,
    );
    const bytes = encodeInterbank(file.content);
    const lines = file.content.split("\r\n").filter((l) => l.length > 0);
    // Cada línea de 380 caracteres debe ocupar 380 bytes (no más) en ANSI.
    assert.equal(bytes.length, file.content.length);
    assert.equal(lines[1].length, 380);
    assert.equal(bytes[bytes.length - 2], 0x0d); // CRLF final presente
    assert.equal(bytes[bytes.length - 1], 0x0a);
  });
});
