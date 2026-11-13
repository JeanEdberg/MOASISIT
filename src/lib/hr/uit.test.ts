import assert from "node:assert/strict";
import { test } from "node:test";
import { UIT_CURRENT, UIT_CURRENT_YEAR, uitForDate, uitForPeriod, uitForYear } from "@/lib/hr/uit";

test("uitForYear devuelve la UIT vigente del año indicado", () => {
  assert.equal(uitForYear(2019), 4200);
  assert.equal(uitForYear(2020), 4300);
  assert.equal(uitForYear(2021), 4400);
  assert.equal(uitForYear(2022), 4600);
  assert.equal(uitForYear(2023), 4950);
  assert.equal(uitForYear(2024), 5150);
  assert.equal(uitForYear(2025), 5350);
  assert.equal(uitForYear(2026), 5500);
});

test("uitForYear usa el valor más antiguo antes del primer registro", () => {
  assert.equal(uitForYear(1991), 1040);
  assert.equal(uitForYear(1992), 1040);
});

test("uitForYear usa el último valor para años posteriores a la serie", () => {
  assert.equal(uitForYear(2030), 5500);
});

test("uitForPeriod evalúa la UIT por el año de la planilla", () => {
  assert.equal(uitForPeriod("2026-01"), 5500);
  assert.equal(uitForPeriod("2025-12"), 5350);
  assert.equal(uitForPeriod("2023-07"), 4950);
});

test("uitForDate evalúa la UIT por el año de la fecha", () => {
  assert.equal(uitForDate("2024-12-31"), 5150);
  assert.equal(uitForDate("2025-01-01"), 5350);
});

test("UIT_CURRENT coincide con el último año de la serie", () => {
  assert.equal(UIT_CURRENT, 5500);
  assert.equal(UIT_CURRENT_YEAR, 2026);
});
