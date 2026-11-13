import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildContract, contractFileName, montoEnLetras, numeroALetras, plazoMonths } from "./contract.ts";
import { createDemo } from "./seed.ts";

const demo = () => createDemo();

describe("numeroALetras", () => {
  it("escribe unidades y decenas", () => {
    assert.equal(numeroALetras(1), "UNO");
    assert.equal(numeroALetras(16), "DIECISÉIS");
    assert.equal(numeroALetras(25), "VEINTICINCO");
    assert.equal(numeroALetras(60), "SESENTA");
  });
  it("escribe centenas y miles", () => {
    assert.equal(numeroALetras(100), "CIEN");
    assert.equal(numeroALetras(250), "DOSCIENTOS CINCUENTA");
    assert.equal(numeroALetras(1000), "MIL");
    assert.equal(numeroALetras(2500), "DOS MIL QUINIENTOS");
    assert.equal(numeroALetras(3700), "TRES MIL SETECIENTOS");
  });
});

describe("montoEnLetras", () => {
  it("agrega el sufijo legal de soles", () => {
    assert.equal(montoEnLetras(2500), "DOS MIL QUINIENTOS CON 00/100 NUEVOS SOLES");
  });
  it("incluye los céntimos", () => {
    assert.equal(montoEnLetras(1130.5), "MIL CIENTO TREINTA CON 50/100 NUEVOS SOLES");
  });
});

describe("plazoMonths", () => {
  it("cuenta los meses de un plazo fijo, incluyendo el mes de inicio", () => {
    assert.equal(plazoMonths("2026-10-01", "2027-04-01"), 7);
  });
  it("nunca baja de un mes", () => {
    assert.equal(plazoMonths("2026-10-01", "2026-10-05"), 1);
  });
});

describe("buildContract", () => {
  it("usa la plantilla de plazo fijo por necesidad de mercado", () => {
    const data = demo();
    const emp = { ...data.employees[0]!, contract: "plazo_fijo" as const, endDate: "2027-04-01" };
    const c = buildContract(data.company, emp);
    assert.match(c.title, /NECESIDAD DE MERCADO/);
    assert.equal(c.clauses.length, 9);
    assert.match(c.clauses[0]!.heading, /PRIMERO/);
    assert.match(c.clauses[8]!.heading, /NOVENO/);
  });

  it("incluye los datos de la empresa y del colaborador en el encabezado", () => {
    const data = demo();
    const emp = data.employees.find((e) => e.companyId === "inmoa")!;
    const c = buildContract(data.company, emp);
    assert.match(c.preamble, new RegExp(emp.dni));
    assert.match(c.preamble, new RegExp(data.company.ruc));
    assert.match(c.preamble, new RegExp(emp.paternal.toUpperCase()));
  });

  it("escribe el plazo y el monto en letras", () => {
    const data = demo();
    // Alta nueva: sin histórico, el sueldo es el de ingreso (2500).
    const emp = { ...data.employees[0]!, contract: "plazo_fijo" as const, hireDate: "2026-10-01", endDate: "2027-04-01", salary: 2500, salaryHistory: undefined };
    const c = buildContract(data.company, emp);
    assert.match(c.clauses[2]!.body, /SIETE \(7\) meses/);
    assert.match(c.clauses[4]!.body, /DOS MIL QUINIENTOS CON 00\/100 NUEVOS SOLES/);
  });

  it("cambia el título y la base legal para indefinido y prácticas", () => {
    const data = demo();
    const indefinido = buildContract(data.company, { ...data.employees[0]!, contract: "indefinido" });
    assert.match(indefinido.title, /INDETERMINADO/);
    const practicas = buildContract(data.company, {
      ...data.employees[0]!,
      contract: "practicas",
      regime: "practicante",
    });
    assert.match(practicas.title, /PRÁCTICAS/);
    assert.match(practicas.preamble, /28518/);
  });

  it("cierra con la fecha de suscripción y siempre incluye la advertencia", () => {
    const data = demo();
    const emp = { ...data.employees[0]!, hireDate: "2026-10-01" };
    const c = buildContract(data.company, emp);
    assert.match(c.closing, /día 01 del mes de octubre del 2026/);
    assert.match(c.disclaimer, /asesoría laboral/i);
  });

  it("arma el nombre de archivo con el colaborador y el tipo", () => {
    const data = demo();
    const emp = data.employees[0]!;
    assert.match(contractFileName(emp), /Contrato - /);
  });
});
