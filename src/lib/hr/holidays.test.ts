import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { holidaysForYear, holidayName, isHoliday, isRestDay, isSunday } from "./holidays.ts";

describe("holidays", () => {
  it("incluye los feriados de fecha fija", () => {
    const year = holidaysForYear(2026);
    const dates = year.map((h) => h.date);
    for (const d of ["2026-01-01", "2026-05-01", "2026-07-28", "2026-07-29", "2026-12-25"]) {
      assert.ok(dates.includes(d), `falta ${d}`);
    }
  });

  it("calcula Jueves y Viernes Santo (fechas movibles)", () => {
    // Pascua 2026: 5 de abril → Jueves Santo 2 de abril, Viernes Santo 3 de abril.
    assert.equal(holidayName("2026-04-02"), "Jueves Santo");
    assert.equal(holidayName("2026-04-03"), "Viernes Santo");
    // Pascua 2025: 20 de abril → Jueves 17, Viernes 18.
    assert.equal(holidayName("2025-04-17"), "Jueves Santo");
    assert.equal(holidayName("2025-04-18"), "Viernes Santo");
  });

  it("funciona para cualquier año sin mantenimiento manual", () => {
    // Pascua 2027: 28 de marzo → Jueves 25, Viernes 26.
    assert.equal(holidayName("2027-03-25"), "Jueves Santo");
    assert.equal(isHoliday("2030-07-28"), true);
  });

  it("detecta domingos", () => {
    assert.equal(isSunday("2026-11-08"), true); // domingo
    assert.equal(isSunday("2026-11-09"), false); // lunes
  });

  it("marca como descanso el domingo y el feriado", () => {
    assert.equal(isRestDay("2026-11-08"), true); // domingo
    assert.equal(isRestDay("2026-07-28"), true); // feriado
    assert.equal(isRestDay("2026-11-09"), false); // lunes hábil
  });
});
