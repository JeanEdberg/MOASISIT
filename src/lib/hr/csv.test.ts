import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CSV_SAMPLE, parseEmployeeCsv } from "./csv.ts";
import type { Area } from "./types.ts";

const noAreas: Area[] = [];

describe("parseEmployeeCsv", () => {
  it("importa la plantilla completa con todos los campos", () => {
    const res = parseEmployeeCsv(CSV_SAMPLE, noAreas, 0, "inmoa");
    assert.equal(res.errors.length, 0);
    assert.equal(res.employees.length, 3);
    const ana = res.employees.find((e) => e.dni === "45678912")!;
    assert.equal(ana.position, "Analista");
    assert.equal(ana.salary, 3500);
    assert.equal(ana.phone, "987654321");
    assert.equal(ana.birthDate, "1992-04-18");
    assert.equal(ana.address, "Av. Siempre Viva 123");
    assert.equal(ana.salaryBank, "BCP");
    assert.equal(ana.children, 1);
    assert.equal(ana.familyAllowance, true);
  });

  it("respeta contrato, régimen y modalidad de la plantilla", () => {
    const res = parseEmployeeCsv(CSV_SAMPLE, noAreas, 0, "inmoa");
    const rosa = res.employees.find((e) => e.dni === "45566778")!;
    assert.equal(rosa.contract, "practicas");
    assert.equal(rosa.regime, "practicante");
    assert.equal(rosa.endDate, "2026-08-01");
  });

  it("resuelve el jefe por DNI aunque aparezca después", () => {
    const res = parseEmployeeCsv(CSV_SAMPLE, noAreas, 0, "inmoa");
    const luis = res.employees.find((e) => e.dni === "40112233")!;
    assert.equal(luis.managerId, "imp-45678912");
  });

  it("crea las áreas que falten", () => {
    const res = parseEmployeeCsv(CSV_SAMPLE, noAreas, 0, "inmoa");
    assert.equal(res.areas.length, 3);
    assert.ok(res.areas.some((a) => a.name === "Finanzas"));
  });

  it("acepta un CSV mínimo solo con las columnas obligatorias", () => {
    const csv = `nombres,paterno,dni,cargo,area,sueldo,ingreso
Juan,Quispe,12345678,Operario,Planta,1500,2026-01-02`;
    const res = parseEmployeeCsv(csv, noAreas, 0, "inmoa");
    assert.equal(res.errors.length, 0);
    assert.equal(res.employees[0]!.contract, "indefinido");
    assert.equal(res.employees[0]!.workMode, "presencial");
    assert.equal(res.employees[0]!.salaryBank, "BCP");
  });

  it("avisa si falta una columna obligatoria", () => {
    const csv = `nombres,dni,cargo,area,sueldo,ingreso\nJuan,12345678,Operario,Planta,1500,2026-01-02`;
    const res = parseEmployeeCsv(csv, noAreas, 0, "inmoa");
    assert.ok(res.errors.some((e) => /paterno/.test(e)));
    assert.equal(res.employees.length, 0);
  });

  it("rechaza un DNI repetido dentro del archivo", () => {
    const csv = `nombres,paterno,dni,cargo,area,sueldo,ingreso\nJuan,Quispe,12345678,Operario,Planta,1500,2026-01-02\nAna,Quispe,12345678,Operario,Planta,1500,2026-01-02`;
    const res = parseEmployeeCsv(csv, noAreas, 0, "inmoa");
    assert.equal(res.employees.length, 1);
    assert.ok(res.errors.some((e) => /repetido/.test(e)));
  });

  it("ignora un valor desconocido y usa el por defecto", () => {
    const csv = `nombres,paterno,dni,cargo,area,sueldo,ingreso,pension,contrato\nJuan,Quispe,12345678,Operario,Planta,1500,2026-01-02,banco_falso,zzz`;
    const res = parseEmployeeCsv(csv, noAreas, 0, "inmoa");
    assert.equal(res.employees[0]!.pension, "onp");
    assert.equal(res.employees[0]!.contract, "indefinido");
  });

  it("avisa si el jefe indicado no está en el archivo", () => {
    const csv = `nombres,paterno,dni,cargo,area,sueldo,ingreso,jefe_dni\nJuan,Quispe,12345678,Operario,Planta,1500,2026-01-02,99999999`;
    const res = parseEmployeeCsv(csv, noAreas, 0, "inmoa");
    assert.equal(res.employees.length, 1);
    assert.ok(res.errors.some((e) => /99999999/.test(e)));
  });
});
