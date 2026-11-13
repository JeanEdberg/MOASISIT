import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCompany } from "@/lib/hr/company";
import { ctsSemester, sixthOfGratuity } from "@/lib/hr/calc";
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

test("sixthOfGratuity estima sueldo + asignación familiar con la bonificación del 9%", () => {
  // 2300 * 1.09 / 6 = 417.83 (el 1/6 percibido incluye la bonificación).
  assert.equal(sixthOfGratuity(emp({ salary: 2300 }), 2300), 417.83);
  // Con asignación familiar: (3000 + 123) * 1.09 / 6 = 567.35.
  assert.equal(sixthOfGratuity(emp(), 3123), 567.35);
});

test("sixthOfGratuity usa la bonificación de EPS (6.75%) cuando corresponde", () => {
  assert.equal(sixthOfGratuity(emp({ healthInsurance: "eps" }), 3000), 533.75);
});

test("sixthOfGratuity respeta el 1/6 registrado por RR.HH. (gratificación realmente pagada)", () => {
  assert.equal(sixthOfGratuity(emp({ sextoGratificacion: 635.83 }), 3700), 635.83);
});

test("ctsSemester incluye la bonificación en el 1/6 de la remuneración computable", () => {
  // Nov 2026 (may–oct): 6 meses completos. Computable = 3000 + 3000*1.09/6 = 3545.
  // CTS = 3545 * 6/12 = 1772.50. Si se omitiera el 9%, daría (3000 + 500)/2 = 1750.
  assert.equal(ctsSemester(emp(), COMPANY, 2026, "nov"), 1772.5);
});

test("la asignación familiar usa la RMV vigente del período, no la última", () => {
  const conHijos = emp({ familyAllowance: true });
  // Nov 2024 (may–oct 2024): RMV 1025 → AF = 102.50; computable 3102.50;
  // 1/6 con bono = 3102.50*1.09/6 = 563.62; CTS = (3102.50+563.62)/2 = 1833.06.
  assert.equal(ctsSemester(conHijos, COMPANY, 2024, "nov"), 1833.06);
  // Nov 2026 (may–oct 2026): sueldo computable al cierre (RMV 1230 → AF 123) = 3123.
  // El 1/6 usa la gratificación de julio 2026, calculada al cierre del semestre
  // anterior (30-jun-2026, RMV 1130 → AF 113): 3113*1.09/6 = 565.53.
  // CTS = (3123 + 565.53)/2 = 1844.27.
  assert.equal(ctsSemester(conHijos, COMPANY, 2026, "nov"), 1844.27);
});
