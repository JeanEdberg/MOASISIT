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

  it("el superadmin ve todos los colaboradores de su empresa (sin restricción)", () => {
    const full = createDemo();
    const view = sanitizeForViewer(full, scope({ companyId: "inmoa" }));
    const inCompany = full.employees.filter((e) => e.companyId === "inmoa");
    assert.equal(view.employees.length, inCompany.length);
  });
});

describe("sanitizeForViewer — visibilidad de adjuntos", () => {
  const withAttachments = () => {
    const full = createDemo();
    return {
      ...full,
      employees: full.employees.map((e) =>
        e.companyId === "inmoa"
          ? {
              ...e,
              attachments: {
                tRegistroAlta: { name: "alta.pdf", dataUrl: "data:application/pdf;base64,AA", date: "2026-01-01" },
                contrato: { name: "contrato.pdf", dataUrl: "data:application/pdf;base64,BB", date: "2026-01-01" },
                tRegistroBaja: { name: "baja.pdf", dataUrl: "data:application/pdf;base64,CC", date: "2026-01-01" },
                liquidacion: { name: "liq.pdf", dataUrl: "data:application/pdf;base64,DD", date: "2026-01-01" },
              },
            }
          : e,
      ),
    };
  };

  it("RR.HH. ve el legajo completo", () => {
    const view = sanitizeForViewer(withAttachments(), scope({ role: "rrhh", companyId: "inmoa" }));
    const e = view.employees[0]!;
    assert.ok(e.attachments?.tRegistroAlta);
    assert.ok(e.attachments?.contrato);
    assert.ok(e.attachments?.tRegistroBaja);
    assert.ok(e.attachments?.liquidacion);
  });

  it("el colaborador ve su T-Registro de alta y su contrato, pero no la baja ni la liquidación", () => {
    const full = withAttachments();
    const me = full.employees.find((e) => e.companyId === "inmoa")!;
    const view = sanitizeForViewer(full, scope({ role: "colaborador", employeeId: me.id, companyId: "inmoa" }));
    const mine = view.employees.find((e) => e.id === me.id)!;
    assert.ok(mine.attachments?.tRegistroAlta);
    assert.ok(mine.attachments?.contrato);
    assert.equal(mine.attachments?.tRegistroBaja, undefined);
    assert.equal(mine.attachments?.liquidacion, undefined);
  });

  it("la jefatura no ve los adjuntos de su equipo", () => {
    const full = withAttachments();
    const boss = full.employees.find((e) => e.companyId === "inmoa")!;
    const report = { ...full.employees[1]!, managerId: boss.id, companyId: "inmoa" };
    const data = { ...full, employees: [boss, report, ...full.employees.slice(2)] };
    const view = sanitizeForViewer(data, scope({ role: "jefatura", employeeId: boss.id, companyId: "inmoa" }));
    const seen = view.employees.find((e) => e.id === report.id);
    assert.equal(seen?.attachments, undefined);
  });
});
