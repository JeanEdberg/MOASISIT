import assert from "node:assert/strict";
import { test } from "node:test";
import { RMV_CURRENT, rmvForDate, rmvForPeriod } from "@/lib/hr/rmv";

test("rmvForDate devuelve la RMV vigente en la fecha indicada", () => {
  assert.equal(rmvForDate("2017-06-15"), 850);
  assert.equal(rmvForDate("2019-12-31"), 930);
  assert.equal(rmvForDate("2023-01-01"), 1025);
  assert.equal(rmvForDate("2025-06-30"), 1130);
  assert.equal(rmvForDate("2026-09-30"), 1130);
});

test("rmvForDate aplica el cambio desde su fecha exacta (01/10/2026)", () => {
  assert.equal(rmvForDate("2026-09-30"), 1130);
  assert.equal(rmvForDate("2026-10-01"), 1230);
  assert.equal(rmvForDate("2027-01-15"), 1230);
});

test("rmvForDate usa el valor más antiguo antes del primer registro", () => {
  assert.equal(rmvForDate("1990-01-01"), 345);
});

test("rmvForPeriod evalúa la RMV al primer día del mes de la planilla", () => {
  assert.equal(rmvForPeriod("2026-09"), 1130);
  assert.equal(rmvForPeriod("2026-10"), 1230);
  assert.equal(rmvForPeriod("2022-05"), 1025);
});

test("RMV_CURRENT coincide con el último cambio de la serie", () => {
  assert.equal(RMV_CURRENT, 1230);
});
