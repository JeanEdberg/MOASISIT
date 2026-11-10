import assert from "node:assert/strict";
import { test } from "node:test";
import { isRucOperativo, isValidRuc, normalizeRuc, parseRucResponse, rucStatusLabel } from "@/lib/hr/ruc";

test("normalizeRuc deja solo 11 dígitos", () => {
  assert.equal(normalizeRuc("20614684772"), "20614684772");
  assert.equal(normalizeRuc("20-614.684-772"), "20614684772");
  assert.equal(normalizeRuc("  20614684772123  "), "20614684772");
  assert.equal(normalizeRuc(""), "");
});

test("isValidRuc exige 11 dígitos y un prefijo válido", () => {
  assert.ok(isValidRuc("20614684772"));
  assert.ok(isValidRuc("10456789012"));
  assert.ok(isValidRuc("15512345678"));
  assert.ok(isValidRuc("20131312955"));
  assert.ok(!isValidRuc("1234567890"), "diez dígitos no vale");
  assert.ok(!isValidRuc("30614684772"), "prefijo inválido");
  assert.ok(!isValidRuc(""));
});

test("parseRucResponse traduce la respuesta de apis.net.pe", () => {
  const info = parseRucResponse({
    razonSocial: "INMOA LOGISTICA Y SOLUCIONES E.I.R.L.",
    numeroDocumento: "20614684772",
    estado: "ACTIVO",
    condicion: "HABIDO",
    direccion: "JR. LA CULTURA MZA. J7 LOTE 1A",
    distrito: "TAMBOPATA",
    provincia: "TAMBOPATA",
    departamento: "MADRE DE DIOS",
  });
  assert.ok(info);
  assert.equal(info.ruc, "20614684772");
  assert.equal(info.razonSocial, "INMOA LOGISTICA Y SOLUCIONES E.I.R.L.");
  assert.equal(info.distrito, "TAMBOPATA");
  assert.equal(rucStatusLabel(info), "ACTIVO · HABIDO");
  assert.ok(isRucOperativo(info));
});

test("parseRucResponse devuelve null cuando el RUC no existe", () => {
  assert.equal(parseRucResponse({ message: "ruc no valido" }), null);
  assert.equal(parseRucResponse(null), null);
  assert.equal(parseRucResponse({ razonSocial: "" }), null);
});

test("isRucOperativo distingue un contribuyente dado de baja", () => {
  const info = parseRucResponse({
    razonSocial: "EMPRESA X S.A.C.",
    numeroDocumento: "20123456789",
    estado: "BAJA",
    condicion: "NO HABIDO",
  });
  assert.ok(info);
  assert.ok(!isRucOperativo(info));
  assert.equal(rucStatusLabel(info), "BAJA · NO HABIDO");
});
