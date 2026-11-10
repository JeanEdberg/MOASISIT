import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FIFTH_BANDS,
  DEFAULT_FIFTH_CATEGORY,
  fifthCategoryParamsOf,
  fifthTaxFromNet,
  projectFifthCategory,
  withFifthCategory,
} from "./fifth.ts";
import type { FifthCategoryParams, HrData } from "./types.ts";

const params = DEFAULT_FIFTH_CATEGORY;

describe("fifthTaxFromNet", () => {
  it("cobra 8% en el primer tramo (hasta 5 UIT)", () => {
    const uit = 5500;
    // 3 UIT de renta neta = 16,500 → 8%
    assert.equal(fifthTaxFromNet(3 * uit, uit, DEFAULT_FIFTH_BANDS), 3 * uit * 0.08);
  });

  it("aplica tasas acumulativas por tramos", () => {
    const uit = 5500;
    // Renta neta de 25 UIT: 5@8% + 15@14% + 5@17%
    const expected = 5 * uit * 0.08 + 15 * uit * 0.14 + 5 * uit * 0.17;
    assert.equal(Math.round(fifthTaxFromNet(25 * uit, uit, DEFAULT_FIFTH_BANDS) * 100) / 100, Math.round(expected * 100) / 100);
  });

  it("cobra 30% sobre el exceso de 45 UIT", () => {
    const uit = 5500;
    const expected = 5 * uit * 0.08 + 15 * uit * 0.14 + 15 * uit * 0.17 + 10 * uit * 0.2 + 5 * uit * 0.3;
    assert.equal(Math.round(fifthTaxFromNet(50 * uit, uit, DEFAULT_FIFTH_BANDS) * 100) / 100, Math.round(expected * 100) / 100);
  });

  it("no cobra nada con renta neta cero o negativa", () => {
    assert.equal(fifthTaxFromNet(0, 5500, DEFAULT_FIFTH_BANDS), 0);
    assert.equal(fifthTaxFromNet(-100, 5500, DEFAULT_FIFTH_BANDS), 0);
  });
});

describe("projectFifthCategory", () => {
  it("proyecta sueldo + gratificaciones y resta la deducción de 7 UIT", () => {
    const uit = 5500;
    const proj = projectFifthCategory({
      ordinaryMonthly: 3000,
      extrasMonthly: 0,
      gratificationsPerYear: 2,
      params,
      uit,
    });
    // 3000 * 14 = 42,000 anual
    assert.equal(proj.annualIncome, 42000);
    assert.equal(proj.deduction, 7 * uit);
    assert.equal(proj.taxable, 42000 - 7 * uit);
    assert.ok(proj.monthlyTax > 0);
    assert.equal(proj.monthlyTax, Math.round((proj.annualTax / 12) * 100) / 100);
  });

  it("no retiene si la renta anual no supera la deducción", () => {
    const proj = projectFifthCategory({
      ordinaryMonthly: 1000,
      extrasMonthly: 0,
      gratificationsPerYear: 2,
      params,
      uit: 5500,
    });
    // 1000 * 14 = 14,000 < 38,500
    assert.equal(proj.taxable, 0);
    assert.equal(proj.annualTax, 0);
    assert.equal(proj.monthlyTax, 0);
  });

  it("respeta una deducción en UIT distinta (p. ej. 8 UIT el próximo año)", () => {
    const custom: FifthCategoryParams = { deductionUit: 8, bands: DEFAULT_FIFTH_BANDS };
    const proj = projectFifthCategory({
      ordinaryMonthly: 3000,
      extrasMonthly: 0,
      gratificationsPerYear: 2,
      params: custom,
      uit: 5500,
    });
    assert.equal(proj.deduction, 8 * 5500);
  });
});

describe("fifthCategoryParamsOf", () => {
  it("usa los valores por defecto si la empresa no los tiene", () => {
    assert.deepEqual(fifthCategoryParamsOf({}), DEFAULT_FIFTH_CATEGORY);
  });

  it("conserva los parámetros guardados", () => {
    const stored: FifthCategoryParams = { deductionUit: 9, bands: [{ span: null, rate: 0.3 }] };
    assert.deepEqual(fifthCategoryParamsOf({ fifthCategory: stored }), stored);
  });
});

describe("withFifthCategory", () => {
  const baseData = () =>
    ({
      company: { id: "c1", uit: 5500 },
      companies: [{ id: "c1", uit: 5500 }],
      employees: [{ id: "e1", regime: "general" }],
    }) as unknown as HrData;

  it("completa parámetros y flag en datasets antiguos", () => {
    const data = baseData();
    const out = withFifthCategory(data);
    assert.ok(out.companies[0]!.fifthCategory);
    assert.equal(out.employees[0]!.fifthCategory, true);
  });

  it("es idempotente cuando ya están completos", () => {
    const once = withFifthCategory(baseData());
    const twice = withFifthCategory(once);
    assert.equal(once, twice);
  });
});
