import assert from "node:assert/strict";
import { test } from "node:test";
import {
  benefitShare,
  employeeRegimeFor,
  gratificationsPerYear,
  mypeAccreditationWarning,
  normalizeCompanyRegime,
  regimeBenefits,
  requiresMypeAccreditation,
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

test("requiresMypeAccreditation solo para pequeña y micro", () => {
  assert.equal(requiresMypeAccreditation("pequena"), true);
  assert.equal(requiresMypeAccreditation("micro"), true);
  assert.equal(requiresMypeAccreditation("general"), false);
  assert.equal(requiresMypeAccreditation("mype"), false);
});

test("mypeAccreditationWarning avisa cuando falta la fecha de la constancia", () => {
  assert.equal(mypeAccreditationWarning({ regime: "general" }), null);
  assert.ok(mypeAccreditationWarning({ regime: "pequena" }));
  assert.ok(mypeAccreditationWarning({ regime: "micro" }));
  assert.equal(mypeAccreditationWarning({ regime: "pequena", mypeAccreditationDate: "2026-01-15" }), null);
});

test("buildCompany guarda el régimen y la constancia de acreditación", () => {
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
      mypeAccreditationDate: "2026-01-15",
    },
    "agrosur",
  );
  assert.equal(c.regime, "pequena");
  assert.equal(c.mypeAccreditationDate, "2026-01-15");
});

test("withCompanyRegime completa empresas antiguas y es idempotente", () => {
  const data = createDemo();
  const legacy = {
    ...data,
    companies: data.companies.map((c) => {
      const { regime: _r, mypeAccreditationDate: _d, ...rest } = c;
      return rest as typeof c;
    }),
  };
  const migrated = withCompanyRegime(legacy);
  assert.ok(migrated.companies.every((c) => c.regime === "general"));
  assert.ok(migrated.companies.every((c) => typeof c.mypeAccreditationDate === "string"));

  const again = withCompanyRegime(migrated);
  assert.equal(again, migrated, "no cambia si ya está migrado");
});
