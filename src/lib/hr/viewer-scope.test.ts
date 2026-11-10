import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { activeCompanyId, sanitizeForViewer, type ViewerScope } from "./viewer-scope.ts";
import { createDemo } from "./seed.ts";

const scope = (over: Partial<ViewerScope>): ViewerScope => ({
  role: "superadmin",
  employeeId: "",
  companyId: "inmoa",
  ...over,
});

describe("sanitizeForViewer — alcance por empresa", () => {
  it("el superadmin solo recibe los colaboradores de su empresa activa", () => {
    const view = sanitizeForViewer(createDemo(), scope({ companyId: "7pollitos" }));
    assert.ok(view.employees.length > 0);
    assert.ok(view.employees.every((e) => e.companyId === "7pollitos"));
    assert.equal(view.company.id, "7pollitos");
  });

  it("el superadmin ve el selector con todas las empresas", () => {
    const view = sanitizeForViewer(createDemo(), scope({ companyId: "inmoa" }));
    assert.ok(view.companies.length > 1);
  });

  it("al cambiar de empresa cambian los colaboradores visibles", () => {
    const full = createDemo();
    const inmoa = sanitizeForViewer(full, scope({ companyId: "inmoa" }));
    const pollitos = sanitizeForViewer(full, scope({ companyId: "7pollitos" }));
    assert.notEqual(inmoa.employees.length, pollitos.employees.length);
    assert.ok(inmoa.employees.every((e) => e.companyId === "inmoa"));
    assert.ok(pollitos.employees.every((e) => e.companyId === "7pollitos"));
  });

  it("las boletas congeladas también se limitan a la empresa activa", () => {
    const full = createDemo();
    const ids = new Set(full.employees.filter((e) => e.companyId === "inmoa").map((e) => e.id));
    const view = sanitizeForViewer(full, scope({ companyId: "inmoa" }));
    for (const slips of Object.values(view.snapshots)) {
      assert.ok(slips.every((s) => ids.has(s.employeeId)));
    }
  });

  it("un RR.HH. de empresa no ve el selector de otras empresas", () => {
    const view = sanitizeForViewer(createDemo(), scope({ role: "rrhh", companyId: "inmoa" }));
    assert.equal(view.companies.length, 1);
    assert.ok(view.employees.every((e) => e.companyId === "inmoa"));
  });

  it("activeCompanyId cae a la primera empresa si la sesión apunta a una inexistente", () => {
    const full = createDemo();
    assert.equal(activeCompanyId(full, { role: "superadmin", companyId: "no-existe" }), full.companies[0]!.id);
  });
});
