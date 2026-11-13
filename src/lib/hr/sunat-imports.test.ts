import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildExampleLine,
  buildFieldGuideCsv,
  importStructuresByDestination,
  IMPORT_STRUCTURES,
  resolveFileName,
  resolveFileNames,
} from "@/lib/hr/sunat-imports";

test("el catálogo cubre las estructuras del Anexo 3 sin repetir códigos", () => {
  assert.ok(IMPORT_STRUCTURES.length >= 25);
  const ids = IMPORT_STRUCTURES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  const codes = IMPORT_STRUCTURES.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("cada estructura trae al menos un archivo con campos numerados desde 1", () => {
  for (const s of IMPORT_STRUCTURES) {
    assert.ok(s.files.length >= 1, `${s.id} sin archivos`);
    for (const f of s.files) {
      assert.ok(f.fileName.length > 0, `${s.id} con nombre de archivo vacío`);
      assert.ok(f.fields.length > 0, `${s.id} ${f.fileName} sin campos`);
      f.fields.forEach((field, i) => assert.equal(field.n, i + 1, `${s.id} ${f.fileName} numeración`));
    }
  }
});

test("las estructuras se agrupan por destino", () => {
  const total = (["T-Registro", "PLAME", "Derechohabientes"] as const).reduce(
    (acc, d) => acc + importStructuresByDestination(d).length,
    0,
  );
  assert.equal(total, IMPORT_STRUCTURES.length);
});

test("resolveFileName reemplaza RUC, período y prefijo del formulario", () => {
  const parts = { ruc: "20512345678", period: "2026-11" };
  assert.equal(resolveFileName("RP_###########.tra", parts), "RP_20512345678.tra");
  assert.equal(resolveFileName("ffffaaaamm###########.rem", parts), "060120261120512345678.rem");
  assert.equal(resolveFileName("RP_###########.edu", parts), "RP_20512345678.edu");
});

test("resolveFileName arma el nombre de derechohabientes con la fecha de remisión", () => {
  const parts = { ruc: "20512345678", period: "2026-11", date: "2026-11-15" };
  assert.equal(
    resolveFileName("RD_RRRRRRRRRRR_DDMMAAAA_ALTA.TXT", parts),
    "RD_20512345678_15112026_ALTA.TXT",
  );
});

test("resolveFileNames devuelve un nombre por archivo de la estructura", () => {
  const e2 = IMPORT_STRUCTURES.find((s) => s.id === "E2")!;
  const names = resolveFileNames(e2, { ruc: "20512345678", period: "2026-11" });
  assert.deepEqual(names, ["RP_20512345678.edd", "RP_20512345678.ldd"]);
});

test("la guía de campos lista cada campo con encabezado", () => {
  const e18 = IMPORT_STRUCTURES.find((s) => s.id === "E18")!;
  const csv = buildFieldGuideCsv(e18, e18.files[0]);
  const lines = csv.split("\r\n");
  assert.equal(lines.length, e18.files[0].fields.length + 1);
  assert.match(lines[0], /Descripción/);
  assert.match(lines[1], /Tipo de documento del trabajador/);
});

test("la línea de ejemplo usa el separador “|” y la cantidad de campos", () => {
  const e1 = IMPORT_STRUCTURES.find((s) => s.id === "E1")!;
  const line = buildExampleLine(e1.files[0]);
  assert.equal(line.split(" | ").length, e1.files[0].fields.length);
});
