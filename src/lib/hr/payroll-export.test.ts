import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPayrollRows } from "./payroll-export.ts";
import { createDemo } from "./seed.ts";
import type { Payslip } from "./types.ts";

function slip(over: Partial<Payslip> & { employeeId: string }): Payslip {
  return {
    period: "2026-11",
    factor: 1,
    lines: [],
    gross: 2000,
    discounts: 200,
    net: 1800,
    essalud: 180,
    eps: 0,
    sctr: 0,
    vidaLey: 0,
    pensionBase: 2000,
    fifth: 0,
    cts: null,
    cappedPension: false,
    ...over,
  };
}

describe("buildPayrollRows", () => {
  it("cruza cada boleta con su colaborador", () => {
    const data = createDemo();
    const emp = data.employees[0]!;
    const rows = buildPayrollRows([slip({ employeeId: emp.id })], data.employees);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.dni, emp.dni);
    assert.equal(rows[0]!.code, emp.code);
    assert.ok(rows[0]!.name.includes(emp.paternal));
    assert.equal(rows[0]!.net, 1800);
  });

  it("no falla si la boleta apunta a un colaborador ausente", () => {
    const rows = buildPayrollRows([slip({ employeeId: "no-existe" })], []);
    assert.equal(rows[0]!.name, "—");
    assert.equal(rows[0]!.dni, "");
  });
});
