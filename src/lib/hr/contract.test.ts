import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildContract, trialPeriodDays } from "./contract.ts";
import { createDemo } from "./seed.ts";

const demo = () => createDemo();

describe("trialPeriodDays", () => {
  it("usa 90 días en el régimen general", () => {
    assert.equal(trialPeriodDays("general"), 90);
  });
  it("no aplica periodo de prueba a prácticas", () => {
    assert.equal(trialPeriodDays("practicante"), 0);
  });
});

describe("buildContract", () => {
  it("incluye los datos de la empresa y el colaborador", () => {
    const data = demo();
    const emp = data.employees.find((e) => e.companyId === "inmoa")!;
    const c = buildContract(data.company, emp);
    assert.match(c.preamble, new RegExp(data.company.name.split(" ")[0]!));
    assert.match(c.preamble, new RegExp(emp.dni));
    assert.equal(c.title, "Contrato de Trabajo");
  });

  it("trae las cláusulas clave de una relación laboral", () => {
    const data = demo();
    const emp = data.employees.find((e) => e.companyId === "inmoa")!;
    const c = buildContract(data.company, emp);
    const headings = c.clauses.map((cl) => cl.heading).join(" ");
    for (const key of ["Objeto", "Duración", "Jornada", "Remuneración", "Beneficios", "Seguridad social", "Terminación"]) {
      assert.match(headings, new RegExp(key));
    }
  });

  it("menciona la remuneración del colaborador", () => {
    const data = demo();
    const emp = data.employees.find((e) => e.companyId === "inmoa")!;
    const c = buildContract(data.company, emp);
    const remu = c.clauses.find((cl) => cl.heading.includes("Remuneración"))!;
    assert.ok(remu.body.length > 20);
  });

  it("usa el título de convenio para prácticas", () => {
    const data = demo();
    const emp = { ...data.employees[0]!, contract: "practicas" as const, regime: "practicante" as const };
    const c = buildContract(data.company, emp);
    assert.match(c.title, /Convenio de Prácticas/);
    assert.match(c.clauses[1]!.body, /no se pacta periodo de prueba/i);
  });

  it("siempre incluye la advertencia legal", () => {
    const data = demo();
    const c = buildContract(data.company, data.employees[0]!);
    assert.match(c.disclaimer, /asesoría laboral/i);
  });
});
