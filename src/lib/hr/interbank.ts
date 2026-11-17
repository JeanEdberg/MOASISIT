/**
 * Archivo TXT de Pagos Masivos del Interbank, en el formato real de la macro
 * oficial (`Macro_Pagos_Masivos_Interbank.xls`).
 *
 * El archivo tiene dos partes de ancho fijo:
 *  - Cabecera (104 caracteres): control `01`, tipo de archivo, fecha/hora,
 *    número de registros y totales (en céntimos).
 *  - Detalle (380 caracteres por beneficiario): control `02`, código, cuenta,
 *    importe (en céntimos), documento y nombre.
 *
 * Se implementan dos tipos: **Remuneraciones** (tipo `04`) y **CTS** (tipo
 * `06`). Los campos "Tipo de op.", "N° doc. de pago" y "Fecha de vencimiento"
 * solo se usan en Proveedores, así que van en blanco.
 *
 * Módulo PURO para los constructores (devuelven texto), con un ayudante de
 * descarga al final.
 */

import { ctsSemester } from "@/lib/hr/calc";
import { round2 } from "@/lib/hr/format";
import type { Company, Employee, Payslip } from "@/lib/hr/types";

/** Tipo de archivo de la cabecera. */
export type InterbankKind = "remuneraciones" | "cts";

const FILE_TYPE: Record<InterbankKind, string> = { remuneraciones: "04", cts: "06" };

/** Un beneficiario incompleto: se excluye del archivo y se avisa por pantalla. */
export type InterbankIncomplete = { employeeId: string; name: string; reason: string };

/** Una línea de detalle ya resuelta (para mostrarla en pantalla). */
export type InterbankRow = {
  employeeId: string;
  code: string;
  name: string;
  dni: string;
  account: string;
  amount: number;
  /** `09` abono en cuenta (mismo banco) · `99` abono interbancario (CCI). */
  tipoAbono: string;
};

export type InterbankFile = {
  kind: InterbankKind;
  content: string;
  rows: InterbankRow[];
  incomplete: InterbankIncomplete[];
  count: number;
  totalSoles: number;
};

/** Sella de tiempo `AAAAMMDDHHMMSS` para la cabecera. */
function stamp(now: Date): string {
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return (
    `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}` +
    `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`
  );
}

/** Monto en céntimos, en 15 dígitos con ceros a la izquierda. */
function cents(amount: number): string {
  return String(Math.max(0, Math.round(round2(amount) * 100))).padStart(15, "0");
}

/**
 * Deja el texto en ASCII puro, porque el sistema del banco **rechaza** la ñ,
 * las tildes y cualquier símbolo parecido. Primero descompone los acentos
 * (á → a + tilde) y los quita; luego reemplaza lo que quede fuera del rango
 * imprimible ASCII (0x20–0x7E) por un espacio, y colapsa los espacios dobles.
 */
export function toAscii(text: string): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes y diéresis
    .replace(/[^\x20-\x7e]/g, " ") // cualquier otro símbolo → espacio
    .replace(/\s+/g, " ")
    .trim();
}

/** Cabecera del archivo (104 caracteres). */
function buildHeader(kind: InterbankKind, count: number, totalSoles: number, now: Date): string {
  return [
    "01",
    FILE_TYPE[kind],
    " ".repeat(36),
    stamp(now),
    " ".repeat(9),
    String(count).padStart(6, "0"),
    cents(totalSoles),
    cents(0),
    "MC001",
  ].join("");
}

/**
 * Separa una cuenta en oficina (3) + número (10) o CCI interbancario (20).
 *
 * La cuenta se guarda con separadores y, a veces, con dígitos de control o
 * subcuenta (p. ej. `001-3001234567-0-99`). Se toman los dígitos: 20 ⇒ CCI de
 * otro banco (abono interbancario); 13 o más ⇒ cuenta Interbank propia (los
 * tres primeros son la oficina, los diez siguientes la cuenta).
 */
function parseAccount(raw: string): { oficina: string; cuenta: string; tipoAbono: string } | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 20) {
    return { oficina: digits.slice(0, 3), cuenta: digits, tipoAbono: "99" };
  }
  if (digits.length >= 13) {
    return { oficina: digits.slice(0, 3), cuenta: digits.slice(3, 13), tipoAbono: "09" };
  }
  return null;
}

/** Datos de un beneficiario ya resueltos (sueldo, CTS o gratificación). */
export type InterbankRecord = {
  employeeId: string;
  code: string;
  dni: string;
  names: string;
  paternal: string;
  maternal: string;
  account: string;
  amount: number;
  /** Tipo de cuenta Interbank: `001` corriente · `002` ahorros · `007` CTS. */
  accountType?: string;
  /** Monto intangible (solo CTS). */
  intangible?: number;
  email?: string;
  phone?: string;
};

type RecordInput = InterbankRecord & {
  name: { names: string; paternal: string; maternal: string };
};

/** Construye una línea de detalle (380 caracteres). */
function buildRecord(input: RecordInput): { line: string; tipoAbono: string } | null {
  const parsed = parseAccount(input.account);
  if (!parsed) return null;
  const { names, paternal, maternal } = input.name;
  const docType = input.dni.length === 8 ? "01" : input.dni.length === 11 ? "02" : "03";
  // La macro reemplaza el "código de beneficiario" por tipoDoc + númeroDoc.
  const benefCode = `${docType}${input.dni}`;

  // En abono interbancario (99) la macro deja en blanco el producto, la moneda
  // de cuenta y la oficina; el CCI de 20 dígitos va completo en "N° cuenta".
  const interbancario = parsed.tipoAbono === "99";
  const producto = interbancario ? "" : (input.accountType || "002").slice(0, 3).padStart(3, "0");
  const monedaCuenta = interbancario ? "" : "01";
  const oficina = interbancario ? "" : parsed.oficina;
  // Persona jurídica solo cuando es RUC que empieza con 2; el resto, natural.
  const tipBenef = docType === "02" && input.dni.startsWith("2") ? "C" : "P";
  // El banco rechaza la ñ, las tildes y símbolos: el nombre va en ASCII y mayúsculas.
  const nombre = toAscii(
    [paternal, maternal, names]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" "),
  ).toUpperCase();

  const line = [
    "02",
    benefCode.slice(0, 20).padEnd(20, " "),
    " ", // Tipo de op. (solo Proveedores)
    " ".repeat(20), // N° doc. de pago (solo Proveedores)
    " ".repeat(8), // Fecha de vencimiento (vacía en Remuneraciones/CTS)
    "01", // Moneda de abono: soles
    cents(input.amount), // Importe
    " ", // Indicador de banco (la macro lo deja vacío)
    parsed.tipoAbono, // Tipo de abono
    producto.padEnd(3, " "), // Tipo de cuenta (vacío en interbancario)
    monedaCuenta.padEnd(2, " "), // Moneda de cuenta (vacía en interbancario)
    oficina.padEnd(3, " "), // Oficina (vacía en interbancario)
    parsed.cuenta.slice(0, 20).padEnd(20, " "), // N° de cuenta / CCI
    tipBenef, // Tipo de beneficiario: persona natural o jurídica
    docType, // Tipo de documento
    input.dni.slice(0, 15).padEnd(15, " "), // N° de documento
    nombre.slice(0, 60).padEnd(60, " "), // Nombre en mayúsculas
    "01", // Moneda intangible
    cents(input.intangible ?? 0), // Monto intangible
    " ".repeat(6), // Relleno
    toAscii(input.phone ?? "").slice(0, 40).padEnd(40, " "), // Celular
    toAscii(input.email ?? "").slice(0, 140).padEnd(140, " "), // Correo
  ].join("");

  return { line, tipoAbono: parsed.tipoAbono };
}

/** Nombre completo en el orden del banco: AP. PATERNO; AP. MATERNO; NOMBRES. */
function bankName(r: InterbankRecord): string {
  return `${r.paternal} ${r.maternal}, ${r.names}`.trim();
}

/**
 * Construye el archivo a partir de beneficiarios ya resueltos. Es la base de los
 * constructores de Remuneraciones y CTS, y la reutiliza el Consolidado Masivo
 * para CTS y gratificaciones.
 */
export function buildInterbankFile(
  kind: InterbankKind,
  records: InterbankRecord[],
  now: Date = new Date(),
): InterbankFile {
  const rows: InterbankRow[] = [];
  const incomplete: InterbankIncomplete[] = [];
  const lines: string[] = [];

  for (const record of records) {
    if (record.amount <= 0) continue;
    const input: RecordInput = {
      ...record,
      name: { names: record.names, paternal: record.paternal, maternal: record.maternal },
    };
    const built = buildRecord(input);
    if (!built) {
      incomplete.push({
        employeeId: record.employeeId,
        name: bankName(record),
        reason:
          "Cuenta bancaria inválida o no registrada (se espera 13 dígitos Interbank o 20 de CCI).",
      });
      continue;
    }
    lines.push(built.line);
    rows.push({
      employeeId: record.employeeId,
      code: record.code,
      name: bankName(record),
      dni: record.dni,
      account: record.account,
      amount: round2(record.amount),
      tipoAbono: built.tipoAbono,
    });
  }

  const totalSoles = round2(rows.reduce((s, r) => s + r.amount, 0));
  const header = buildHeader(kind, rows.length, totalSoles, now);
  const content = [header, ...lines].join("\r\n") + (lines.length ? "\r\n" : "");

  return { kind, content, rows, incomplete, count: rows.length, totalSoles };
}

/**
 * Monto que va al banco por remuneraciones: **remuneración básica + asignación
 * familiar** (los dos conceptos de la boleta), no el neto.
 */
export function remuneracionBancaria(slip: Payslip): number {
  const sum = (code: string) =>
    slip.lines.filter((l) => l.code === code).reduce((s, l) => s + l.amount, 0);
  return round2(sum("BAS") + sum("AF"));
}

/**
 * Archivo de Remuneraciones: deposita **remuneración básica + asignación
 * familiar** de cada colaborador en su cuenta sueldo.
 */
export function buildInterbankRemuneraciones(
  employees: Employee[],
  slips: Payslip[],
  company: Company,
  now: Date = new Date(),
): InterbankFile {
  void company;
  const records: InterbankRecord[] = slips.map((slip) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    return {
      employeeId: slip.employeeId,
      code: emp?.code ?? slip.employeeId,
      dni: emp?.dni ?? "",
      names: emp?.names ?? "",
      paternal: emp?.paternal ?? "",
      maternal: emp?.maternal ?? "",
      account: emp?.salaryAccount || emp?.account || "",
      amount: remuneracionBancaria(slip),
      accountType: "002",
      email: emp?.email,
      phone: emp?.phone,
    };
  });
  return buildInterbankFile("remuneraciones", records, now);
}

/**
 * Archivo de CTS: deposita la CTS del semestre indicado en la cuenta CTS de
 * cada colaborador. El monto intangible se registra igual al depósito (la CTS
 * es intangible hasta el cese).
 */
export function buildInterbankCts(
  employees: Employee[],
  company: Company,
  year: number,
  which: "may" | "nov",
  now: Date = new Date(),
): InterbankFile {
  const records: InterbankRecord[] = employees.map((emp) => {
    const amount = ctsSemester(emp, company, year, which);
    return {
      employeeId: emp.id,
      code: emp.code,
      dni: emp.dni,
      names: emp.names,
      paternal: emp.paternal,
      maternal: emp.maternal,
      account: emp.ctsAccount || "",
      amount,
      accountType: "007",
      intangible: amount,
      email: emp.email,
      phone: emp.phone,
    };
  });
  return buildInterbankFile("cts", records, now);
}

/** Nombre de archivo sugerido, con el RUC de la empresa. */
export function interbankFileName(kind: InterbankKind, company: Company, suffix = ""): string {
  const base = kind === "cts" ? "Interbank_CTS" : "Interbank_Remuneraciones";
  return `${base}_${company.ruc}${suffix ? `_${suffix}` : ""}.txt`;
}

/**
 * Codifica el texto a Windows-1252 (ANSI), que es lo que produce la macro del
 * banco. Es importante para el ancho fijo: en UTF-8 un carácter como "Ñ" ocupa
 * dos bytes y descuadraría la línea de 380. Los caracteres fuera de latin-1 se
 * reemplazan por "?".
 */
export function encodeInterbank(text: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(text.length));
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes[i] = code <= 0xff ? code : 0x3f; // "?" fuera de latin-1
  }
  return bytes;
}

/** Descarga el archivo en el navegador, en Windows-1252 (como la macro). */
export function downloadInterbank(file: InterbankFile, fileName: string): void {
  const blob = new Blob([encodeInterbank(file.content)], {
    type: "text/plain;charset=windows-1252",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
