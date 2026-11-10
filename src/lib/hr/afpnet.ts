import * as XLSX from "xlsx";
import type { Company, Employee, Payslip } from "@/lib/hr/types";

/**
 * Archivo de declaración de aportes para AFPnet (Sistema Privado de Pensiones).
 *
 * Réplica del modelo oficial de AFPnet vigente desde el 11/04/2016: 17 columnas
 * sin fila de encabezado (el portal pide eliminar las tres primeras filas del
 * modelo antes de subirlo). Solo se declaran afiliados a una AFP; los afiliados
 * a la ONP o sin régimen pensionario no van en este archivo.
 */

/** Afiliados al SPP: solo estos se declaran en AFPnet. */
const AFP_PENSIONS = new Set(["habitat", "integra", "prima", "profuturo"]);

/** Códigos de AFPnet para el tipo de documento de identidad. */
const TIPO_DOC_DNI = "0";

/** Tipo de trabajo o rubro: N = dependiente normal. */
const TIPO_TRABAJO_NORMAL = "N";

export type AfpnetRow = {
  /** Número de secuencia (1..n), solo referencia para ubicar errores. */
  secuencia: number;
  cuspp: string;
  tipoDocumento: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  relacionLaboral: "S" | "N";
  inicioRl: "S" | "N";
  ceseRl: "S" | "N";
  excepcion: string;
  remuneracionAsegurable: number;
  aporteVoluntarioConFin: number;
  aporteVoluntarioSinFin: number;
  aporteVoluntarioEmpleador: number;
  tipoTrabajo: string;
  afp: string;
};

export type AfpnetResult = {
  rows: AfpnetRow[];
  /** Afiliados a una AFP que se omiten por no tener CUSPP (dato obligatorio). */
  sinCuspp: Employee[];
};

/** ¿El mes de `iso` cae dentro del periodo "AAAA-MM"? */
function inPeriod(iso: string | null | undefined, period: string): boolean {
  return Boolean(iso) && String(iso).startsWith(period);
}

/**
 * Arma las filas de declaración para el periodo a partir de las boletas.
 * `pensionBase` ya viene topada al tope legal, que es la remuneración asegurable.
 */
export function buildAfpnetRows(slips: Payslip[], employees: Employee[], period: string): AfpnetResult {
  const rows: AfpnetRow[] = [];
  const sinCuspp: Employee[] = [];

  for (const slip of slips) {
    const emp = employees.find((e) => e.id === slip.employeeId);
    if (!emp || !AFP_PENSIONS.has(emp.pension)) continue;
    const cuspp = (emp.cuspp ?? "").trim();
    if (!cuspp) {
      sinCuspp.push(emp);
      continue;
    }
    rows.push({
      secuencia: rows.length + 1,
      cuspp,
      tipoDocumento: TIPO_DOC_DNI,
      numeroDocumento: emp.dni,
      apellidoPaterno: emp.paternal,
      apellidoMaterno: emp.maternal,
      nombres: emp.names,
      relacionLaboral: "S",
      inicioRl: inPeriod(emp.hireDate, period) ? "S" : "N",
      ceseRl: inPeriod(emp.endDate, period) ? "S" : "N",
      excepcion: "",
      remuneracionAsegurable: slip.pensionBase,
      aporteVoluntarioConFin: 0,
      aporteVoluntarioSinFin: 0,
      aporteVoluntarioEmpleador: 0,
      tipoTrabajo: TIPO_TRABAJO_NORMAL,
      afp: "",
    });
  }

  return { rows, sinCuspp };
}

/** Encabezados del modelo oficial, en el orden exacto que espera AFPnet. */
export const AFPNET_HEADERS = [
  "Número de secuencia",
  "CUSPP",
  "Tipo  de documento de identidad",
  "Número de documento de indentidad",
  "Apellido paterno",
  "Apellido materno",
  "Nombres",
  "Relación Laboral",
  "Inicio de RL",
  "Cese de RL",
  "Excepcion de Aportar",
  "Remuneración asegurable",
  "Aporte voluntario del afiliado con fin previsional",
  "Aporte voluntario del afiliado sin fin previsional",
  "Aporte voluntario del empleador",
  "Tipo de trabajo o Rubro",
  "AFP",
] as const;

/** Fila de datos en el orden de las columnas de AFPnet. */
export function afpnetRowValues(r: AfpnetRow): (string | number)[] {
  return [
    r.secuencia,
    r.cuspp,
    r.tipoDocumento,
    r.numeroDocumento,
    r.apellidoPaterno,
    r.apellidoMaterno,
    r.nombres,
    r.relacionLaboral,
    r.inicioRl,
    r.ceseRl,
    r.excepcion,
    r.remuneracionAsegurable,
    r.aporteVoluntarioConFin,
    r.aporteVoluntarioSinFin,
    r.aporteVoluntarioEmpleador,
    r.tipoTrabajo,
    r.afp,
  ];
}

/** Nombre de archivo base, sin extensión: `afpnet-<RUC>-<periodo>`. */
function fileBase(company: Company, period: string): string {
  return `afpnet-${company.ruc}-${period}`;
}

/**
 * Descarga el archivo AFPnet en Excel (.xlsx) con las 17 columnas y sin fila de
 * encabezado, tal como lo pide el portal. `numeroDocumento` y `CUSPP` van como
 * texto para conservar sus valores exactos.
 */
export function exportAfpnetExcel(rows: AfpnetRow[], company: Company, period: string): void {
  const aoa: (string | number)[][] = rows.map(afpnetRowValues);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = AFPNET_HEADERS.map((h) => ({ wch: Math.min(28, Math.max(10, h.length)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "AFPnet");
  XLSX.writeFile(wb, `${fileBase(company, period)}.xlsx`);
}

/**
 * Descarga el archivo AFPnet en texto plano (.txt) delimitado por tabulaciones,
 * por si se prefiere cargar el TXT en lugar del Excel. Sin fila de encabezado.
 */
export function exportAfpnetTxt(rows: AfpnetRow[], company: Company, period: string): void {
  const body = rows.map((r) => afpnetRowValues(r).join("\t")).join("\r\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBase(company, period)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
