/**
 * Modelo de contrato de trabajo (módulo PURO).
 *
 * Genera las cláusulas del contrato a partir de la empresa y el colaborador,
 * siguiendo los puntos que exige una relación laboral en el Perú (partes,
 * objeto, plazo, jornada, remuneración, beneficios, seguridad social, etc.).
 *
 * Es un MODELO: sirve de base editable para la asesoría laboral de la empresa.
 * No reemplaza un contrato suscrito ni el registro del convenio de prácticas.
 */

import { CONTRACT_LABEL, REGIME_LABEL, WORK_MODE_LABEL, fullName, pen, shortDate } from "@/lib/hr/format";
import { HEALTH_INSURANCE_LABEL, PENSION_LABEL } from "@/lib/hr/format";
import type { Company, ContractType, Employee, Regime } from "@/lib/hr/types";

export type ContractClause = {
  heading: string;
  body: string;
};

export type ContractModel = {
  title: string;
  /** "Empleador" o "Empresa" según el tipo. */
  preamble: string;
  clauses: ContractClause[];
  signatures: { employer: string; worker: string };
  /** Advertencia legal para mostrar al pie. */
  disclaimer: string;
};

/** Duración típica del periodo de prueba según el régimen (art. 10 D.S. 003-97-TR). */
export function trialPeriodDays(regime: Regime): number {
  switch (regime) {
    case "general":
      return 90;
    case "pequena":
      return 90;
    case "micro":
      return 90;
    case "practicante":
      return 0;
    default:
      return 90;
  }
}

/** Texto del plazo según el tipo de contrato. */
function plazoText(contract: ContractType, hireDate: string, endDate: string | null): string {
  const inicio = shortDate(hireDate);
  if (contract === "indefinido") {
    return `El presente contrato es de duración indeterminada y se inicia el ${inicio}.`;
  }
  if (contract === "plazo_fijo") {
    return endDate
      ? `El presente contrato es a plazo fijo y se inicia el ${inicio}, con término el ${shortDate(endDate)}.`
      : `El presente contrato es a plazo fijo y se inicia el ${inicio}; la fecha de término se consigna en la parte final del documento.`;
  }
  return `El presente convenio de prácticas se inicia el ${inicio}${
    endDate ? ` y termina el ${shortDate(endDate)}` : ""
  }, dentro de los límites del artículo 4 de la Ley N.º 28518.`;
}

/** Construye el modelo de contrato completo. */
export function buildContract(company: Company, employee: Employee): ContractModel {
  const esPracticas = employee.contract === "practicas";
  const tipo = CONTRACT_LABEL[employee.contract];
  const titulo = esPracticas ? "Convenio de Prácticas Profesionales" : "Contrato de Trabajo";

  const preamble = `Conste por el presente documento el ${titulo} que celebran, de una parte, ${company.name}, con RUC ${company.ruc}, con domicilio en ${company.address}, ${company.city}, debidamente representada por su representante legal (en adelante, "El Empleador"); y de la otra parte, ${fullName(employee)}, identificado(a) con DNI ${employee.dni}, con domicilio en ${employee.address} (en adelante, "El Trabajador"), en los términos siguientes:`;

  const prueba = trialPeriodDays(employee.regime);
  const pruebaTexto =
    prueba === 0
      ? "No se pacta periodo de prueba, por tratarse de una modalidad formativa."
      : `El periodo de prueba es de ${prueba} días calendario, conforme al artículo 10 del D.S. N.º 003-97-TR.`;

  const beneficios = [
    "Vacaciones: 30 días calendario por año completo de servicios (15 días para pequeña y microempresa, conforme a su régimen).",
    "Gratificaciones legales de Fiestas Patrias y Navidad, equivalentes a una remuneración cada una, con la bonificación extraordinaria cuando corresponda.",
    "Compensación por Tiempo de Servicios (CTS), depositada semestralmente según la ley.",
    "Asignación familiar, cuando el trabajador acredite tener hijos menores o en estudios superiores.",
  ];

  const seguro =
    employee.healthInsurance === "eps"
      ? "El Trabajador será afiliado a una Entidad Prestadora de Salud (EPS) con la cobertura que exige la Ley N.º 26790, descontándose el aporte a su cargo."
      : "El Empleador asumirá el aporte de EsSalud, equivalente al 9% de la remuneración, y brindará la cobertura de salud conforme a la Ley N.º 26790.";

  const clauses: ContractClause[] = [
    {
      heading: "Primera: Objeto",
      body: `El Empleador contrata al Trabajador para desempeñar el cargo de ${employee.position}, bajo la modalidad de ${tipo.toLowerCase()} correspondiente al ${REGIME_LABEL[employee.regime].toLowerCase()}.`,
    },
    {
      heading: "Segunda: Duración y periodo de prueba",
      body: `${plazoText(employee.contract, employee.hireDate, employee.endDate)} ${pruebaTexto}`,
    },
    {
      heading: "Tercera: Jornada y modalidad de trabajo",
      body: `La jornada ordinaria es de 48 horas semanales como máximo, distribuidas de lunes a viernes, con los descansos que fija la ley. La modalidad de prestación es ${WORK_MODE_LABEL[
        employee.workMode
      ].toLowerCase()}. Las horas adicionales se compensan con el recargo del 25% las dos primeras y del 35% las siguientes, conforme al D.S. N.º 007-2002-TR.`,
    },
    {
      heading: "Cuarta: Remuneración",
      body: `El Empleador abonará al Trabajador una remuneración mensual de ${pen(employee.salary)}${
        employee.familyAllowance ? ", más la asignación familiar que corresponde por ley," : ""
      } pagadera dentro de los plazos de ley y sujeta a los descuentos de ley (renta de quinta categoría, aportes previsionales y de salud).`,
    },
    {
      heading: "Quinta: Beneficios sociales",
      body: beneficios.map((b) => `• ${b}`).join("\n"),
    },
    {
      heading: "Sexta: Seguridad social y previsional",
      body: `${seguro} El Trabajador está afiliado al sistema previsional ${PENSION_LABEL[employee.pension]}. Cobertura de salud actual: ${HEALTH_INSURANCE_LABEL[employee.healthInsurance]}.`,
    },
    {
      heading: "Séptima: Obligaciones del Trabajador",
      body: "El Trabajador se obliga a cumplir la jornada, las políticas internas, el reglamento interno de trabajo y las instrucciones de sus jefaturas; a guardar reserva sobre la información de la empresa; y a registrar su asistencia por los medios que el Empleador habilite.",
    },
    {
      heading: "Octava: Confidencialidad y datos personales",
      body: "El Trabajador se obliga a mantener la confidencialidad de la información comercial, técnica y de personal a la que acceda, aun después del término del vínculo. Las partes autorizan el tratamiento de sus datos personales para fines laborales, conforme a la Ley N.º 29733.",
    },
    {
      heading: "Novena: Terminación",
      body: "El contrato termina por el vencimiento del plazo cuando sea a plazo fijo, por renuncia, por mutuo acuerdo, o por las causales de despido previstas en el D.S. N.º 003-97-TR, sin perjuicio de las obligaciones pendientes entre las partes.",
    },
    {
      heading: "Décima: Ley aplicable y jurisdicción",
      body: "El presente contrato se rige por la legislación laboral peruana. Las partes se someten a la jurisdicción de los juzgados laborales del domicilio del centro de trabajo.",
    },
  ];

  return {
    title: titulo,
    preamble,
    clauses,
    signatures: {
      employer: "El Empleador",
      worker: "El Trabajador",
    },
    disclaimer:
      "Modelo de trabajo generado por Moasist. Debe ser revisado y validado por la asesoría laboral de la empresa antes de su suscripción. No constituye firma electrónica ni registro ante la Autoridad Administrativa de Trabajo.",
  };
}
