import assert from "node:assert/strict";
import { test } from "node:test";
import {
  benefitShare,
  employeeRegimeFor,
  gratificationsPerYear,
  mypeResolutionWarning,
  normalizeCompanyRegime,
  regimeBenefits,
  requiresMypeResolution,
  vacationDaysPerYear,
  withCompanyRegime,
} from "@/lib/hr/regime";
import { buildCompany } from "@/lib/hr/company";
import { createDemo } from "@/lib/hr/seed";

test("normalizeCompanyRegime cae a general ante valores inválidos", () => {
  assert.equal(normalizeCompanyRegime("micro"), "micro");
  assert.equal(normalizeCompanyRegime("mype"), "mype");
  assert.equal(normalizeCompanyRegime(undefined), "general");
  assert.equal(normalizeCompanyRegime("otro"), "general");
});

test("employeeRegimeFor traduce el régimen de empresa al del colaborador", () => {
  assert.equal(employeeRegimeFor("general"), "general");
  assert.equal(employeeRegimeFor("mype"), "general");
  assert.equal(employeeRegimeFor("pequena"), "pequena");
  assert.equal(employeeRegimeFor("micro"), "micro");
});

test("beneficios por régimen: la MYPE se calcula como general", () => {
  assert.equal(benefitShare("general"), 1);
  assert.equal(benefitShare("mype"), 1);
  assert.equal(benefitShare("pequena"), 0.5);
  assert.equal(benefitShare("micro"), 0);

  assert.equal(vacationDaysPerYear("general"), 30);
  assert.equal(vacationDaysPerYear("mype"), 30);
  assert.equal(vacationDaysPerYear("pequena"), 15);
  assert.equal(vacationDaysPerYear("micro"), 15);

  assert.equal(gratificationsPerYear("general"), 2);
  assert.equal(gratificationsPerYear("mype"), 2);
  assert.equal(gratificationsPerYear("pequena"), 1);
  assert.equal(gratificationsPerYear("micro"), 0);

  assert.equal(regimeBenefits("micro").cts, "No aplica");
  assert.equal(regimeBenefits("pequena").cts, "50%");
});

test("requiresMypeResolution solo para pequeña y micro", () => {
  assert.equal(requiresMypeResolution("pequena"), true);
  assert.equal(requiresMypeResolution("micro"), true);
  assert.equal(requiresMypeResolution("general"), false);
  assert.equal(requiresMypeResolution("mype"), false);
});

test("mypeResolutionWarning avisa cuando falta la resolución", () => {
  assert.equal(mypeResolutionWarning({ regime: "general" }), null);
  assert.ok(mypeResolutionWarning({ regime: "pequena" }));
  assert.ok(mypeResolutionWarning({ regime: "micro", mypeResolutionNumber: "0001" }));
  assert.equal(
    mypeResolutionWarning({ regime: "pequena", mypeResolutionNumber: "0001-2026", mypeResolutionDate: "2026-01-15" }),
    null,
  );
});

test("buildCompany guarda el régimen y la resolución", () => {
  const c = buildCompany(
    {
      ruc: "20614684799",
      name: "Agro Sur E.I.R.L.",
      shortName: "Agro Sur",
      tradeName: "Agro Sur",
      city: "Arequipa",
      address: "Av. Los Andes 100",
      email: "contacto@agrosur.pe",
      regime: "pequena",
      mypeResolutionNumber: "0001-2026",
      mypeResolutionDate: "2026-01-15",
    },
    "agrosur",
  );
  assert.equal(c.regime, "pequena");
  assert.equal(c.mypeResolutionNumber, "0001-2026");
  assert.equal(c.mypeResolutionDate, "2026-01-15");
});

test("withCompanyRegime completa empresas antiguas y es idempotente", () => {
  const data = createDemo();
  const legacy = {
    ...data,
    companies: data.companies.map((c) => {
      const { regime: _r, mypeResolutionNumber: _n, mypeResolutionDate: _d, ...rest } = c;
      return rest as typeof c;
    }),
  };
  const migrated = withCompanyRegime(legacy);
  assert.ok(migrated.companies.every((c) => c.regime === "general"));
  assert.ok(migrated.companies.every((c) => typeof c.mypeResolutionNumber === "string"));

  const again = withCompanyRegime(migrated);
  assert.equal(again, migrated, "no cambia si ya está migrado");
});
