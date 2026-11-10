import assert from "node:assert/strict";
import { test } from "node:test";
import { buildStatusChecks, overallLevel, pendingCount, type StatusFacts } from "@/lib/hr/status";

const base: StatusFacts = {
  databasePersistent: true,
  rucTokenConfigured: true,
  adminPasswordConfigured: true,
  companyCount: 3,
  employeeCount: 25,
  hasDemoPeople: false,
  isProduction: true,
  subscriptionsOverdue: 0,
  subscriptionsDueSoon: 0,
};

test("todo configurado devuelve solo chequeos en verde", () => {
  const checks = buildStatusChecks(base);
  assert.equal(overallLevel(checks), "ok");
  assert.equal(pendingCount(checks), 0);
  assert.ok(checks.every((c) => c.level === "ok"));
});

test("base de datos en memoria es crítico (danger)", () => {
  const checks = buildStatusChecks({ ...base, databasePersistent: false });
  const db = checks.find((c) => c.id === "db");
  assert.ok(db);
  assert.equal(db.level, "danger");
  assert.ok(db.fix);
  assert.equal(overallLevel(checks), "danger");
});

test("sin token de RUC queda en aviso, no crítico", () => {
  const checks = buildStatusChecks({ ...base, rucTokenConfigured: false });
  const ruc = checks.find((c) => c.id === "ruc");
  assert.ok(ruc);
  assert.equal(ruc.level, "warn");
  assert.equal(overallLevel(checks), "warn");
});

test("datos de ejemplo generan un aviso adicional", () => {
  const checks = buildStatusChecks({ ...base, hasDemoPeople: true });
  const demo = checks.find((c) => c.id === "demo");
  assert.ok(demo);
  assert.equal(demo.level, "warn");
  assert.equal(pendingCount(checks), 1);
});

test("una sola empresa se reporta como pendiente de configurar", () => {
  const checks = buildStatusChecks({ ...base, companyCount: 1, employeeCount: 5 });
  const companies = checks.find((c) => c.id === "companies");
  assert.ok(companies);
  assert.equal(companies.level, "warn");
  assert.match(companies.detail, /5 colaboradores/);
});

test("contraseña de admin automática queda en aviso", () => {
  const checks = buildStatusChecks({ ...base, adminPasswordConfigured: false });
  const admin = checks.find((c) => c.id === "admin");
  assert.ok(admin);
  assert.equal(admin.level, "warn");
});

test("suscripción vencida es crítico (danger)", () => {
  const checks = buildStatusChecks({ ...base, subscriptionsOverdue: 1 });
  const sub = checks.find((c) => c.id === "subscriptions");
  assert.ok(sub);
  assert.equal(sub.level, "danger");
  assert.equal(overallLevel(checks), "danger");
});

test("suscripción por vencer queda en aviso", () => {
  const checks = buildStatusChecks({ ...base, subscriptionsDueSoon: 2 });
  const sub = checks.find((c) => c.id === "subscriptions");
  assert.ok(sub);
  assert.equal(sub.level, "warn");
  assert.match(sub.title, /2 suscripciones/);
});

test("sin suscripciones en riesgo no agrega chequeo", () => {
  const checks = buildStatusChecks(base);
  assert.equal(checks.some((c) => c.id === "subscriptions"), false);
});
