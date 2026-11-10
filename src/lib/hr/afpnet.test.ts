import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAfpnetRows, afpnetRowValues, AFPNET_HEADERS } from "./afpnet.ts";
import type { Employee, Payslip } from "./types.ts";

function emp(over: Partial<Employee> & { id: string }): Employee {
  return {
    code: "EMP-001",
    companyId: "inmoa",
    names: "Luisa",
    paternal: "García",
    maternal: "Álvarez",
    dni: "12345678",
    email: "",
    phone: "",
    birthDate: "1990-01-01",
    address: "",
    hireDate: "2026-01-01",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 1000,
    familyAllowance: false,
    fifthCategory: true,
    pension: "integra",
    cuspp: "123456ABCDE6",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "BCP",
    salaryAccount: "",
    ctsBank: "BCP",
    ctsAccount: "",
    children: 0,
    vacationHistory: 0,
    ...over,
  };
}

function slip(employeeId: string, pensionBase = 1000): Payslip {
  return {
    employeeId,
    period: "2026-11",
    factor: 1,
    lines: [],
    gross: 1000,
    discounts: 130,
    net: 870,
    essalud: 90,
    eps: 0,
    sctr: 0,
    sctrSalud: 0,
    sctrPension: 0,
    vidaLey: 0,
    pensionBase,
    fifth: 0,
    cts: null,
    cappedPension: false,
  };
}

describe("buildAfpnetRows", () => {
  it("declara solo a los afiliados a una AFP (excluye ONP y sin régimen)", () => {
    const employees = [
      emp({ id: "e1", pension: "integra", cuspp: "123456ABCDE6" }),
      emp({ id: "e2", pension: "onp", cuspp: "" }),
      emp({ id: "e3", pension: "ninguno", cuspp: "" }),
    ];
    const slips = [slip("e1"), slip("e2"), slip("e3")];
    const { rows, sinCuspp } = buildAfpnetRows(slips, employees, "2026-11");
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.cuspp, "123456ABCDE6");
    assert.equal(sinCuspp.length, 0);
  });

  it("separa a los afiliados a AFP que no tienen CUSPP", () => {
    const employees = [emp({ id: "e1", pension: "prima", cuspp: "" })];
    const { rows, sinCuspp } = buildAfpnetRows([slip("e1")], employees, "2026-11");
    assert.equal(rows.length, 0);
    assert.equal(sinCuspp.length, 1);
    assert.equal(sinCuspp[0]!.id, "e1");
  });

  it("numera la secuencia y usa la remuneración asegurable de la boleta", () => {
    const employees = [
      emp({ id: "e1", pension: "integra", cuspp: "AAA" }),
      emp({ id: "e2", pension: "habitat", cuspp: "BBB" }),
    ];
    const { rows } = buildAfpnetRows([slip("e1", 1000), slip("e2", 2500)], employees, "2026-11");
    assert.equal(rows[0]!.secuencia, 1);
    assert.equal(rows[1]!.secuencia, 2);
    assert.equal(rows[1]!.remuneracionAsegurable, 2500);
  });

  it("marca inicio y cese de relación laboral según el mes de devengue", () => {
    const employees = [
      emp({ id: "e1", pension: "integra", cuspp: "AAA", hireDate: "2026-11-05" }),
      emp({ id: "e2", pension: "integra", cuspp: "BBB", status: "cesado", endDate: "2026-11-20" }),
    ];
    const { rows } = buildAfpnetRows([slip("e1"), slip("e2")], employees, "2026-11");
    assert.equal(rows[0]!.inicioRl, "S");
    assert.equal(rows[0]!.ceseRl, "N");
    assert.equal(rows[1]!.inicioRl, "N");
    assert.equal(rows[1]!.ceseRl, "S");
  });

  it("produce 17 columnas en el orden del modelo AFPnet", () => {
    assert.equal(AFPNET_HEADERS.length, 17);
    const employees = [emp({ id: "e1", pension: "integra", cuspp: "123456ABCDE6" })];
    const { rows } = buildAfpnetRows([slip("e1", 1500)], employees, "2026-11");
    const values = afpnetRowValues(rows[0]!);
    assert.equal(values.length, 17);
    assert.equal(values[0], 1); // secuencia
    assert.equal(values[1], "123456ABCDE6"); // CUSPP
    assert.equal(values[2], "0"); // tipo doc = DNI
    assert.equal(values[3], "12345678"); // número de documento
    assert.equal(values[7], "S"); // relación laboral
    assert.equal(values[11], 1500); // remuneración asegurable
    assert.equal(values[16], ""); // AFP en blanco
  });
});
