import assert from "node:assert/strict";
import { test } from "node:test";
import { OCCUPATIONS, occupationName, searchOccupations } from "@/lib/hr/occupations";

test("la tabla 30 trae los ~4 600 códigos de 6 dígitos", () => {
  assert.ok(OCCUPATIONS.length > 4500, `se esperaban miles de códigos, hay ${OCCUPATIONS.length}`);
  for (const o of OCCUPATIONS) {
    assert.match(o.code, /^\d{6}$/);
    assert.ok(o.name.trim().length > 0, `descripción vacía para ${o.code}`);
  }
});

test("no hay códigos repetidos", () => {
  const codes = new Set(OCCUPATIONS.map((o) => o.code));
  assert.equal(codes.size, OCCUPATIONS.length);
});

test("occupationName devuelve la descripción y tolera vacíos", () => {
  assert.equal(occupationName("411001"), "Jefe De Abastecimiento");
  assert.equal(occupationName("411002"), "Jefe De Almacen");
  assert.equal(occupationName(undefined), undefined);
  assert.equal(occupationName(null), undefined);
  assert.equal(occupationName(""), undefined);
  assert.equal(occupationName("000000"), undefined);
});

test("searchOccupations filtra por texto ignorando tildes y mayúsculas", () => {
  const chofer = searchOccupations("chofer");
  assert.ok(chofer.length > 0);
  assert.ok(chofer.every((o) => o.name.toLowerCase().includes("chofer")));

  const mayus = searchOccupations("CHOFER");
  assert.deepEqual(mayus, chofer);

  const conTilde = searchOccupations("mecanico");
  assert.ok(conTilde.some((o) => /mec[aá]nico/i.test(o.name)));
});

test("searchOccupations filtra por código", () => {
  const r = searchOccupations("411001");
  assert.equal(r[0].code, "411001");
});

test("searchOccupations respeta el límite y el texto vacío", () => {
  assert.ok(searchOccupations("").length <= 50);
  assert.equal(searchOccupations("", 5).length, 5);
  assert.ok(searchOccupations("a", 3).length <= 3);
  assert.deepEqual(searchOccupations("zzzzzznada"), []);
});
