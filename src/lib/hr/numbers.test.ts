import assert from "node:assert/strict";
import { test } from "node:test";
import { numeroALetras } from "@/lib/hr/numbers";

test("numeroALetras: cero con centavos", () => {
  assert.equal(numeroALetras(0), "SON: CERO CON 00/100 SOLES");
});

test("numeroALetras: decenas, veintis y centenas", () => {
  assert.equal(numeroALetras(15), "SON: QUINCE CON 00/100 SOLES");
  assert.equal(numeroALetras(21), "SON: VEINTIUNO CON 00/100 SOLES");
  assert.equal(numeroALetras(100), "SON: CIEN CON 00/100 SOLES");
  assert.equal(numeroALetras(101), "SON: CIENTO UN CON 00/100 SOLES");
  assert.equal(numeroALetras(250), "SON: DOSCIENTOS CINCUENTA CON 00/100 SOLES");
});

test("numeroALetras: miles y centavos", () => {
  assert.equal(numeroALetras(1000), "SON: MIL CON 00/100 SOLES");
  assert.equal(numeroALetras(3393.17), "SON: TRES MIL TRESCIENTOS NOVENTA Y TRES CON 17/100 SOLES");
  assert.equal(numeroALetras(2100.5), "SON: DOS MIL CIEN CON 50/100 SOLES");
});

test("numeroALetras: valor no finito devuelve cadena vacía", () => {
  assert.equal(numeroALetras(Number.NaN), "");
});
