import assert from "node:assert/strict";
import { test } from "node:test";
import { applyHrAction, authorizeAction } from "@/lib/hr/actions";
import { buildCompany, slugifyCompanyId, uniqueCompanyId, validateNewCompany, type NewCompanyInput } from "@/lib/hr/company";
import { createDemo } from "@/lib/hr/seed";

const input = (patch: Partial<NewCompanyInput> = {}): NewCompanyInput => ({
  ruc: "20614684799",
  name: "Agro Sur E.I.R.L.",
  shortName: "Agro Sur",
  tradeName: "Agro Sur",
  city: "Arequipa",
  address: "Av. Los Andes 100",
  email: "contacto@agrosur.pe",
  ...patch,
});

test("slugifyCompanyId limpia tildes y signos", () => {
  assert.equal(slugifyCompanyId("Los 7 Pollitos"), "los7pollitos");
  assert.equal(slugifyCompanyId("Plumífero"), "plumifero");
  assert.equal(slugifyCompanyId("  "), "empresa");
});

test("uniqueCompanyId evita chocar con ids existentes", () => {
  assert.equal(uniqueCompanyId("Agro Sur", ["inmoa", "7pollitos"]), "agrosur");
  assert.equal(uniqueCompanyId("INMOA", ["inmoa"]), "inmoa-2");
  assert.equal(uniqueCompanyId("INMOA", ["inmoa", "inmoa-2"]), "inmoa-3");
});

test("buildCompany arma la empresa con catálogo de seguros y parámetros", () => {
  const c = buildCompany(input(), "agrosur");
  assert.equal(c.id, "agrosur");
  assert.equal(c.ruc, "20614684799");
  assert.equal(c.shortName, "Agro Sur");
  assert.equal(c.brandName, "Moasist");
  assert.ok(c.insurers.some((i) => i.kind === "eps"));
  assert.ok(c.insurers.some((i) => i.kind === "sctr"));
  assert.ok(c.insurers.some((i) => i.kind === "vida_ley"));
  assert.ok(c.insurers.every((i) => i.id.startsWith("agrosur-")));
  assert.equal(c.rmv, 1230);
});

test("validateNewCompany exige razón social, RUC de 11 y nombre corto libre", () => {
  assert.equal(validateNewCompany(input(), []), null);
  assert.ok(validateNewCompany(input({ name: "  " }), []));
  assert.ok(validateNewCompany(input({ ruc: "123" }), []));
  assert.ok(validateNewCompany(input({ shortName: "INMOA" }), ["inmoa"]));
});

test("addCompany agrega la empresa y sus áreas, y es idempotente", () => {
  const data = createDemo();
  const company = buildCompany(input(), "agrosur");
  const next = applyHrAction(data, { type: "addCompany", company });
  assert.equal(next.companies.length, data.companies.length + 1);
  assert.ok(next.companies.some((c) => c.id === "agrosur"));
  assert.equal(next.areas.filter((a) => a.companyId === "agrosur").length, 2);

  const again = applyHrAction(next, { type: "addCompany", company });
  assert.equal(again.companies.length, next.companies.length, "no duplica si el id ya existe");
});

test("authorizeAction: crear empresa es solo del superadmin", () => {
  const data = createDemo();
  const action = { type: "addCompany", company: buildCompany(input(), "agrosur") } as const;
  assert.equal(authorizeAction(action, "superadmin", "", data), null);
  assert.ok(authorizeAction(action, "rrhh", "e2", data));
  assert.ok(authorizeAction(action, "jefatura", "e3", data));
});
