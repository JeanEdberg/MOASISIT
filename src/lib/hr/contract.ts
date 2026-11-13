/**
 * Modelo de contrato de trabajo (módulo PURO).
 *
 * Reproduce la plantilla real de INMOA (contrato a plazo fijo por necesidad de
 * mercado, D.S. N.º 003-97-TR) y se adapta a los otros tipos de contrato
 * (indefinido y convenio de prácticas). Todos los datos salen de la ficha del
 * colaborador y de la configuración de la empresa, así que el documento se
 * arma solo al dar de alta a la persona.
 *
 * Es un MODELO editable: sirve de base para la asesoría laboral de la empresa.
 * No reemplaza un contrato suscrito ni el registro del convenio de prácticas.
 */

import { differenceInCalendarMonths } from "date-fns";
import { CONTRACT_LABEL, fullName, parseDay, pen } from "@/lib/hr/format";
import { logoImgHtml } from "@/lib/hr/logo";
import { salaryForDate } from "@/lib/hr/salary";
import type { Company, Employee } from "@/lib/hr/types";

export type ContractClause = {
  heading: string;
  body: string;
};

export type ContractModel = {
  title: string;
  preamble: string;
  clauses: ContractClause[];
  closing: string;
  signatures: { employer: string; employerRuc: string; worker: string; workerDni: string };
  disclaimer: string;
};

/** Enunciado de ley que encabeza cada tipo de contrato. */
const LEGAL_BASE: Record<string, string> = {
  plazo_fijo:
    "Art. 58 de la Ley de Productividad y Competitividad Laboral aprobado por D.S. N.º 003-97-TR y normas complementarias",
  indefinido:
    "Art. 4 del Texto Único Ordenado del D. Leg. N.º 728 aprobado por D.S. N.º 003-97-TR y normas complementarias",
  practicas: "Ley N.º 28518, Ley sobre Modalidades Formativas Laborales, y su reglamento",
};

const TITLE: Record<string, string> = {
  plazo_fijo: "CONTRATO DE TRABAJO SUJETO A MODALIDAD POR NECESIDAD DE MERCADO",
  indefinido: "CONTRATO DE TRABAJO A PLAZO INDETERMINADO",
  practicas: "CONVENIO DE PRÁCTICAS PROFESIONALES",
};

const ORDINAL = [
  "PRIMERO",
  "SEGUNDO",
  "TERCERO",
  "CUARTO",
  "QUINTO",
  "SEXTO",
  "SÉPTIMO",
  "OCTAVO",
  "NOVENO",
  "DÉCIMO",
];

const UNIDADES = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const ESPECIALES = [
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISÉIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
];
const DECENAS = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function decenas(n: number): string {
  if (n < 10) return UNIDADES[n] ?? "";
  if (n < 20) return ESPECIALES[n - 10] ?? "";
  if (n < 30) return n === 20 ? "VEINTE" : `VEINTI${UNIDADES[n - 20] ?? ""}`;
  const dec = DECENAS[Math.floor(n / 10)] ?? "";
  return n % 10 ? `${dec} Y ${UNIDADES[n % 10] ?? ""}` : dec;
}

function tresDigitos(n: number): string {
  if (n === 100) return "CIEN";
  const cen = Math.floor(n / 100);
  const resto = n % 100;
  if (cen === 0) return decenas(resto);
  if (resto === 0) return CENTENAS[cen] ?? "";
  return `${CENTENAS[cen]} ${decenas(resto)}`;
}

/** Número entero a letras en mayúsculas (0 – 999,999). */
export function numeroALetras(n: number): string {
  const entero = Math.floor(Math.abs(n));
  if (entero === 0) return "CERO";
  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;
  const partes: string[] = [];
  if (miles === 1) partes.push("MIL");
  else if (miles > 1) partes.push(`${tresDigitos(miles)} MIL`);
  if (resto > 0 || miles === 0) partes.push(tresDigitos(resto));
  return partes.join(" ").replace(/\s+/g, " ").trim();
}

/** Importe en letras estilo legal: "DOS MIL QUINIENTOS CON 00/100 NUEVOS SOLES". */
export function montoEnLetras(n: number): string {
  const entero = Math.floor(n);
  const cents = Math.round((n - entero) * 100);
  const centavos = String(cents === 100 ? 0 : cents).padStart(2, "0");
  return `${numeroALetras(entero)} CON ${centavos}/100 NUEVOS SOLES`;
}

/** Meses de vigencia entre dos fechas, contando el mes de inicio (mínimo 1). */
export function plazoMonths(hireDate: string, endDate: string): number {
  const meses = differenceInCalendarMonths(parseDay(endDate), parseDay(hireDate)) + 1;
  return Math.max(1, meses);
}

/** Fecha en el formato del contrato: "01/10/2026". */
function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function jornadaText(workMode: string): string {
  if (workMode === "virtual") return "lunes a viernes en la modalidad de trabajo remoto";
  if (workMode === "campo") return "lunes a sábado de 07:00 A.M. a 04:00 P.M.";
  return "lunes a sábado de 08:00 A.M. a 05:00 P.M.";
}

function objetoNecesidad(contract: string): string {
  if (contract === "practicas") {
    return "EL EMPLEADOR brinda al PRACTICANTE la oportunidad de aplicar los conocimientos adquiridos en su formación profesional, bajo la orientación y supervisión que la ley exige.";
  }
  if (contract === "indefinido") {
    return "EL EMPLEADOR requiere cubrir de forma permanente las necesidades de recursos humanos de su operación.";
  }
  return "EL EMPLEADOR requiere cubrir las necesidades de recursos humanos con el objeto de atender incrementos de la producción originados por la implementación de unidades productivas automatizadas, con el fin de cubrir la demanda del mercado de venta al por mayor y menor.";
}

function plazoText(employee: Employee): string {
  const inicio = fechaCorta(employee.hireDate);
  if (employee.contract === "indefinido") {
    return `El presente contrato es de duración indeterminada y regirá a partir del ${inicio} por acuerdo de las partes.`;
  }
  if (!employee.endDate) {
    return `El presente contrato regirá a partir del ${inicio}; la fecha de término se consigna en la parte final del documento.`;
  }
  const meses = plazoMonths(employee.hireDate, employee.endDate);
  return `El presente contrato tiene un plazo de ${numeroALetras(meses)} (${meses}) meses. El mismo que regirá a partir del ${inicio} hasta el ${fechaCorta(employee.endDate)} por acuerdo de las partes; pudiendo prorrogarse y/o ponerse fin siempre que EL EMPLEADOR conserve las condiciones legales establecidas para mantenerse dentro de su régimen laboral.`;
}

/** Construye el modelo de contrato completo para un colaborador. */
export function buildContract(company: Company, employee: Employee): ContractModel {
  const tipo = employee.contract;
  const titulo = TITLE[tipo] ?? TITLE.indefinido!;
  const esPracticas = tipo === "practicas";
  const tratamiendo = esPracticas ? "EL PRACTICANTE" : "EL TRABAJADOR";
  const accion = esPracticas ? "pacta con EL PRACTICANTE" : "pacta con EL TRABAJADOR";

  const empleador = `${company.name}, con RUC N.º ${company.ruc}, con domicilio fiscal en ${company.address}, ${company.city}`;
  const tituloFrase = `${titulo.charAt(0)}${titulo.slice(1).toLowerCase()}`;

  const preamble = `Conste por el presente documento, el ${tituloFrase}, que celebran al amparo del ${
    LEGAL_BASE[tipo] ?? LEGAL_BASE.indefinido
  }, de una parte ${empleador}, a quien en adelante se le denominará EL EMPLEADOR y de la otra parte el señor(a) ${fullName(
    employee,
  ).toUpperCase()}, identificado(a) con DNI N.º ${employee.dni}, con domicilio en ${
    employee.address || "el consignado en su ficha"
  }, a quien en adelante se le denominará ${tratamiendo}, en los términos y condiciones siguientes:`;

  const fecha = parseDay(employee.hireDate);
  const mesNombre = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ][fecha.getMonth()];

  const documento = esPracticas ? "convenio" : "contrato";
  const bodies = [
    objetoNecesidad(tipo),
    `En virtud del presente ${esPracticas ? "convenio" : "Contrato de Trabajo"} EL EMPLEADOR ${accion} para que realice labores de ${employee.position.toUpperCase()}. Sin perjuicio de esta labor establecida, EL EMPLEADOR puede asignar otras labores, sin que dichas variaciones signifiquen menoscabo de su categoría o remuneración.`,
    plazoText(employee),
    `La jornada laboral de ${tratamiendo} es de ${jornadaText(
      employee.workMode,
    )}, con una (1) hora de refrigerio, que no son computables para efectos de la jornada ni del horario de trabajo, según D.S. N.º 008-2002-TR. Esta jornada laboral puede variar de acuerdo a la necesidad de EL EMPLEADOR pero se respeta el tiempo establecido de acuerdo a Ley.`,
    `La remuneración que percibirá ${tratamiendo} como prestación de los servicios que se contraten será por el importe de ${pen(
      salaryForDate(employee, employee.hireDate),
    )} (Son: ${montoEnLetras(salaryForDate(employee, employee.hireDate))}), de la cual se deducirá las aportaciones y descuentos por tributos establecidos en la ley que le resulten aplicables.`,
    `Queda entendido que EL EMPLEADOR no está obligado a dar aviso adicional referente al término del presente ${documento}, operando su extinción en la fecha de su vencimiento conforme la cláusula tercera, oportunidad en la cual se abonará a ${tratamiendo} los beneficios sociales que le pudieran corresponder de acuerdo a ley.`,
    `Este ${documento} queda sujeto a las disposiciones que contiene el Texto Único Ordenado del D. Leg. N.º 728 aprobado por D.S. N.º 003-97-TR - Ley de Productividad y Competitividad Laboral, y demás normas legales que lo regulen o que sean dictadas durante su vigencia.`,
    `Las partes se someten a la jurisdicción y competencia de los Jueces y Tribunales de ${company.city} y señalan como sus domicilios los fijados en la introducción de este convenio, donde serán válidas todas las notificaciones judiciales y/o extrajudiciales que se pudieran cursar.`,
    `De conformidad con el Art. 116.º del Decreto Legislativo N.º 728, una copia del presente ${documento} será presentada a la Autoridad de Trabajo para su conocimiento y registro.`,
  ];

  const clauses: ContractClause[] = bodies.map((body, i) => ({
    heading: `${ORDINAL[i] ?? `CLÁUSULA ${i + 1}`}.-`,
    body,
  }));

  const closing = `Extendido por duplicado de un mismo tenor, el día ${String(fecha.getDate()).padStart(
    2,
    "0",
  )} del mes de ${mesNombre} del ${fecha.getFullYear()}, firmando las partes en señal de conformidad.`;

  return {
    title: titulo,
    preamble,
    clauses,
    closing,
    signatures: {
      employer: company.name.toUpperCase(),
      employerRuc: company.ruc,
      worker: fullName(employee).toUpperCase(),
      workerDni: employee.dni,
    },
    disclaimer:
      "Modelo de trabajo generado por Moasist a partir de la ficha del colaborador. Debe ser revisado y validado por la asesoría laboral de la empresa antes de su suscripción. No constituye firma electrónica ni registro ante la Autoridad Administrativa de Trabajo.",
  };
}

/** Nombre de archivo sugerido para el contrato (sin extensión). */
export function contractFileName(employee: Employee): string {
  return `Contrato - ${fullName(employee)} - ${CONTRACT_LABEL[employee.contract]}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Contrato como documento HTML compatible con Word (se descarga con extensión
 * .doc). Usa Times New Roman 12 para parecerse a la plantilla de la empresa.
 */
export function contractToHtml(company: Company, employee: Employee): string {
  const c = buildContract(company, employee);
  const clausulas = c.clauses
    .map((cl) => `<p class="cl"><b>${esc(cl.heading)}</b> ${esc(cl.body)}</p>`)
    .join("\n");
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(c.title)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; color: #000; }
  h1 { font-size: 12pt; text-align: center; text-decoration: underline; }
  .emp { text-align: center; font-size: 10pt; margin: 0; }
  p { text-align: justify; margin: 0 0 10pt; }
  .firmas { margin-top: 48pt; width: 100%; border-collapse: collapse; }
  .firmas td { width: 50%; text-align: center; padding-top: 40pt; border-top: 1px solid #000; font-size: 11pt; vertical-align: top; }
  .firmas .rol { font-size: 9pt; color: #333; }
</style></head>
<body>
  ${company.logo ? `<div style="margin-bottom:10pt;">${logoImgHtml(company, 54)}</div>` : ""}
  <p class="emp">${esc(company.name)}</p>
  <h1>${esc(c.title)}</h1>
  <p>${esc(c.preamble)}</p>
  ${clausulas}
  <p>${esc(c.closing)}</p>
  <table class="firmas"><tr>
    <td>${esc(c.signatures.employer)}<br><span class="rol">EL EMPLEADOR · RUC ${esc(c.signatures.employerRuc)}</span></td>
    <td>${esc(c.signatures.worker)}<br><span class="rol">EL TRABAJADOR · DNI ${esc(c.signatures.workerDni)}</span></td>
  </tr></table>
  <p style="margin-top:36pt;font-size:9pt;color:#555">${esc(c.disclaimer)}</p>
</body></html>`;
}
