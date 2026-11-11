import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CESSATION_REASONS,
  ceaseEmployee,
  isRehire,
  rehireEmployee,
} from "@/lib/hr/cessation";
import { attachmentsOf, missingAttachments } from "@/lib/hr/attachment";
import type { Employee } from "@/lib/hr/types";

function emp(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "e1",
    companyId: "c1",
    code: "INM-001",
    names: "Ana",
    paternal: "Quispe",
    maternal: "Rojas",
    dni: "12345678",
    email: "",
    phone: "",
    birthDate: "1995-01-01",
    address: "",
    hireDate: "2024-03-01",
    endDate: null,
    status: "activo",
    areaId: "a1",
    position: "Analista",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 2000,
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
    salaryAccount: "",
    ctsBank: "BCP",
    ctsAccount: "",
    children: 0,
    vacationHistory: 0,
    ...overrides,
  };
}

test("ceaseEmployee marca cesado, fija la fecha y guarda el histórico", () => {
  const patch = ceaseEmployee(emp(), { endDate: "2026-06-30", reason: "Renuncia voluntaria", registeredAt: "2026-06-30" });
  assert.equal(patch.status, "cesado");
  assert.equal(patch.endDate, "2026-06-30");
  assert.equal(patch.cessations?.length, 1);
  assert.equal(patch.cessations?.[0].reason, "Renuncia voluntaria");
});

test("ceaseEmployee conserva ceses previos (reincorporación)", () => {
  const previo = emp({
    status: "activo",
    cessations: [{ endDate: "2025-12-31", reason: "Fin de contrato", registeredAt: "2025-12-31" }],
  });
  const patch = ceaseEmployee(previo, { endDate: "2026-06-30" });
  assert.equal(patch.cessations?.length, 2);
  assert.equal(patch.cessations?.[0].endDate, "2025-12-31");
  assert.equal(patch.cessations?.[1].endDate, "2026-06-30");
});

test("rehireEmployee reactiva con fecha nueva y limpia el fin de contrato", () => {
  const cesado = emp({ status: "cesado", endDate: "2026-06-30", cessations: [{ endDate: "2026-06-30", reason: "Renuncia", registeredAt: "2026-06-30" }] });
  const patch = rehireEmployee(cesado, { hireDate: "2026-08-01" });
  assert.equal(patch.status, "activo");
  assert.equal(patch.hireDate, "2026-08-01");
  assert.equal(patch.endDate, null);
  // No borra el histórico.
  assert.equal(patch.cessations, undefined);
});

test("isRehire detecta colaboradores con ceses previos", () => {
  assert.equal(isRehire(emp()), false);
  assert.equal(isRehire(emp({ cessations: [{ endDate: "2025-01-01", reason: "x", registeredAt: "2025-01-01" }] })), true);
});

test("CESSATION_REASONS incluye los motivos frecuentes", () => {
  assert.ok(CESSATION_REASONS.includes("Renuncia voluntaria"));
  assert.ok(CESSATION_REASONS.includes("Fin de contrato"));
});

test("attachmentsOf normaliza a objeto y missingAttachments avisa faltantes", () => {
  assert.deepEqual(attachmentsOf(emp()), {});
  const activo = missingAttachments(emp());
  assert.deepEqual(activo, ["tRegistroAlta", "contrato"]);
  const cesado = missingAttachments(emp({ status: "cesado" }));
  assert.ok(cesado.includes("tRegistroBaja"));
  const completo = missingAttachments(
    emp({
      attachments: {
        tRegistroAlta: { name: "a.pdf", dataUrl: "data:application/pdf;base64,AA", date: "2026-01-01" },
        contrato: { name: "c.pdf", dataUrl: "data:application/pdf;base64,AA", date: "2026-01-01" },
      },
    }),
  );
  assert.deepEqual(completo, []);
});
