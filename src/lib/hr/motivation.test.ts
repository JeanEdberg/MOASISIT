import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dailyMessage } from "./motivation.ts";

describe("dailyMessage", () => {
  it("devuelve siempre un texto no vacío", () => {
    for (const iso of ["2026-01-01", "2026-06-15", "2026-11-15", "2026-12-31"]) {
      const msg = dailyMessage(iso);
      assert.equal(typeof msg, "string");
      assert.ok(msg.length > 0);
    }
  });

  it("es estable para la misma fecha (no depende del azar)", () => {
    assert.equal(dailyMessage("2026-11-15"), dailyMessage("2026-11-15"));
  });

  it("cambia de un día al siguiente", () => {
    assert.notEqual(dailyMessage("2026-11-15"), dailyMessage("2026-11-16"));
  });

  it("el mismo día da el mismo mensaje para cualquier empresa (determinista)", () => {
    // No recibe empresa: el texto depende solo de la fecha.
    assert.equal(dailyMessage("2026-03-09"), dailyMessage("2026-03-09"));
  });
});
