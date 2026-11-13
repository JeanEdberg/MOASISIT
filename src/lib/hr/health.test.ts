import assert from "node:assert/strict";
import { test } from "node:test";
import { ctsSemester, gratuityAmount, livePayslips } from "@/lib/hr/calc";
import {
  currentHealth,
  healthForDate,
  healthForPeriod,
  reconcileHealth,
  withHealthHistory,
} from "@/lib/hr/health";
import type { Company, Employee } from "@/lib/hr/types";

const COMPANY = {
  id: "c1",
  regime: "general",
  rmv: 1230,
  uit: 5500,
  essalud: 0.09,
  epsAporteTrabajador: 0.0225,
  insurers: [
    { id: "inmoa-eps-sanitas", name: "Sanitas EPS", kind: "eps", active: true, rate: 2.25 },
  ],
} as unknown as Company;

/** Ericka: ingresó en EsSalud y pasó a EPS el 01-sep-2026. */
function emp(patch: Partial<Employee> = {}): Employee {
  return {
    id: "e1",
    code: "EMP-001",
    companyId: "c1",
    names: "Ericka Carolina",
    paternal: "Coveñas",
    maternal: "Mogollón",
    dni: "47090484",
    email: "",
    phone: "",
    birthDate: "1993-05-14",
    address: "",
    hireDate: "2026-01-01",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Gerente General",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 3500,
    salaryHistory: [{ from: "2026-01-01", salary: 3500 }],
    familyAllowance: false,
    pension: "ninguno",
    cuspp: "",
    healthInsurance: "eps",
    healthHistory: [
      { from: "2026-01-01", healthInsurance: "essalud" },
      { from: "2026-09-01", healthInsurance: "eps", epsInsurerId: "inmoa-eps-sanitas" },
    ],
    epsInsurerId: "inmoa-eps-sanitas",
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    children: 0,
    vacationHistory: 0,
    fifthCategory: false,
    ...patch,
  } as unknown as Employee;
}

test("healthForDate devuelve la cobertura vigente en la fecha indicada", () => {
  const e = emp();
  assert.equal(healthForDate(e, "2026-08-31").healthInsurance, "essalud");
  assert.equal(healthForDate(e, "2026-09-01").healthInsurance, "eps");
  assert.equal(healthForDate(e, "2026-09-01").epsInsurerId, "inmoa-eps-sanitas");
});

test("healthForDate usa la cobertura más antigua antes del primer cambio", () => {
  assert.equal(healthForDate(emp(), "2025-06-01").healthInsurance, "essalud");
});

test("healthForDate sin histórico cae a la cobertura actual", () => {
  const e = emp({ healthHistory: undefined });
  assert.equal(healthForDate(e, "2026-05-01").healthInsurance, "eps");
  assert.equal(healthForDate(e, "2026-05-01").epsInsurerId, "inmoa-eps-sanitas");
});

test("healthForPeriod evalúa la cobertura al primer día del mes", () => {
  const e = emp();
  assert.equal(healthForPeriod(e, "2026-08").healthInsurance, "essalud");
  assert.equal(healthForPeriod(e, "2026-09").healthInsurance, "eps");
});

test("currentHealth devuelve la cobertura vigente hoy", () => {
  assert.equal(currentHealth(emp(), "2026-11-09").healthInsurance, "eps");
  assert.equal(currentHealth(emp(), "2026-03-15").healthInsurance, "essalud");
});

test("la gratificación de julio usa 9% (EsSalud) y la de Navidad 6.75% (EPS)", () => {
  const e = emp();
  // Julio 2026 cierra el 30-jun-2026: aún EsSalud → bonificación 9%.
  const julio = gratuityAmount(e, COMPANY, 2026, "julio");
  assert.equal(julio.bonif, Math.round(julio.grat * 0.09 * 100) / 100);
  // Navidad 2026 cierra el 31-dic-2026: ya EPS → bonificación 6.75%.
  const navidad = gratuityAmount(e, COMPANY, 2026, "navidad");
  assert.equal(navidad.bonif, Math.round(navidad.grat * 0.0675 * 100) / 100);
});

test("el 1/6 de la CTS de noviembre usa la cobertura al cierre del semestre anterior", () => {
  const e = emp();
  // Nov 2026 (may–oct): computable 3500. El 1/6 usa la gratificación de julio 2026,
  // cerrada el 30-jun-2026 con cobertura EsSalud (9%): 3500*1.09/6 = 635.83.
  const sexto = Math.round((3500 * 1.09 / 6) * 100) / 100;
  const expected = (3500 + sexto) / 2;
  assert.equal(ctsSemester(e, COMPANY, 2026, "nov"), Math.round(expected * 100) / 100);
});

test("la boleta marca EsSalud antes del alta en EPS y EPS después", () => {
  const e = emp();
  const agosto = livePayslips({ employees: [e], company: COMPANY, attendance: [] }, "2026-08")[0];
  const setiembre = livePayslips({ employees: [e], company: COMPANY, attendance: [] }, "2026-09")[0];
  const epsAgo = agosto.lines.find((l) => l.code === "EPS")?.amount ?? 0;
  const epsSet = setiembre.lines.find((l) => l.code === "EPS")?.amount ?? 0;
  assert.equal(epsAgo, 0);
  assert.ok(epsSet > 0, "en setiembre ya aporta a la EPS");
});

test("reconcileHealth crea el histórico con la cobertura de ingreso", () => {
  const e = reconcileHealth(emp({ healthHistory: undefined }));
  assert.deepEqual(e.healthHistory, [
    { from: "2026-01-01", healthInsurance: "eps", epsInsurerId: "inmoa-eps-sanitas" },
  ]);
});

test("reconcileHealth ordena y deja la cobertura actual igual al último cambio", () => {
  const e = reconcileHealth(
    emp({
      healthInsurance: "essalud",
      epsInsurerId: null,
      healthHistory: [
        { from: "2026-09-01", healthInsurance: "eps", epsInsurerId: "inmoa-eps-sanitas" },
        { from: "2026-01-01", healthInsurance: "essalud" },
      ],
    }),
  );
  assert.deepEqual(e.healthHistory, [
    { from: "2026-01-01", healthInsurance: "essalud" },
    { from: "2026-09-01", healthInsurance: "eps", epsInsurerId: "inmoa-eps-sanitas" },
  ]);
  assert.equal(e.healthInsurance, "eps");
  assert.equal(e.epsInsurerId, "inmoa-eps-sanitas");
});

test("withHealthHistory es idempotente cuando ya está completo", () => {
  const data = { employees: [emp()] };
  assert.equal(withHealthHistory(data), data);
});
