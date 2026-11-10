import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyHrAction, authorizeAction, type HrAction } from "./actions.ts";
import { createDemo, withDemoFlags } from "./seed.ts";
import type { HrData } from "./types.ts";

const base = (): HrData => createDemo();

describe("authorizeAction", () => {
  it("lets RR.HH. edit an employee's salary", () => {
    const data = base();
    const action: HrAction = { type: "updateEmployee", id: "e3", patch: { salary: 3800 } };
    assert.equal(authorizeAction(action, "rrhh", "e2", data), null);
  });

  it("blocks a colaborador from editing anyone, including themselves", () => {
    const data = base();
    const action: HrAction = { type: "updateEmployee", id: "e3", patch: { salary: 9999 } };
    assert.ok(authorizeAction(action, "colaborador", "e3", data));
  });

  it("blocks a jefatura from editing a ficha", () => {
    const data = base();
    const action: HrAction = { type: "updateEmployee", id: "e4", patch: { position: "Otro" } };
    assert.ok(authorizeAction(action, "jefatura", "e3", data));
  });

  it("lets a jefatura decide a request from a direct report", () => {
    let data = base();
    data = applyHrAction(data, {
      type: "addRequest",
      request: { id: "r9", employeeId: "e4", companyId: "inmoa", kind: "permiso", start: "2026-11-20", end: "2026-11-20", status: "pendiente", note: "", createdAt: "2026-11-09" },
    });
    const action: HrAction = { type: "decideRequest", id: "r9", status: "aprobada" };
    assert.equal(authorizeAction(action, "jefatura", "e3", data), null);
  });

  it("blocks a jefatura from deciding their own request", () => {
    const data = base();
    const action: HrAction = { type: "decideRequest", id: "r1", status: "aprobada" };
    assert.ok(authorizeAction(action, "jefatura", "e3", data));
  });

  it("blocks a jefatura from deciding a request outside their team", () => {
    let data = base();
    data = applyHrAction(data, {
      type: "addRequest",
      request: { id: "r8", employeeId: "e6", companyId: "inmoa", kind: "permiso", start: "2026-11-21", end: "2026-11-21", status: "pendiente", note: "", createdAt: "2026-11-09" },
    });
    const action: HrAction = { type: "decideRequest", id: "r8", status: "aprobada" };
    assert.ok(authorizeAction(action, "jefatura", "e3", data));
  });

  it("blocks a colaborador from clocking in for someone else", () => {
    const data = base();
    const action: HrAction = {
      type: "upsertAttendance",
      row: { id: "", employeeId: "e4", companyId: "inmoa", date: "2026-11-09", kind: "presente", checkIn: "08:00", checkOut: "17:00", extra25: 0, extra35: 0 },
    };
    assert.ok(authorizeAction(action, "colaborador", "e3", data));
  });
});

describe("applyHrAction", () => {
  it("applies a salary raise and keeps the id", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateEmployee", id: "e3", patch: { salary: 3800, position: "Jefe de Planta" } });
    const emp = next.employees.find((e) => e.id === "e3");
    assert.equal(emp?.salary, 3800);
    assert.equal(emp?.position, "Jefe de Planta");
    assert.equal(emp?.id, "e3");
  });

  it("changing the pension scheme is persisted", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateEmployee", id: "e4", patch: { pension: "habitat", regime: "general" } });
    assert.equal(next.employees.find((e) => e.id === "e4")?.pension, "habitat");
  });

  it("a wrong name can be corrected", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateEmployee", id: "e5", patch: { names: "Peter John" } });
    assert.equal(next.employees.find((e) => e.id === "e5")?.names, "Peter John");
  });

  it("marks a collaborator as ceased with an end date", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateEmployee", id: "e6", patch: { status: "cesado", endDate: "2026-11-30" } });
    const emp = next.employees.find((e) => e.id === "e6");
    assert.equal(emp?.status, "cesado");
    assert.equal(emp?.endDate, "2026-11-30");
  });

  it("does not mutate the input dataset", () => {
    const data = base();
    const before = data.employees.find((e) => e.id === "e3")?.salary;
    applyHrAction(data, { type: "updateEmployee", id: "e3", patch: { salary: 1 } });
    assert.equal(data.employees.find((e) => e.id === "e3")?.salary, before);
  });

  it("computes late arrival from the clock-in time", () => {
    const data = base();
    const next = applyHrAction(data, {
      type: "upsertAttendance",
      row: { id: "", employeeId: "e3", companyId: "inmoa", date: "2026-11-09", kind: "presente", checkIn: "08:40", checkOut: "17:00", extra25: 0, extra35: 0 },
    });
    const mark = next.attendance.find((a) => a.id === "e3-2026-11-09");
    assert.equal(mark?.kind, "tardanza");
  });

  it("clearDemoPeople removes demo people from every company", () => {
    const next = applyHrAction(base(), { type: "clearDemoPeople" });
    assert.equal(next.employees.length, 0);
    assert.equal(next.requests.length, 0);
    assert.equal(next.attendance.length, 0);
  });

  it("clearDemoPeople keeps real people who share the demo email domain", () => {
    const data = base();
    const real = { ...data.employees[0]!, id: "real-1", email: "jefa.real@inmoa.pe", isDemo: undefined };
    const next = applyHrAction({ ...data, employees: [...data.employees, real] }, { type: "clearDemoPeople" });
    assert.deepEqual(next.employees.map((e) => e.id), ["real-1"]);
  });

  it("withDemoFlags migrates an old dataset that lacks the isDemo mark", () => {
    const data = base();
    const legacy: HrData = { ...data, employees: data.employees.map(({ isDemo: _drop, ...e }) => e) };
    const migrated = withDemoFlags(legacy);
    assert.ok(migrated.employees.every((e) => e.isDemo === true));
    assert.equal(applyHrAction(migrated, { type: "clearDemoPeople" }).employees.length, 0);
  });

  it("withDemoFlags leaves an already-migrated dataset untouched", () => {
    const data = base();
    assert.equal(withDemoFlags(data), data);
  });

  it("updateCompanySubscription edits only the target company", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateCompanySubscription", companyId: "7pollitos", patch: { monthlyPrice: 150, status: "cancelada" } });
    const pollitos = next.companies.find((c) => c.id === "7pollitos");
    const inmoa = next.companies.find((c) => c.id === "inmoa");
    assert.equal(pollitos?.subscription.monthlyPrice, 150);
    assert.equal(pollitos?.subscription.status, "cancelada");
    assert.notEqual(inmoa?.subscription.status, "cancelada");
  });

  it("updateCompany persiste en companies (no solo en el snapshot de vista)", () => {
    const data = base();
    const next = applyHrAction(data, { type: "updateCompany", patch: { name: "Razón nueva" }, companyId: "inmoa" });
    assert.equal(next.companies.find((c) => c.id === "inmoa")?.name, "Razón nueva");
    assert.equal(next.company.name, "Razón nueva");
  });

  it("updateCompany no toca otras empresas cuando se indica su id", () => {
    const data = base();
    const original = data.companies.find((c) => c.id === "inmoa")!.name;
    const next = applyHrAction(data, { type: "updateCompany", patch: { name: "Solo mía" }, companyId: "7pollitos" });
    assert.equal(next.companies.find((c) => c.id === "7pollitos")?.name, "Solo mía");
    assert.equal(next.companies.find((c) => c.id === "inmoa")?.name, original);
  });


  it("removeCompany deletes the company and everything that belongs to it", () => {
    const data = base();
    const next = applyHrAction(data, { type: "removeCompany", companyId: "7pollitos" });
    assert.equal(next.companies.some((c) => c.id === "7pollitos"), false);
    assert.equal(next.employees.some((e) => e.companyId === "7pollitos"), false);
    assert.equal(next.areas.some((a) => a.companyId === "7pollitos"), false);
    assert.equal(next.attendance.some((a) => a.companyId === "7pollitos"), false);
    assert.equal(next.documents.some((d) => d.companyId === "7pollitos"), false);
    // Las otras empresas siguen intactas.
    assert.equal(next.employees.some((e) => e.companyId === "inmoa"), true);
  });

  it("removeCompany reassigns the active company when it deletes it", () => {
    const data = { ...base(), company: base().companies[1]! };
    const next = applyHrAction(data, { type: "removeCompany", companyId: "7pollitos" });
    assert.equal(next.company.id, "inmoa");
  });

  it("removeCompany refuses to delete the last remaining company", () => {
    const data = base();
    const single = { ...data, companies: [data.companies[0]!], company: data.companies[0]! };
    const next = applyHrAction(single, { type: "removeCompany", companyId: "inmoa" });
    assert.equal(next.companies.length, 1);
  });

  it("authorizeAction blocks non-superadmin from removing a company", () => {
    const data = base();
    assert.ok(authorizeAction({ type: "removeCompany", companyId: "inmoa" }, "rrhh", "", data));
    assert.ok(authorizeAction({ type: "updateCompanySubscription", companyId: "inmoa", patch: {} }, "rrhh", "", data));
    assert.equal(authorizeAction({ type: "removeCompany", companyId: "inmoa" }, "superadmin", "", data), null);
  });
});

describe("contrato automático al dar de alta", () => {
  const newEmployee = (over: Partial<HrData["employees"][number]> = {}): HrData["employees"][number] => ({
    id: "e99",
    code: "EMP-099",
    companyId: "inmoa",
    names: "Ana",
    paternal: "Quispe",
    maternal: "Rojas",
    dni: "12345678",
    email: "ana@inmoa.pe",
    phone: "",
    birthDate: "1994-05-05",
    address: "Puerto Maldonado",
    hireDate: "2026-11-01",
    endDate: "2027-05-01",
    status: "activo",
    areaId: "a2",
    position: "Asistente",
    managerId: null,
    contract: "plazo_fijo",
    regime: "general",
    salary: 2000,
    familyAllowance: false,
    pension: "onp",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "",
    salaryAccount: "",
    ctsBank: "",
    ctsAccount: "",
    children: 0,
    vacationHistory: 0,
    isDemo: false,
    ...over,
  });

  it("crea el documento de contrato pendiente al agregar una persona", () => {
    const next = applyHrAction(base(), { type: "addEmployee", employee: newEmployee() });
    const doc = next.documents.find((d) => d.employeeId === "e99" && d.kind === "contrato");
    assert.ok(doc, "debe existir el contrato");
    assert.equal(doc!.status, "pendiente");
    assert.equal(doc!.date, "2026-11-01");
  });

  it("no duplica el contrato si el id ya existe", () => {
    const once = applyHrAction(base(), { type: "addEmployee", employee: newEmployee() });
    const twice = applyHrAction(once, { type: "addEmployee", employee: newEmployee() });
    const count = twice.documents.filter((d) => d.id === "d-cto-e99").length;
    assert.equal(count, 1);
  });

  it("genera un contrato por cada persona importada", () => {
    const next = applyHrAction(base(), {
      type: "importPeople",
      employees: [newEmployee({ id: "e98", dni: "87654321" }), newEmployee({ id: "e97", dni: "11223344" })],
      areas: [],
    });
    assert.ok(next.documents.some((d) => d.id === "d-cto-e98"));
    assert.ok(next.documents.some((d) => d.id === "d-cto-e97"));
  });
});
