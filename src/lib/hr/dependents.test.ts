import assert from "node:assert/strict";
import { test } from "node:test";
import { countChildren, sexCode, withDependents, isChild, childDependents } from "@/lib/hr/dependents";
import type { Dependent, Employee } from "@/lib/hr/types";

function emp(patch: Partial<Employee>): Employee {
  return {
    id: "e1",
    code: "0001",
    companyId: "inmoa",
    names: "Ana",
    paternal: "Pérez",
    maternal: "López",
    dni: "45678912",
    email: "ana@inmoa.pe",
    phone: "987654321",
    birthDate: "1992-04-18",
    address: "Av. Siempre Viva 123",
    hireDate: "2024-01-15",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 3500,
    familyAllowance: false,
    fifthCategory: true,
    pension: "onp",
    cuspp: "",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "BCP",
    salaryAccount: "1",
    ctsBank: "BCP",
    ctsAccount: "1",
    children: 0,
    vacationHistory: 0,
    ...patch,
  } as Employee;
}

const hijo = (id: string, kind: Dependent["kind"] = "hijo"): Dependent => ({
  id,
  kind,
  names: "Hijo",
  paternal: "Pérez",
  maternal: "López",
  dni: "7000000" + id.slice(-1),
  birthDate: "2018-06-01",
  sex: "masculino",
});

test("sexCode traduce el sexo a 1/2 y deja vacío si no hay dato", () => {
  assert.equal(sexCode("masculino"), "1");
  assert.equal(sexCode("femenino"), "2");
  assert.equal(sexCode(undefined), "");
});

test("isChild reconoce hijos e hijos incapacitados", () => {
  assert.equal(isChild(hijo("d1")), true);
  assert.equal(isChild(hijo("d2", "hijo_incapacitado")), true);
  assert.equal(isChild(hijo("d3", "conyuge")), false);
});

test("withDependents deriva children y la asignación familiar de los hijos", () => {
  const e = withDependents(emp({ dependents: [hijo("d1"), hijo("d2"), hijo("d3", "conyuge")] }));
  assert.equal(e.children, 2); // el cónyuge no cuenta como hijo
  assert.equal(e.familyAllowance, true);
  assert.equal(childDependents(e).length, 2);
  assert.equal(countChildren(e), 2);
});

test("withDependents conserva el número de hijos si no hay detalle (CSV)", () => {
  const e = withDependents(emp({ children: 3, familyAllowance: true }));
  assert.equal(e.children, 3);
  assert.equal(e.familyAllowance, true);
  assert.equal(e.dependents, undefined);
});

test("withDependents apaga la asignación familiar sin hijos", () => {
  const e = withDependents(emp({ dependents: [hijo("d1", "conyuge")], children: 2, familyAllowance: true }));
  assert.equal(e.children, 0);
  assert.equal(e.familyAllowance, false);
});
