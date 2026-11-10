import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  chargeDateInMonth,
  DEFAULT_SUBSCRIPTION,
  daysInMonth,
  followingChargeDate,
  lastDayOfMonth,
  nextChargeDate,
  prorateFirstCharge,
  subscriptionAlert,
  subscriptionOf,
  type Subscription,
} from "./subscription.ts";

const sub = (patch: Partial<Subscription> = {}): Subscription => ({ ...DEFAULT_SUBSCRIPTION, ...patch });

describe("fechas de cobro", () => {
  it("usa el último día del mes cuando billingDay es null", () => {
    assert.equal(chargeDateInMonth("2026-02-10", null), "2026-02-28");
    assert.equal(chargeDateInMonth("2026-11-05", null), "2026-11-30");
    assert.equal(lastDayOfMonth("2026-02-10"), "2026-02-28");
  });

  it("respeta el día configurado", () => {
    assert.equal(chargeDateInMonth("2026-11-05", 30), "2026-11-30");
    assert.equal(chargeDateInMonth("2026-11-05", 15), "2026-11-15");
  });

  it("ajusta el día al último del mes cuando no existe", () => {
    assert.equal(chargeDateInMonth("2026-02-10", 31), "2026-02-28");
  });

  it("nextChargeDate devuelve el mismo día si cae hoy o después", () => {
    assert.equal(nextChargeDate("2026-11-15", 30), "2026-11-30");
    assert.equal(nextChargeDate("2026-11-30", 30), "2026-11-30");
    assert.equal(nextChargeDate("2026-12-01", 30), "2026-12-30");
  });

  it("followingChargeDate salta al mes siguiente", () => {
    assert.equal(followingChargeDate("2026-11-30", 30), "2026-12-30");
    assert.equal(followingChargeDate("2026-11-15", null), "2026-12-31");
  });

  it("daysInMonth calcula los días reales", () => {
    assert.equal(daysInMonth("2026-02-01"), 28);
    assert.equal(daysInMonth("2024-02-01"), 29);
    assert.equal(daysInMonth("2026-11-01"), 30);
  });
});

describe("prorateFirstCharge", () => {
  it("prorratea el mes de alta (18 → 30 de 30 días)", () => {
    const p = prorateFirstCharge(300, "2026-11-18", null);
    assert.equal(p.chargeDate, "2026-11-30");
    assert.equal(p.daysCharged, 13);
    assert.equal(p.daysInMonth, 30);
    assert.equal(p.prorated, true);
    assert.equal(p.amount, 130); // 300 * 13/30
  });

  it("cobra el mes completo si el alta cae el día de cobro", () => {
    const p = prorateFirstCharge(300, "2026-11-30", null);
    assert.equal(p.prorated, false);
    assert.equal(p.amount, 300);
  });

  it("cobra el mes completo si el alta es el primer día", () => {
    const p = prorateFirstCharge(300, "2026-11-01", null);
    assert.equal(p.chargeDate, "2026-11-30");
    assert.equal(p.daysCharged, 30);
    assert.equal(p.prorated, false);
    assert.equal(p.amount, 300);
  });

  it("usa el día de cobro configurado", () => {
    const p = prorateFirstCharge(200, "2026-11-10", 15);
    assert.equal(p.chargeDate, "2026-11-15");
    assert.equal(p.daysCharged, 6);
    assert.equal(p.amount, 40); // 200 * 6/30
  });

  it("nunca cobra negativo", () => {
    const p = prorateFirstCharge(-50, "2026-11-18", null);
    assert.equal(p.monthly, 0);
    assert.equal(p.amount, 0);
  });
});

describe("subscriptionAlert", () => {
  it("avisa cuando está vencida", () => {
    const a = subscriptionAlert(sub({ paidUntil: "2026-11-01" }), "2026-11-08");
    assert.equal(a.level, "danger");
    assert.equal(a.daysLeft, -7);
    assert.match(a.title, /vencida hace 7/);
  });

  it("avisa el mismo día del vencimiento", () => {
    const a = subscriptionAlert(sub({ paidUntil: "2026-11-08" }), "2026-11-08");
    assert.equal(a.level, "warn");
    assert.equal(a.daysLeft, 0);
  });

  it("avisa cuando está por vencer (7 días o menos)", () => {
    const a = subscriptionAlert(sub({ paidUntil: "2026-11-12" }), "2026-11-08");
    assert.equal(a.level, "warn");
    assert.equal(a.daysLeft, 4);
  });

  it("queda en verde cuando falta más de una semana", () => {
    const a = subscriptionAlert(sub({ paidUntil: "2026-12-30" }), "2026-11-08");
    assert.equal(a.level, "ok");
    assert.equal(a.nextCharge, "2026-12-30");
  });

  it("no cobra si está cancelada", () => {
    const a = subscriptionAlert(sub({ status: "cancelada", paidUntil: "2026-12-30" }), "2026-11-08");
    assert.equal(a.level, "warn");
    assert.equal(a.nextCharge, null);
    assert.match(a.title, /cancelada/i);
  });

  it("pide fecha de alta si no hay datos", () => {
    const a = subscriptionAlert(sub(), "2026-11-08");
    assert.equal(a.nextCharge, null);
    assert.match(a.title, /sin fecha/i);
  });
});

describe("subscriptionOf", () => {
  it("completa los valores faltantes con los por defecto", () => {
    const s = subscriptionOf({ subscription: { monthlyPrice: 99, billingDay: 15, startDate: "2026-11-01", paidUntil: "2026-11-15", status: "activa" } });
    assert.equal(s.monthlyPrice, 99);
    assert.equal(s.billingDay, 15);
  });

  it("devuelve los por defecto si la empresa no tiene suscripción", () => {
    assert.deepEqual(subscriptionOf({}), DEFAULT_SUBSCRIPTION);
  });
});
