import assert from "node:assert/strict";
import { test } from "node:test";
import { companyShortName, greeting } from "@/lib/hr/format";

const INMOA = { shortName: "INMOA", tradeName: "INMOA Soluciones", name: "INMOA Logística y Soluciones E.I.R.L." };
const PLUMIFERO = { shortName: "Plumífero", tradeName: "Plumífero", name: "Inversiones y Negociaciones Plumífero E.I.R.L." };

test("companyShortName uses the explicit short name", () => {
  assert.equal(companyShortName(INMOA), "INMOA");
  assert.equal(companyShortName(PLUMIFERO), "Plumífero");
});

test("companyShortName falls back to tradeName, then to the first word", () => {
  assert.equal(companyShortName({ tradeName: "Los 7 Pollitos" }), "Los 7 Pollitos");
  assert.equal(companyShortName({ name: "Inversiones y Negociaciones Plumífero E.I.R.L." }), "Inversiones");
  assert.equal(companyShortName({}), "la empresa");
});

test("rrhh and superadmin are greeted with the active company", () => {
  assert.equal(greeting("rrhh", INMOA), "Hola, INMOA");
  assert.equal(greeting("superadmin", PLUMIFERO), "Hola, Plumífero");
  assert.equal(greeting("rrhh", PLUMIFERO, "Randy"), "Hola, Plumífero");
});

test("employee and jefatura are greeted by their first name", () => {
  assert.equal(greeting("colaborador", INMOA, "Randy Alberto"), "Hola, Randy");
  assert.equal(greeting("jefatura", PLUMIFERO, "María Elena"), "Hola, María");
});

test("falls back to the company when there is no employee name", () => {
  assert.equal(greeting("colaborador", INMOA, null), "Hola, INMOA");
  assert.equal(greeting("colaborador", INMOA, "  "), "Hola, INMOA");
});
