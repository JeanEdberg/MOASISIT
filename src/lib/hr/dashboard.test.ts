import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pendingRestDayMarks, restDayLabel } from "./dashboard.ts";
import type { Attendance, Employee } from "./types.ts";

const employee = (id: string, paternal: string): Employee =>
  ({ id, paternal, names: "Ana", maternal: "Díaz", position: "Operaria" }) as Employee;

const mark = (id: string, employeeId: string, date: string, kind: Attendance["kind"] = "presente"): Attendance =>
  ({ id, employeeId, companyId: "inmoa", date, kind, checkIn: "09:00", checkOut: "18:00", extra25: 0, extra35: 0 });

const people = [employee("e1", "Alva"), employee("e2", "Bravo")];

describe("restDayLabel", () => {
  it("nombra el feriado antes que el domingo", () => {
    assert.match(restDayLabel("2026-12-25") ?? "", /Feriado/);
    assert.equal(restDayLabel("2026-11-15"), "Domingo");
    assert.equal(restDayLabel("2026-11-16"), null);
  });
});

describe("pendingRestDayMarks", () => {
  it("lista solo marcas trabajadas en domingo o feriado", () => {
    const marks = [
      mark("m1", "e1", "2026-11-15"), // domingo
      mark("m2", "e2", "2026-11-16"), // lunes: no cuenta
      mark("m3", "e1", "2026-12-25"), // feriado
    ];
    const alerts = pendingRestDayMarks(marks, people);
    assert.deepEqual(alerts.map((a) => a.id), ["m3", "m1"]); // más reciente primero
    assert.equal(alerts[0]!.label, "Feriado: Navidad");
    assert.equal(alerts[1]!.label, "Domingo");
  });

  it("ignora faltas y descansos planificados", () => {
    const marks = [mark("m1", "e1", "2026-11-15", "falta"), mark("m2", "e2", "2026-11-15", "descanso")];
    assert.equal(pendingRestDayMarks(marks, people).length, 0);
  });

  it("excluye las marcas ya revisadas", () => {
    const marks = [mark("m1", "e1", "2026-11-15"), mark("m2", "e2", "2026-11-15")];
    const alerts = pendingRestDayMarks(marks, people, ["m1"]);
    assert.deepEqual(alerts.map((a) => a.id), ["m2"]);
  });

  it("ignora marcas de colaboradores fuera de la vista", () => {
    const marks = [mark("m1", "desconocido", "2026-11-15")];
    assert.equal(pendingRestDayMarks(marks, people).length, 0);
  });
});
