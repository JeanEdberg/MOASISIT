import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dailyVerse, VERSES } from "./verses.ts";

describe("VERSES", () => {
  it("trae una selección razonable y sin textos vacíos", () => {
    assert.ok(VERSES.length >= 100);
    for (const [ref, text] of VERSES) {
      assert.ok(ref.length > 0, "referencia vacía");
      assert.ok(text.trim().length > 0, `texto vacío en ${ref}`);
    }
  });

  it("incluye libros deuterocanónicos (canon católico)", () => {
    const refs = VERSES.map(([ref]) => ref).join(" | ");
    assert.match(refs, /Sabiduría|Eclesiástico|Tobit|Judit|Baruc|Macabeos/);
  });
});

describe("dailyVerse", () => {
  it("es estable para la misma persona y fecha", () => {
    assert.deepEqual(dailyVerse("e1", "2026-11-15"), dailyVerse("e1", "2026-11-15"));
  });

  it("cambia de un día al siguiente", () => {
    assert.notDeepEqual(dailyVerse("e1", "2026-11-15"), dailyVerse("e1", "2026-11-16"));
  });

  it("da versículos distintos a personas distintas el mismo día", () => {
    const a = dailyVerse("e1", "2026-11-15");
    const b = dailyVerse("e2", "2026-11-15");
    assert.notDeepEqual(a, b);
  });

  it("siempre devuelve una referencia y texto válidos", () => {
    for (const seed of ["", "e1", "colaborador-42", "rrhh"]) {
      const v = dailyVerse(seed, "2026-03-09");
      assert.equal(typeof v.ref, "string");
      assert.ok(v.text.length > 0);
    }
  });
});
