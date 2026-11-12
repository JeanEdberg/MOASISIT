import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCompany } from "@/lib/hr/company";
import { ctsPeriodFor, gratuityPeriodFor, liquidationOf, previousCtsPeriod, previousGratuityPeriod, vacationLiquidation } from "@/lib/hr/liquidacion";
import { gratuityBonusRate } from "@/lib/hr/regime";
import type { Employee } from "@/lib/hr/types";

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

test("gratuityBonusRate: 9% con EsSalud, 6.75% con EPS", () => {
  assert.equal(gratuityBonusRate("essalud"), 0.09);
  assert.equal(gratuityBonusRate("eps"), 0.0675);
  assert.equal(gratuityBonusRate(undefined), 0.09);
});

test("ctsPeriodFor ubica el depósito según el mes de cese", () => {
  assert.deepEqual(ctsPeriodFor("2026-06-30"), { year: 2026, which: "nov" }); // May–Oct → nov
  assert.deepEqual(ctsPeriodFor("2026-11-15"), { year: 2027, which: "may" }); // Nov–Dic → may del año siguiente
  assert.deepEqual(ctsPeriodFor("2026-02-10"), { year: 2026, which: "may" }); // Ene–Abr → may
});

test("gratuityPeriodFor ubica el semestre según el mes de cese", () => {
  assert.deepEqual(gratuityPeriodFor("2026-03-31"), { year: 2026, which: "julio" }); // Ene–Jun → Fiestas Patrias
  assert.deepEqual(gratuityPeriodFor("2026-09-30"), { year: 2026, which: "navidad" }); // Jul–Dic → Navidad
});

test("liquidationOf suma CTS trunca, gratificación trunca, bonificación y vacaciones", () => {
  const liq = liquidationOf(emp(), COMPANY, [], "2026-06-30");
  assert.equal(liq.asOf, "2026-06-30");
  assert.equal(liq.regime, "general");
  // CTS del período Nov 2025–Abr 2026 (5 meses completos + días de mayo–junio).
  assert.ok(liq.cts > 0);
  // Gratificación trunca de Fiestas Patrias 2026 con su bonificación del 9%.
  assert.ok(liq.gratificacion > 0);
  assert.equal(liq.bonificacion, Math.round(liq.gratificacion * 0.09 * 100) / 100);
  // Vacaciones truncas y no gozadas.
  assert.ok(liq.vacaciones > 0);
  assert.equal(liq.total, Math.round((liq.cts + liq.gratificacion + liq.bonificacion + liq.vacaciones) * 100) / 100);
  assert.ok(liq.items.length >= 4);
});

test("microempresa: sin CTS ni gratificación en la liquidación", () => {
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
  const liq = liquidationOf(emp(), micro, [], "2026-06-30");
  assert.equal(liq.cts, 0);
  assert.equal(liq.gratificacion, 0);
  assert.equal(liq.bonificacion, 0);
  // Solo vacaciones (15 días/año para micro).
  assert.ok(liq.vacaciones > 0);
  assert.equal(liq.total, liq.vacaciones);
});

test("pequeña empresa: CTS y gratificación al 50%", () => {
  const pequena = buildCompany(
    {
      ruc: "20614684772",
      name: "Pequeña E.I.R.L.",
      shortName: "Pequeña",
      tradeName: "Pequeña",
      city: "Lima",
      address: "",
      email: "",
      regime: "pequena",
      mypeAccreditationDate: "2026-01-10",
    },
    "pequena",
  );
  const general = liquidationOf(emp(), COMPANY, [], "2026-06-30");
  const pequenaLiq = liquidationOf(emp(), pequena, [], "2026-06-30");
  assert.equal(pequenaLiq.cts, Math.round(general.cts * 0.5 * 100) / 100);
  assert.equal(pequenaLiq.gratificacion, Math.round(general.gratificacion * 0.5 * 100) / 100);
});

test("vacationLiquidation separa truncas de no gozadas", () => {
  const vac = vacationLiquidation(emp({ vacationHistory: 5 }), [], "2026-06-30", COMPANY);
  assert.ok(vac.trunca > 0);
  assert.equal(vac.total, Math.round((vac.trunca + vac.noGozadas) * 100) / 100);
});

test("las vacaciones de la liquidación se pagan en soles (días × remuneración diaria)", () => {
  const liq = liquidationOf(emp(), COMPANY, [], "2026-06-30");
  const vac = vacationLiquidation(emp(), [], "2026-06-30", COMPANY);
  const dailyRate = 3000 / 30;
  assert.equal(liq.vacaciones, Math.round(vac.total * dailyRate * 100) / 100);
  // El monto en soles es muy superior al número de días (bug corregido).
  assert.ok(liq.vacaciones > vac.total);
});

test("vacaciones truncas con más de un año de antigüedad solo cuentan el récord en curso", () => {
  // Ingreso 2024-03-15; a 2026-03-20 el récord en curso es ~0 meses + 5 días.
  const vac = vacationLiquidation(emp(), [], "2026-03-20", COMPANY);
  assert.ok(vac.trunca > 0 && vac.trunca < 2.5);
});

test("previousCtsPeriod / previousGratuityPeriod apuntan al período ya pagado", () => {
  assert.deepEqual(previousCtsPeriod("2026-06-30"), { year: 2026, which: "may" });
  assert.deepEqual(previousGratuityPeriod("2026-06-30"), { year: 2025, which: "navidad" });
});

test("liquidationOf incluye depósitos previos como referencia informativa", () => {
  const liq = liquidationOf(emp(), COMPANY, [], "2026-06-30");
  assert.ok(liq.reference.length > 0);
  // La referencia no se suma al total.
  const refSum = liq.reference.reduce((s, r) => s + r.amount, 0);
  assert.ok(refSum > 0);
  assert.equal(liq.total, Math.round((liq.cts + liq.gratificacion + liq.bonificacion + liq.vacaciones) * 100) / 100);
});

