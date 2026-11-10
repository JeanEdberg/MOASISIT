import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogInsurers, withInsurerCatalog } from "@/lib/hr/insurers";
import { createDemo } from "@/lib/hr/seed";
import type { Insurer } from "@/lib/hr/types";

test("catalogInsurers ofrece varias opciones por tipo (EPS, SCTR, Vida Ley)", () => {
  const insurers = catalogInsurers("inmoa");
  const byKind = (kind: Insurer["kind"]) => insurers.filter((i) => i.kind === kind);
  assert.ok(byKind("eps").length >= 5, "debe haber al menos 5 EPS");
  assert.ok(byKind("sctr").length >= 5, "debe haber al menos 5 SCTR");
  assert.ok(byKind("vida_ley").length >= 4, "debe haber al menos 4 Vida Ley");
});

test("catalogInsurers incluye las EPS reales del Perú", () => {
  const names = catalogInsurers("inmoa").map((i) => i.name);
  for (const expected of ["Rímac EPS", "Pacífico EPS", "Sanitas EPS", "La Positiva EPS", "MAPFRE EPS"]) {
    assert.ok(names.includes(expected), `falta ${expected}`);
  }
});

test("los ids del catálogo conservan los de la semilla previa (no rompen colaboradores)", () => {
  const ids = new Set(catalogInsurers("inmoa").map((i) => i.id));
  assert.ok(ids.has("inmoa-sctr-pacifico"));
  assert.ok(ids.has("inmoa-eps-sanitas"));
  assert.ok(ids.has("inmoa-vida-rimac"));
  const pollitos = new Set(catalogInsurers("7pollitos").map((i) => i.id));
  assert.ok(pollitos.has("7p-eps-pacifico"));
  assert.ok(pollitos.has("7p-sctr-lapositiva"));
  assert.ok(pollitos.has("7p-vida-mapfre"));
  const plumifero = new Set(catalogInsurers("plumifero").map((i) => i.id));
  assert.ok(plumifero.has("plu-eps-sanitas"));
  assert.ok(plumifero.has("plu-sctr-rimac"));
  assert.ok(plumifero.has("plu-vida-pacifico"));
});

test("la semilla expone todas las aseguradoras por empresa", () => {
  const data = createDemo();
  for (const company of data.companies) {
    const kinds = new Set(company.insurers.map((i) => i.kind));
    assert.ok(kinds.has("eps") && kinds.has("sctr") && kinds.has("vida_ley"), `${company.id} sin los 3 tipos`);
    assert.ok(company.insurers.filter((i) => i.kind === "eps").length >= 5, `${company.id} con pocas EPS`);
  }
});

test("withInsurerCatalog completa un dataset antiguo y es idempotente", () => {
  const full = createDemo();
  const old = {
    ...full,
    companies: full.companies.map((c) => ({
      ...c,
      insurers: c.insurers.filter((i) => ["inmoa-sctr-pacifico", "inmoa-eps-sanitas", "inmoa-vida-rimac"].includes(i.id)),
    })),
  };
  old.company = old.companies[0]!;

  const migrated = withInsurerCatalog(old);
  assert.notEqual(migrated, old, "debe devolver un objeto nuevo al haber cambios");
  const inmoa = migrated.companies.find((c) => c.id === "inmoa")!;
  assert.equal(inmoa.insurers.filter((i) => i.kind === "eps").length, 5);
  assert.equal(migrated.company.insurers.length, inmoa.insurers.length);

  // Segunda pasada: sin cambios -> mismo objeto (no reescribe la fila).
  assert.equal(withInsurerCatalog(migrated), migrated);
});

test("withInsurerCatalog conserva las tasas editadas por el usuario", () => {
  const full = createDemo();
  const edited = {
    ...full,
    companies: full.companies.map((c) => ({
      ...c,
      insurers: c.insurers.map((i) => (i.id === "inmoa-sctr-pacifico" ? { ...i, pensionRate: 1.23 } : i)),
    })),
  };
  const migrated = withInsurerCatalog(edited);
  const pacifico = migrated.companies
    .find((c) => c.id === "inmoa")!
    .insurers.find((i) => i.id === "inmoa-sctr-pacifico")!;
  assert.equal(pacifico.pensionRate, 1.23);
});
