import assert from "node:assert/strict";
import { test } from "node:test";
import { ctsSemester, gratuityAmount, livePayslips } from "@/lib/hr/calc";
import { currentSalary, reconcileSalary, salaryForDate, salaryForPeriod, withSalaryHistory } from "@/lib/hr/salary";
import type { Company, Employee } from "@/lib/hr/types";

const COMPANY = {
  id: "c1",
  regime: "general",
  rmv: 1230,
  uit: 5500,
} as unknown as Company;

function emp(patch: Partial<Employee> = {}): Employee {
  return {
    id: "e1",
    code: "EMP-001",
    companyId: "c1",
    names: "Ericka Carolina",
    paternal: "Coveñas",
    maternal: "Mogollón",
    dni: "47090484",
    email: "ecovenas@inmoa.pe",
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
    salary: 3700,
    salaryHistory: [
      { from: "2026-01-01", salary: 3500 },
      { from: "2026-10-01", salary: 3700 },
    ],
    familyAllowance: false,
    pension: "ninguno",
    cuspp: "",
    healthInsurance: "essalud",
    workMode: "presencial",
    children: 0,
    vacationHistory: 0,
    fifthCategory: false,
    isDemo: true,
    ...patch,
  } as unknown as Employee;
}

test("salaryForDate devuelve el sueldo vigente en la fecha indicada", () => {
  const e = emp();
  assert.equal(salaryForDate(e, "2026-01-01"), 3500);
  assert.equal(salaryForDate(e, "2026-09-30"), 3500);
  assert.equal(salaryForDate(e, "2026-10-01"), 3700);
  assert.equal(salaryForDate(e, "2026-12-31"), 3700);
});

test("salaryForDate usa el sueldo más antiguo antes del primer cambio", () => {
  assert.equal(salaryForDate(emp(), "2025-06-01"), 3500);
});

test("salaryForDate sin histórico cae al sueldo actual", () => {
  const e = emp({ salaryHistory: undefined });
  assert.equal(salaryForDate(e, "2026-05-01"), 3700);
});

test("salaryForPeriod evalúa el sueldo al primer día del mes", () => {
  const e = emp();
  assert.equal(salaryForPeriod(e, "2026-09"), 3500);
  assert.equal(salaryForPeriod(e, "2026-10"), 3700);
});

test("currentSalary devuelve el sueldo vigente hoy", () => {
  assert.equal(currentSalary(emp(), "2026-11-09"), 3700);
  assert.equal(currentSalary(emp(), "2026-03-15"), 3500);
});

test("la boleta usa el sueldo vigente en el mes, no el último", () => {
  const e = emp();
  const sept = livePayslips({ employees: [e], company: COMPANY, attendance: [] }, "2026-09")[0];
  const oct = livePayslips({ employees: [e], company: COMPANY, attendance: [] }, "2026-10")[0];
  const basicSept = sept.lines.find((l) => l.code === "BAS")?.amount ?? 0;
  const basicOct = oct.lines.find((l) => l.code === "BAS")?.amount ?? 0;
  assert.equal(basicSept, 3500);
  assert.equal(basicOct, 3700);
});

test("el 1/6 de la CTS de noviembre usa el sueldo al cierre del semestre anterior", () => {
  const e = emp();
  // Nov 2026 (may–oct): computable al cierre = 3700. Gratificación de julio 2026
  // se calculó al cierre del semestre anterior (jun-2026) con sueldo 3500.
  const sexto = 3500 * 1.09 / 6;
  const expected = (3700 + sexto) / 2;
  assert.equal(ctsSemester(e, COMPANY, 2026, "nov"), Math.round(expected * 100) / 100);
});

test("la gratificación de julio usa el sueldo al cierre de su semestre", () => {
  const e = emp();
  // Julio 2026 cierra el 30-jun-2026: el sueldo aún era 3500 (el aumento rige
  // desde el 01-oct-2026). Seis meses completos → gratificación = 3500.
  const { grat, bonif } = gratuityAmount(e, COMPANY, 2026, "julio");
  assert.equal(grat, 3500);
  assert.equal(bonif, Math.round(3500 * 0.09 * 100) / 100);
});

test("reconcileSalary crea el histórico con el sueldo de ingreso", () => {
  const e = reconcileSalary(emp({ salaryHistory: undefined }));
  assert.deepEqual(e.salaryHistory, [{ from: "2026-01-01", salary: 3700 }]);
});

test("reconcileSalary ordena y deja salary igual al último cambio", () => {
  const e = reconcileSalary(
    emp({
      salary: 9999,
      salaryHistory: [
        { from: "2026-10-01", salary: 3700 },
        { from: "2026-01-01", salary: 3500 },
      ],
    }),
  );
  assert.deepEqual(e.salaryHistory, [
    { from: "2026-01-01", salary: 3500 },
    { from: "2026-10-01", salary: 3700 },
  ]);
  assert.equal(e.salary, 3700);
});

test("withSalaryHistory es idempotente cuando ya está completo", () => {
  const data = { employees: [emp()] };
  assert.equal(withSalaryHistory(data), data);
});
