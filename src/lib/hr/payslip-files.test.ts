import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addPayslipFile, isValidPeriod, payslipFilesOf, removePayslipFile } from "@/lib/hr/payslip-files";
import type { EmployeePayslipFile } from "@/lib/hr/types";

const file = (period: string, name = "b.pdf"): Omit<EmployeePayslipFile, "id" | "uploadedAt"> => ({
  period,
  name,
  dataUrl: "data:application/pdf;base64,AA",
});

describe("isValidPeriod", () => {
  it("acepta el formato AAAA-MM", () => {
    assert.equal(isValidPeriod("2026-11"), true);
    assert.equal(isValidPeriod("2026-01"), true);
  });
  it("rechaza meses inválidos o formatos raros", () => {
    assert.equal(isValidPeriod("2026-13"), false);
    assert.equal(isValidPeriod("2026-00"), false);
    assert.equal(isValidPeriod("2026-1"), false);
    assert.equal(isValidPeriod("26-11"), false);
    assert.equal(isValidPeriod(""), false);
  });
});

describe("addPayslipFile", () => {
  it("agrega una boleta con id y fecha de carga", () => {
    const out = addPayslipFile([], { ...file("2026-09"), uploadedAt: "2026-11-11" });
    assert.equal(out.length, 1);
    assert.equal(out[0]!.period, "2026-09");
    assert.ok(out[0]!.id.startsWith("bp"));
    assert.equal(out[0]!.uploadedAt, "2026-11-11");
  });

  it("reemplaza la boleta del mismo mes (no duplica)", () => {
    const first = addPayslipFile([], file("2026-09", "viejo.pdf"));
    const second = addPayslipFile(first, file("2026-09", "nuevo.pdf"));
    assert.equal(second.length, 1);
    assert.equal(second[0]!.name, "nuevo.pdf");
  });

  it("ordena del mes más reciente al más antiguo", () => {
    let files = addPayslipFile([], file("2026-08"));
    files = addPayslipFile(files, file("2026-10"));
    files = addPayslipFile(files, file("2026-09"));
    assert.deepEqual(
      files.map((f) => f.period),
      ["2026-10", "2026-09", "2026-08"],
    );
  });

  it("no muta la lista original", () => {
    const original = addPayslipFile([], file("2026-08"));
    addPayslipFile(original, file("2026-09"));
    assert.equal(original.length, 1);
  });
});

describe("removePayslipFile", () => {
  it("quita por periodo", () => {
    const files = addPayslipFile(addPayslipFile([], file("2026-08")), file("2026-09"));
    const out = removePayslipFile(files, { period: "2026-08" });
    assert.deepEqual(
      out.map((f) => f.period),
      ["2026-09"],
    );
  });

  it("quita por id", () => {
    const files = addPayslipFile([], file("2026-08"));
    const out = removePayslipFile(files, { id: files[0]!.id });
    assert.equal(out.length, 0);
  });
});

describe("payslipFilesOf", () => {
  it("devuelve vacío si no hay boletas", () => {
    assert.deepEqual(payslipFilesOf({}), []);
  });
  it("ordena el histórico guardado", () => {
    const emp = {
      payslipFiles: [
        { id: "bp-1", uploadedAt: "2026-08-01", ...file("2026-08") },
        { id: "bp-2", uploadedAt: "2026-10-01", ...file("2026-10") },
      ] satisfies EmployeePayslipFile[],
    };
    assert.deepEqual(
      payslipFilesOf(emp).map((f) => f.period),
      ["2026-10", "2026-08"],
    );
  });
});
