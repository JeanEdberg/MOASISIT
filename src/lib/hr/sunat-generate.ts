/**
 * Pre-llenado de las plantillas del Anexo 3 de SUNAT con los datos reales de la
 * app (colaboradores, derechohabientes, asistencia y boletas). Genera el archivo
 * de texto plano (campos separados por “|”, sin encabezado) listo para revisar.
 *
 * Módulo PURO (sin React ni base de datos) para poder probarlo.
 *
 * Versiones de referencia (investigación 2026-11):
 *   - PDT PLAME vigente: versión 4.7 (R.S. N.° 000213-2026/SUNAT, obligatoria
 *     desde el período octubre 2026).
 *   - Estructuras de importación: Anexo 3 JUL23 (E1–E31), sin cambios en 4.4–4.7.
 *   - Tablas paramétricas vigentes al 12/11/2026.
 *
 * Cada estructura se genera con los datos de la app cuando los tiene. Las que
 * la app aún no administra (pensionistas, prestadores de 4ta, personal de
 * terceros, pesqueros, sindicato público) se entregan como PLANTILLA: una línea
 * con la posición de cada campo, para completarla a mano. El campo `kind`
 * distingue “datos” de “plantilla”.
 */

import type { Attendance, Company, Dependent, Employee, Payslip } from "@/lib/hr/types";
import { activeInsurer } from "@/lib/hr/calc";
import { sexCode } from "@/lib/hr/dependents";
import { todayIso } from "@/lib/hr/format";
import {
  IMPORT_STRUCTURES,
  resolveFileName,
  formatDdMmYyyy,
  type ImportDestination,
} from "@/lib/hr/sunat-imports";
import { NATIONALITY_DEFAULT } from "@/lib/hr/sunat-tables";

export type GenerateContext = {
  company: Company;
  employees: Employee[];
  attendance: Attendance[];
  slips: Payslip[];
  /** Período en formato "AAAA-MM". */
  period: string;
  /** Fecha de remisión (derechohabientes). Por defecto, hoy. */
  date?: string;
};

export type GeneratedFile = {
  structureId: string;
  destination: ImportDestination;
  /** Nombre exigido por SUNAT, ya resuelto a RUC/período. */
  fileName: string;
  /** Filas de datos (sin encabezado), separadas por “|”. */
  lines: string[];
  /** "datos" = filas reales; "plantilla" = posición de campos para completar. */
  kind: "datos" | "plantilla";
  /** Campos que la app no guarda y quedaron vacíos. */
  missing: string[];
  /** Avisos a revisar antes de subir. */
  warnings: string[];
};

/** Borrador devuelto por cada generador: el nombre aún lleva los marcadores. */
type Draft = Omit<GeneratedFile, "fileName"> & { fileNameTemplate: string };

const TD_DNI = "01";
const NACIONALIDAD_PERU = NATIONALITY_DEFAULT;

/** Régimen laboral (tabla 33). Prácticas no es régimen laboral: se omite. */
const REGIMEN_LABORAL: Record<string, string> = {
  general: "01",
  pequena: "17",
  micro: "16",
};

/** Tipo de contrato / condición laboral (tabla 12). */
const TIPO_CONTRATO: Record<string, string> = {
  indefinido: "01",
  plazo_fijo: "09",
};

/** Régimen pensionario (tabla 11). */
const REGIMEN_PENSIONARIO: Record<string, string> = {
  onp: "02",
  integra: "21",
  profuturo: "23",
  prima: "24",
  habitat: "25",
};

/** Entidades del sistema financiero (tabla 36), por palabra clave del banco. */
const BANCO_CODIGO: { match: RegExp; code: string }[] = [
  { match: /bcp|cr[eé]dito del per[uú]/i, code: "002" },
  { match: /interbank/i, code: "003" },
  { match: /scotiabank/i, code: "009" },
  { match: /bbva|continental/i, code: "011" },
  { match: /naci[oó]n/i, code: "018" },
  { match: /falabella/i, code: "020" },
  { match: /pichincha/i, code: "035" },
  { match: /ripley/i, code: "059" },
  { match: /mibanco/i, code: "070" },
  { match: /caja\s*piura|cmac\s*piura/i, code: "824" },
  { match: /caja\s*arequipa|cmac\s*arequipa/i, code: "803" },
  { match: /caja\s*trujillo|cmac\s*trujillo/i, code: "802" },
  { match: /caja\s*cusco|cmac\s*cusco/i, code: "806" },
  { match: /caja\s*huancayo|cmac\s*huancayo/i, code: "808" },
  { match: /caja\s*sullana|cmac\s*sullana/i, code: "805" },
];

/** Código de entidad financiera (tabla 36) a partir del nombre del banco. */
export function bankCode(bank: string | undefined): string {
  const value = (bank ?? "").trim();
  if (!value) return "";
  const found = BANCO_CODIGO.find((b) => b.match.test(value));
  return found?.code ?? "";
}

/** EPS / servicios propios (tabla 14), por palabra clave de la aseguradora. */
const EPS_CODIGO: { match: RegExp; code: string }[] = [
  { match: /r[ií]mac/i, code: "3" },
  { match: /pac[ií]fico/i, code: "2" },
  { match: /mapfre/i, code: "5" },
  { match: /sanitas/i, code: "6" },
  { match: /positiva/i, code: "7" },
  { match: /persalud/i, code: "1" },
];

/** Código de concepto de ingreso/tributo/descuento (tabla 22). */
const CONCEPTO: Record<string, string> = {
  BAS: "121", // Remuneración o jornal básico
  AF: "201", // Asignación familiar
  HE25: "105", // Sobretiempo 25 %
  HE35: "106", // Sobretiempo 35 %
  GRA: "401", // Gratificaciones fiestas patrias y navidad
  BON: "312", // Bonificación extraordinaria (Ley 29351 y 30334)
  FAL: "706", // Faltas (otros descuentos no deducibles)
  TAR: "704", // Tardanzas
  ONP: "607", // SNP - D.L. 19990
  AFP: "608", // SPP - aportación obligatoria
  COMI: "601", // SPP - comisión porcentual
  SEGU: "606", // SPP - prima de seguro
  "5TA": "605", // Renta de quinta categoría - retenciones
};

/** Tipo de suspensión de la relación laboral (tabla 21) por tipo de marcación. */
const SUSPENSION: Record<string, string> = {
  vacaciones: "23", // S.I. descanso vacacional
  licencia: "05", // S.P. permiso, licencia u otros motivos sin goce de haber
  descanso: "21", // S.I. incapacidad temporal (subsidiado)
  falta: "07", // S.P. falta no justificada
};

/** Vínculo familiar (tabla 19). */
const VINCULO: Record<Dependent["kind"], string> = {
  conyuge: "02",
  concubino: "03",
  gestante: "04",
  hijo: "05",
  hijo_incapacitado: "06",
};

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

function field(...values: (string | number)[]): string {
  return values.map((v) => String(v)).join("|");
}

/** Estructura de un archivo del catálogo (por id y posición). */
function structureFile(structureId: string, fileIndex: number) {
  return IMPORT_STRUCTURES.find((s) => s.id === structureId)?.files[fileIndex];
}

/** Línea-plantilla con la posición de cada campo (para estructuras sin datos). */
function placeholderLine(structureId: string, fileIndex = 0): string {
  const file = structureFile(structureId, fileIndex);
  if (!file) return "";
  return file.fields.map((f) => `<${f.n} ${f.name}>`).join("|");
}

/** Plantilla: un borrador por archivo, con una línea de posición de campos. */
function templateDrafts(
  structureId: string,
  destination: ImportDestination,
  warnings: string[],
  missing: string[] = [],
): Draft[] {
  const structure = IMPORT_STRUCTURES.find((s) => s.id === structureId);
  const files = structure?.files ?? [];
  return files.map((f, i) => ({
    structureId,
    destination,
    fileNameTemplate: f.fileName,
    lines: [placeholderLine(structureId, i)],
    kind: "plantilla" as const,
    missing,
    warnings,
  }));
}

/** Colaboradores afectos al período (los que tienen boleta). */
function peopleInPeriod(ctx: GenerateContext): { emp: Employee; slip: Payslip | undefined }[] {
  return ctx.slips
    .map((slip) => ({ emp: ctx.employees.find((e) => e.id === slip.employeeId)!, slip }))
    .filter((x) => Boolean(x.emp));
}

/** Colaboradores no practicantes (régimen laboral). */
function workers(ctx: GenerateContext): Employee[] {
  return ctx.employees.filter((e) => e.regime !== "practicante");
}

/** Practicantes (personal en formación). */
function trainees(ctx: GenerateContext): Employee[] {
  return ctx.employees.filter((e) => e.regime === "practicante");
}

/** Código de EPS (tabla 14) por nombre de la aseguradora. */
function epsCodeOf(company: Company, epsInsurerId: string | null): string {
  const insurer = activeInsurer(company, epsInsurerId);
  if (!insurer) return "";
  return EPS_CODIGO.find((x) => x.match.test(insurer.name))?.code ?? "";
}

/* ------------------------------------------------------------------ */
/* T-Registro                                                          */
/* ------------------------------------------------------------------ */

/** E4 — Datos personales (41 campos). */
const E4_FIELDS = 41;

function buildE4(ctx: GenerateContext): Draft[] {
  const missing: string[] = ["Dirección estructurada: vía, número, zona (campos 13–25 y 27–39)"];
  const lines = ctx.employees.map((e) => {
    const row: (string | number)[] = [
      TD_DNI,
      e.dni,
      "",
      e.birthDate ? formatDdMmYyyy(e.birthDate) : "",
      e.paternal,
      e.maternal,
      e.names,
      sexCode(e.sex),
      e.nationality ?? NACIONALIDAD_PERU,
      "",
      (e.phone ?? "").replace(/\D/g, "").slice(0, 9),
      e.email,
      "",
      (e.address ?? "").slice(0, 20),
    ];
    while (row.length < 25) row.push("");
    row.push((e.ubigeo ?? "").slice(0, 6)); // 26: UBIGEO
    while (row.length < E4_FIELDS) row.push("");
    return field(...row);
  });
  return [
    {
      structureId: "E4",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.ide",
      lines,
      kind: "datos",
      missing,
      warnings: ["La nacionalidad se completó con Perú (9589); ajústala si hay trabajadores extranjeros."],
    },
  ];
}

/** E5 — Datos del trabajador (23 campos). */
function buildE5(ctx: GenerateContext): Draft[] {
  const missing: string[] = [];
  if (ctx.employees.some((e) => !e.occupation)) missing.push("Ocupación, tabla 30 (campo 6)");
  if (ctx.employees.some((e) => !e.educationLevel)) missing.push("Situación educativa, tabla 9 (campo 5)");
  const lines = workers(ctx).map((e) =>
    field(
      TD_DNI,
      e.dni,
      "",
      REGIMEN_LABORAL[e.regime] ?? "01",
      e.educationLevel ?? "",
      e.occupation ?? "",
      "0",
      e.pension !== "onp" && e.pension !== "ninguno" ? e.cuspp : "",
      e.sctrInsurerId ? "2" : "0",
      TIPO_CONTRATO[e.contract] ?? "01",
      "0",
      "1",
      "0",
      "0",
      "1",
      money(e.salary),
      e.status === "activo" ? "1" : "0",
      "0",
      "0",
      e.salaryAccount ? "2" : "1",
      "03",
      "0",
      "",
    ),
  );
  return [
    {
      structureId: "E5",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.tra",
      lines,
      kind: "datos",
      missing,
      warnings: [
        "La categoría ocupacional se completó con 03 (empleado); revísala para obreros (02) o ejecutivos (01).",
        "El tipo de contrato a plazo fijo se envió como 09 (obra determinada o servicio específico); ajusta el código de la tabla 12 si corresponde.",
      ],
    },
  ];
}

/** E9 — Datos del personal en formación (11 campos). */
function buildE9(ctx: GenerateContext): Draft[] {
  const lines = trainees(ctx).map((e) =>
    field(
      TD_DNI,
      e.dni,
      "",
      "3", // modalidad formativa: prácticas profesionales
      e.healthInsurance === "eps" ? "2" : "1",
      e.educationLevel ?? "",
      e.occupation ?? "",
      "0",
      "0",
      "",
      "0",
    ),
  );
  if (lines.length === 0) return templateDrafts("E9", "T-Registro", []);
  return [
    {
      structureId: "E9",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.pfl",
      lines,
      kind: "datos",
      missing: ["Tipo de modalidad formativa, tabla 18 (campo 4)", "Tipo de centro de formación (campo 10)"],
      warnings: ["La modalidad formativa se completó con 3 (prácticas profesionales); ajústala según el convenio."],
    },
  ];
}

/** E11 — Datos de períodos (9 campos). */
function buildE11(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const e of workers(ctx)) {
    const ini = e.hireDate ? formatDdMmYyyy(e.hireDate) : "";
    const fin = e.endDate ? formatDdMmYyyy(e.endDate) : "";
    lines.push(field(TD_DNI, e.dni, "", "1", "1", ini, fin, "", ""));
    lines.push(field(TD_DNI, e.dni, "", "1", "2", ini, fin, "21", ""));
    const epsInsurer = activeInsurer(ctx.company, e.epsInsurerId);
    const salud = e.healthInsurance === "eps" && epsInsurer ? "01" : "00";
    lines.push(field(TD_DNI, e.dni, "", "1", "3", ini, fin, salud, epsCodeOf(ctx.company, e.epsInsurerId)));
    const pension = REGIMEN_PENSIONARIO[e.pension];
    if (pension) lines.push(field(TD_DNI, e.dni, "", "1", "4", ini, fin, pension, ""));
    if (e.sctrInsurerId) lines.push(field(TD_DNI, e.dni, "", "1", "5", ini, fin, "1", ""));
  }
  return [
    {
      structureId: "E11",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.per",
      lines,
      kind: "datos",
      missing: [],
      warnings: [
        "Cada línea es un registro: 1 período, 2 tipo de trabajador, 3 régimen de salud, 4 régimen pensionario y 5 SCTR salud.",
        "El tipo de trabajador se completó con 21 (empleado, tabla 8); cámbialo a 20 para obreros.",
        "Revisa el indicador de alta/baja (campo 8) para los ceses del período.",
      ],
    },
  ];
}

/** E17 — Establecimientos donde labora el trabajador (5 campos). */
function buildE17(ctx: GenerateContext): Draft[] {
  const lines = ctx.employees.map((e) => field(TD_DNI, e.dni, "", ctx.company.ruc, ""));
  return [
    {
      structureId: "E17",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.est",
      lines,
      kind: "datos",
      missing: ["Código de establecimiento (campo 5), debe existir en tu RUC"],
      warnings: ["El RUC propio se completó con el de la empresa; agrega el código de cada establecimiento."],
    },
  ];
}

/** E23 — Lugar de formación / destaque del personal de terceros (5 campos). */
function buildE23(ctx: GenerateContext): Draft[] {
  const lines = trainees(ctx).map((e) => field(TD_DNI, e.dni, "", "5", ""));
  if (lines.length === 0) return templateDrafts("E23", "T-Registro", []);
  return [
    {
      structureId: "E23",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.lug",
      lines,
      kind: "datos",
      missing: ["Código de establecimiento (campo 5), solo propios"],
      warnings: ["Se registró al personal en formación (categoría 5). El personal de terceros no está en la app."],
    },
  ];
}

/** E29 — Datos de estudios concluidos (8 campos). */
function buildE29(ctx: GenerateContext): Draft[] {
  const superior = new Set(["11", "13", "14", "15", "16", "17", "18", "19", "20", "21"]);
  const lines = ctx.employees
    .filter((e) => e.educationLevel && superior.has(e.educationLevel))
    .map((e) => field(TD_DNI, e.dni, "", e.educationLevel ?? "", "0", "", "", ""));
  if (lines.length === 0) return templateDrafts("E29", "T-Registro", []);
  return [
    {
      structureId: "E29",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.edu",
      lines,
      kind: "datos",
      missing: ["Institución educativa, tabla 34 (campo 6)", "Carrera, tabla 34 (campo 7)", "Año de egreso (campo 8)"],
      warnings: ["Se incluyó a quienes tienen formación superior; completa la institución y la carrera."],
    },
  ];
}

/** E30 — Datos de cuenta de abono de remuneraciones (5 campos). */
function buildE30(ctx: GenerateContext): Draft[] {
  const missing: string[] = [];
  const lines = ctx.employees.map((e) => {
    const code = bankCode(e.salaryBank);
    if (!code && (e.salaryBank ?? "").trim()) missing.push(`${e.salaryBank} (no está en la tabla 36)`);
    return field(TD_DNI, e.dni, "", code, (e.salaryAccount ?? "").replace(/\D/g, "").slice(0, 20));
  });
  return [
    {
      structureId: "E30",
      destination: "T-Registro",
      fileNameTemplate: "RP_###########.cta",
      lines,
      kind: "datos",
      missing: [...new Set(missing)],
      warnings: ["Solo se llena cuando el tipo de pago es “Depósito en cuenta”."],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Derechohabientes                                                    */
/* ------------------------------------------------------------------ */

/** E13 — Datos de derechohabientes - ALTAS (46 campos). */
function buildE13(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const emp of ctx.employees) {
    for (const dep of emp.dependents ?? []) {
      const row: (string | number)[] = [
        TD_DNI,
        emp.dni,
        TD_DNI,
        dep.dni,
        "",
        dep.birthDate ? formatDdMmYyyy(dep.birthDate) : "",
        dep.paternal,
        dep.maternal,
        dep.names,
        sexCode(dep.sex),
        VINCULO[dep.kind],
        dep.bondType ?? "",
        dep.bondNumber ?? "",
        "",
      ];
      while (row.length < 43) row.push("");
      row.push("");
      row.push((emp.phone ?? "").replace(/\D/g, "").slice(0, 10));
      row.push(emp.email);
      while (row.length < 46) row.push("");
      lines.push(field(...row));
    }
  }
  if (lines.length === 0) {
    return templateDrafts("E13", "Derechohabientes", [], [
      "Registra los hijos en la ficha del colaborador para generarlos.",
    ]);
  }
  return [
    {
      structureId: "E13",
      destination: "Derechohabientes",
      fileNameTemplate: "RD_RRRRRRRRRRR_DDMMAAAA_ALTA.TXT",
      lines,
      kind: "datos",
      missing: ["Dirección del derechohabiente (campos 15–42)"],
      warnings: ["Solo se generan los derechohabientes con DNI registrado en la ficha."],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* PLAME                                                               */
/* ------------------------------------------------------------------ */

/** E14 — Trabajador: datos de la jornada laboral (6 campos). */
function buildE14(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const { emp } of peopleInPeriod(ctx)) {
    const marks = ctx.attendance.filter((a) => a.employeeId === emp.id && a.date.startsWith(ctx.period));
    const worked = marks.filter((a) => a.kind === "presente" || a.kind === "tardanza" || a.kind === "remoto").length;
    const horas = Math.min(360, worked * 8);
    const extraTotal = marks.reduce((s, a) => s + (a.extra25 || 0) + (a.extra35 || 0), 0);
    const horasExtra = Math.min(360, Math.floor(extraTotal));
    const minExtra = Math.min(59, Math.round((extraTotal - Math.floor(extraTotal)) * 60));
    lines.push(field(TD_DNI, emp.dni, horas, 0, horasExtra, minExtra));
  }
  if (lines.length === 0) return [];
  return [
    {
      structureId: "E14",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.jor",
      lines,
      kind: "datos",
      missing: [],
      warnings: ["Las horas ordinarias se estiman en 8 por día marcado (presente, remoto o tardanza). Ajusta si la jornada es distinta."],
    },
  ];
}

/** E15 — Trabajador: días subsidiados y otros no laborados (4 campos). */
function buildE15(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const { emp } of peopleInPeriod(ctx)) {
    const marks = ctx.attendance.filter((a) => a.employeeId === emp.id && a.date.startsWith(ctx.period));
    const byCode = new Map<string, number>();
    for (const a of marks) {
      const code = SUSPENSION[a.kind];
      if (!code) continue;
      byCode.set(code, (byCode.get(code) ?? 0) + 1);
    }
    for (const [code, days] of byCode) lines.push(field(TD_DNI, emp.dni, code, Math.min(31, days)));
  }
  if (lines.length === 0) return [];
  return [
    {
      structureId: "E15",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.snl",
      lines,
      kind: "datos",
      missing: [],
      warnings: [
        "Se usa la tabla 21: 23 vacaciones, 21 incapacidad temporal (descanso médico), 05 licencia sin goce y 07 falta injustificada. Verifica cada caso.",
      ],
    },
  ];
}

/** E18 — Trabajador: detalle de ingresos, tributos y descuentos (5 campos). */
function buildE18(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const { emp, slip } of peopleInPeriod(ctx)) {
    if (!slip) continue;
    for (const line of slip.lines) {
      if (line.kind === "aporte") continue; // Los aportes del empleador no van aquí.
      const code = CONCEPTO[line.code];
      if (!code) continue;
      lines.push(field(TD_DNI, emp.dni, code, money(line.amount), money(line.amount)));
    }
  }
  if (lines.length === 0) return [];
  return [
    {
      structureId: "E18",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.rem",
      lines,
      kind: "datos",
      missing: [],
      warnings: [
        "Cada línea es un concepto (tabla 22). Las faltas se envían como 706: verifica si deben reducir el básico (121) en su lugar.",
        "El monto devengado y el pagado/descontado se completaron con el mismo importe de la boleta.",
      ],
    },
  ];
}

/** E21 — Personal en formación: monto pagado (3 campos). */
function buildE21(ctx: GenerateContext): Draft[] {
  const lines = trainees(ctx).map((e) => field(TD_DNI, e.dni, money(e.salary)));
  if (lines.length === 0) return templateDrafts("E21", "PLAME", []);
  return [
    {
      structureId: "E21",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.for",
      lines,
      kind: "datos",
      missing: [],
      warnings: ["El monto pagado corresponde a la subvención/beca mensual del practicante."],
    },
  ];
}

/** E25 — Trabajador: tasas SCTR-EsSalud y/o convenio IES (4 campos). */
function buildE25(ctx: GenerateContext): Draft[] {
  const lines: string[] = [];
  for (const { emp } of peopleInPeriod(ctx)) {
    const insurer = activeInsurer(ctx.company, emp.sctrInsurerId);
    if (!insurer) continue;
    lines.push(field(TD_DNI, emp.dni, "1", (insurer.healthRate ?? 0).toFixed(2)));
  }
  if (lines.length === 0) return [];
  return [
    {
      structureId: "E25",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.tas",
      lines,
      kind: "datos",
      missing: [],
      warnings: ["Se declaró la tasa de SCTR-EsSalud (indicador 1). Para convenios IES usa el indicador 2."],
    },
  ];
}

/** E26 — Trabajador: otras condiciones (6 campos). */
function buildE26(ctx: GenerateContext): Draft[] {
  const lines = workers(ctx).map((e) => field(TD_DNI, e.dni, "0", "0", "0", "1"));
  if (lines.length === 0) return [];
  return [
    {
      structureId: "E26",
      destination: "PLAME",
      fileNameTemplate: "ffffaaaamm###########.toc",
      lines,
      kind: "datos",
      missing: [],
      warnings: ["Se declaró domiciliado (1) y sin +Vida ni FDSA. Ajusta si algún trabajador aporta a esos seguros."],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Estructuras sin datos en la app → plantilla                         */
/* ------------------------------------------------------------------ */

const NO_DATA_WARNING =
  "La app no administra estos datos; el archivo se entrega como plantilla con la posición de cada campo.";

function templateOnly(id: string, destination: ImportDestination): Draft[] {
  return templateDrafts(id, destination, [NO_DATA_WARNING]);
}

/** Constructor constante (no usa datos): siempre devuelve la plantilla. */
const constBuilder = (id: string, destination: ImportDestination) => () => templateOnly(id, destination);

const BUILDERS: Record<string, (ctx: GenerateContext) => Draft[]> = {
  // T-Registro con datos
  E4: buildE4,
  E5: buildE5,
  E9: buildE9,
  E11: buildE11,
  E17: buildE17,
  E23: buildE23,
  E29: buildE29,
  E30: buildE30,
  // Derechohabientes con datos
  E13: buildE13,
  // PLAME con datos
  E14: buildE14,
  E15: buildE15,
  E18: buildE18,
  E21: buildE21,
  E25: buildE25,
  E26: buildE26,
  // Sin datos en la app → plantilla
  E1: constBuilder("E1", "T-Registro"),
  E2: constBuilder("E2", "T-Registro"),
  E3: constBuilder("E3", "T-Registro"),
  E6: constBuilder("E6", "T-Registro"),
  E7: constBuilder("E7", "PLAME"),
  E10: constBuilder("E10", "T-Registro"),
  E12: constBuilder("E12", "PLAME"),
  E19: constBuilder("E19", "PLAME"),
  E20: constBuilder("E20", "PLAME"),
  E22: constBuilder("E22", "PLAME"),
  E24: () =>
    templateDrafts("E24", "Derechohabientes", [
      "La app no guarda la baja de derechohabientes; completa el archivo a mano.",
    ]),
  E27: constBuilder("E27", "PLAME"),
  E28: constBuilder("E28", "PLAME"),
  E31: constBuilder("E31", "T-Registro"),
};

/** ¿La app puede generar esta estructura? (hoy: todas las del catálogo). */
export function canGenerate(structureId: string): boolean {
  return structureId in BUILDERS;
}

/**
 * Estructuras que la app arma con datos reales (colaboradores, asistencia,
 * boletas o derechohabientes). El resto se entrega como plantilla de campos.
 */
const DATA_STRUCTURES = new Set([
  "E4", "E5", "E9", "E11", "E13", "E14", "E15", "E17", "E18", "E21", "E23", "E25", "E26", "E29", "E30",
]);

/** ¿La app tiene datos para esta estructura (vs. solo plantilla)? */
export function hasAppData(structureId: string): boolean {
  return DATA_STRUCTURES.has(structureId);
}

/** Plantilla de respaldo cuando una estructura no produce filas de datos. */
function fallbackTemplates(structureId: string): Draft[] {
  const structure = IMPORT_STRUCTURES.find((s) => s.id === structureId);
  if (!structure) return [];
  return templateDrafts(structureId, structure.destination, [
    "No hay datos en la app para este período; se entrega la plantilla con la posición de cada campo.",
  ]);
}

/**
 * Genera todos los archivos de una estructura con los datos de la app. Si la
 * estructura no produce filas (por ejemplo, PLAME sin boletas del período),
 * entrega su plantilla para que siempre se pueda descargar algo.
 */
export function generateFiles(structureId: string, ctx: GenerateContext): GeneratedFile[] {
  const builder = BUILDERS[structureId];
  if (!builder) return [];
  const date = ctx.date ?? todayIso();
  let drafts = builder(ctx);
  if (drafts.length === 0 || drafts.every((d) => d.lines.length === 0 || d.lines[0] === "")) {
    drafts = fallbackTemplates(structureId);
  }
  return drafts
    .filter((d) => d.lines.length > 0 && d.lines[0] !== "")
    .map((d) => ({
      ...d,
      fileName: resolveFileName(d.fileNameTemplate, { ruc: ctx.company.ruc, period: ctx.period, date }),
    }));
}

/**
 * Genera el archivo principal (primero) de una estructura. Se conserva por
 * compatibilidad; para estructuras con varios archivos usa `generateFiles`.
 */
export function generateStructure(structureId: string, ctx: GenerateContext): GeneratedFile | null {
  return generateFiles(structureId, ctx)[0] ?? null;
}

/** Contenido de texto listo para descargar (sin encabezado, fin de línea CRLF). */
export function generatedFileText(file: GeneratedFile): string {
  return file.lines.join("\r\n") + "\r\n";
}
