import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCompany } from "@/lib/hr/company";
import { liquidationSheet, pensionRateOf } from "@/lib/hr/liquidacion-sheet";
import type { Company, Employee } from "@/lib/hr/types";

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
    email: "",
    phone: "",
    birthDate: "1990-01-01",
    address: "",
    hireDate: "2024-03-15",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 3000,
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
    salaryAccount: "",
    ctsBank: "BCP",
    ctsAccount: "",
    children: 0,
    vacationHistory: 0,
    ...overrides,
  };
}

function companyWith(over: Partial<Company>): Company {
  return { ...COMPANY, ...over };
}

test("pensionRateOf: ONP usa la tasa de la empresa; AFP suma aporte, seguro y comisión", () => {
  assert.equal(pensionRateOf(COMPANY, emp({ pension: "onp" })), COMPANY.onp);
  assert.equal(pensionRateOf(COMPANY, emp({ pension: "ninguno" })), 0);
  const afp = pensionRateOf(COMPANY, emp({ pension: "prima" }));
  assert.equal(afp, COMPANY.afpAporte + COMPANY.afpSeguro + COMPANY.afpComision.prima);
});

test("liquidationSheet: cuatro secciones y total con descuento de pensión sobre vacaciones", () => {
  const sheet = liquidationSheet(emp(), COMPANY, [], "2026-06-30", "simulacion");
  assert.equal(sheet.sections.length, 4);
  assert.equal(sheet.sections[0].key, "cts");
  assert.equal(sheet.sections[1].key, "grati");
  assert.equal(sheet.sections[2].key, "vac");
  assert.equal(sheet.sections[3].key, "resumen");

  // El subtotal de cada sección coincide con su parte del cálculo.
  const vac = sheet.sections[2].subtotal;
  const expectedDiscount = Math.round(vac * COMPANY.onp * 100) / 100;
  assert.equal(sheet.pensionDiscount, expectedDiscount);
  assert.equal(sheet.total, Math.round((sheet.gross - expectedDiscount) * 100) / 100);
  assert.ok(sheet.totalEnLetras.startsWith("SON:"));
});

test("liquidationSheet: la microempresa no descuenta pensión de una liquidación sin CTS ni gratificación", () => {
  const micro = buildCompany(
    {
      ruc: "20614684772",
      name: "Micro E.I.R.L.",
      shortName: "Micro",
      tradeName: "Micro",
      city: "Lima",
      address: "",
      email: "",
      regime: "micro",
      mypeAccreditationDate: "2026-01-10",
    },
    "micro",
  );
  const sheet = liquidationSheet(emp(), micro, [], "2026-06-30", "simulacion");
  assert.equal(sheet.sections[0].subtotal, 0);
  assert.equal(sheet.sections[1].subtotal, 0);
  // Solo vacaciones, con su descuento de pensión.
  assert.ok(sheet.sections[2].subtotal > 0);
  assert.equal(sheet.total, Math.round((sheet.gross - sheet.pensionDiscount) * 100) / 100);
});

test("liquidationSheet: el modo cese y el de simulación comparten el mismo cálculo", () => {
  const activo = emp();
  const cesado = emp({ status: "cesado", endDate: "2026-06-30" });
  const sim = liquidationSheet(activo, COMPANY, [], "2026-06-30", "simulacion");
  const cese = liquidationSheet(cesado, COMPANY, [], "2026-06-30", "cese");
  assert.equal(sim.total, cese.total);
  assert.equal(sim.mode, "simulacion");
  assert.equal(cese.mode, "cese");
});

test("liquidationSheet: el practicante no tiene descuento de pensión", () => {
  const sheet = liquidationSheet(emp({ regime: "practicante" }), COMPANY, [], "2026-06-30", "simulacion");
  assert.equal(sheet.pensionRate, 0);
  assert.equal(sheet.pensionDiscount, 0);
  assert.equal(sheet.total, sheet.gross);
});

test("liquidationSheet: una empresa de pequeña empresa paga CTS y gratificación al 50%", () => {
  const pequena = companyWith({ regime: "pequena", mypeAccreditationDate: "2026-01-10" });
  const general = liquidationSheet(emp(), COMPANY, [], "2026-06-30", "simulacion");
  const peq = liquidationSheet(emp(), pequena, [], "2026-06-30", "simulacion");
  assert.equal(peq.sections[0].subtotal, Math.round(general.sections[0].subtotal * 0.5 * 100) / 100);
});
