import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcAdditional, calcAdditionals } from "./additionals.ts";
import type { Attendance, Employee } from "./types.ts";

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
    salaryAccount: "",
    ctsBank: "Interbank",
    ctsAccount: "",
    children: 0,
    vacationHistory: 0,
    ...overrides,
  };
}

function mark(overrides: Partial<Attendance> = {}): Attendance {
  return {
    id: "e1-2026-11-03",
    employeeId: "e1",
    companyId: "test",
    date: "2026-11-03",
    kind: "presente",
    checkIn: "08:00",
    checkOut: "17:00",
    extra25: 0,
    extra35: 0,
    ...overrides,
  };
}

// Sueldo 2400 → valor hora = 2400 / 30 / 8 = 10; valor diario = 80.
describe("calcAdditional", () => {
  it("paga las horas extra al 25% y 35%", () => {
    const row = calcAdditional(
      emp(),
      "2026-11",
      [mark({ extra25: 2, extra35: 1 })],
      undefined,
    );
    assert.equal(row.extra25Pay, 25); // 10 * 1.25 * 2
    assert.equal(row.extra35Pay, 13.5); // 10 * 1.35 * 1
    assert.equal(row.extraPay, 38.5);
  });

  it("descuenta la tardanza por minuto", () => {
    const row = calcAdditional(
      emp(),
      "2026-11",
      [mark({ kind: "tardanza", checkIn: "08:30" })],
      undefined,
    );
    assert.equal(row.lateMinutes, 30);
    assert.equal(row.lateDiscount, 5); // 10 / 60 * 30
  });

  it("no cuenta tardanza dentro de la tolerancia de 15 min", () => {
    const row = calcAdditional(
      emp(),
      "2026-11",
      [mark({ kind: "tardanza", checkIn: "08:10" })],
      undefined,
    );
    assert.equal(row.lateMinutes, 0);
    assert.equal(row.lateDiscount, 0);
  });

  it("paga el feriado trabajado con recargo del 100%", () => {
    // 28 de julio de 2026 es feriado (Fiestas Patrias).
    const full = calcAdditional(
      emp(),
      "2026-07",
      [mark({ date: "2026-07-28", checkIn: "08:00", checkOut: "17:00" })],
      undefined,
    );
    assert.equal(full.restDays.length, 1);
    assert.equal(full.holidayPay, 160); // 8 h * 10 * 2 = 2 sueldos diarios
  });

  it("paga medio día de domingo como 1 sueldo diario", () => {
    // 8 de noviembre de 2026 es domingo.
    const half = calcAdditional(
      emp(),
      "2026-11",
      [mark({ date: "2026-11-08", checkIn: "08:00", checkOut: "12:00" })],
      undefined,
    );
    assert.equal(half.restDays[0].label, "Domingo");
    assert.equal(half.holidayPay, 80); // 4 h * 10 * 2
  });

  it("no paga domingo si el colaborador no marcó asistencia", () => {
    const row = calcAdditional(emp(), "2026-11", [], undefined);
    assert.equal(row.holidayPay, 0);
  });

  it("suma comisión y bono; los vacíos valen 0", () => {
    const sin = calcAdditional(emp(), "2026-11", [], undefined);
    assert.equal(sin.commission, 0);
    assert.equal(sin.bonus, 0);

    const con = calcAdditional(emp(), "2026-11", [], [
      { id: "ad1", employeeId: "e1", companyId: "test", period: "2026-11", commission: 500, bonus: 200 },
    ]);
    assert.equal(con.commission, 500);
    assert.equal(con.bonus, 200);
  });

  it("el neto es la suma de lo pagado menos las tardanzas", () => {
    const row = calcAdditional(
      emp(),
      "2026-11",
      [
        mark({ date: "2026-11-08", checkIn: "08:00", checkOut: "17:00" }), // domingo: 160
        mark({ id: "e1-2026-11-04", date: "2026-11-04", kind: "tardanza", checkIn: "08:30" }), // 5
      ],
      [{ id: "ad1", employeeId: "e1", companyId: "test", period: "2026-11", commission: 300, bonus: 0 }],
    );
    assert.equal(row.grossAdditions, 460);
    assert.equal(row.total, 455);
  });

  it("calcula las filas de varios colaboradores", () => {
    const rows = calcAdditionals([emp(), emp({ id: "e2", code: "TST-002" })], "2026-11", [], undefined);
    assert.equal(rows.length, 2);
  });
});
