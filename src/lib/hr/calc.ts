import { differenceInCalendarDays, differenceInMonths } from "date-fns";
import { fifthCategoryParamsOf, projectFifthCategory } from "@/lib/hr/fifth";
import { HOY, inclusiveDays, parseDay, round2, fullName } from "@/lib/hr/format";
import type {
  Attendance,
  Company,
  Employee,
  PayLine,
  Payslip,
  TimeRequest,
} from "@/lib/hr/types";

/** Cálculo referencial de planilla peruana bajo D. Leg. 650 y Ley 27735. */

/** Resuelve una aseguradora vigente de la empresa por su id (null si no aplica). */
export function activeInsurer(company: Company, insurerId: string | null | undefined) {
  if (!insurerId) return null;
  const found = company.insurers?.find((i) => i.id === insurerId && i.active);
  return found ?? null;
}

export function payFactor(emp: Employee, period: string): number {
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, 1);
  const end = new Date(y, m ?? 1, 0);
  const hire = parseDay(emp.hireDate);
  const exit = emp.endDate ? parseDay(emp.endDate) : null;
  if (emp.status === "cesado" && exit && exit < start) return 0;
  const from = hire > start ? hire : start;
  const to = exit && exit < end ? exit : end;
  if (to < from) return 0;
  if (from.getTime() === start.getTime() && to.getTime() === end.getTime()) return 1;
  const days = differenceInCalendarDays(to, from) + 1;
  return Math.min(1, days / 30);
}

function monthIndex(period: string): number {
  return Number(period.slice(5, 7));
}

/**
 * Cómputo legal de meses comerciales y días computables según D. Leg. 650.
 * Cada mes calendario completo laborado equivale a 1 mes comercial (30 días).
 */
export function getCommercialMonthsAndDays(from: Date, to: Date): { months: number; days: number } {
  if (to < from) return { months: 0, days: 0 };
  let months = 0;
  let days = 0;

  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const endLimit = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cur <= endLimit) {
    const dim = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    const mStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const mEnd = new Date(cur.getFullYear(), cur.getMonth(), dim);

    const effStart = from > mStart ? from : mStart;
    const effEnd = to < mEnd ? to : mEnd;
    const daysWorked = differenceInCalendarDays(effEnd, effStart) + 1;

    if (daysWorked >= dim || (effStart.getDate() === 1 && effEnd.getDate() === dim)) {
      months++;
    } else {
      days += daysWorked;
    }
    cur.setMonth(cur.getMonth() + 1);
  }

  return { months, days };
}

export function ctsSemester(
  emp: Employee,
  company: Company,
  year: number,
  which: "may" | "nov",
): number {
  if (emp.regime === "practicante" || emp.regime === "micro") return 0;
  const start = which === "nov" ? parseDay(`${year}-05-01`) : parseDay(`${year - 1}-11-01`);
  const end = which === "nov" ? parseDay(`${year}-10-31`) : parseDay(`${year}-04-30`);
  const hire = parseDay(emp.hireDate);
  const exit = emp.endDate ? parseDay(emp.endDate) : null;
  const from = hire > start ? hire : start;
  const to = exit && exit < end ? exit : end;

  const { months, days } = getCommercialMonthsAndDays(from, to);
  if (months === 0 && days === 0) return 0;

  const af = emp.familyAllowance ? company.rmv * 0.1 : 0;
  const ordinary = emp.salary + af;

  // Validación de percepción de gratificación en el semestre anterior (para el sexto de CTS)
  let percibeSextoGratifi = true;
  if (which === "nov") {
    const limiteGratiJulio = parseDay(`${year}-07-01`);
    if (hire >= limiteGratiJulio) percibeSextoGratifi = false;
  } else {
    const limiteGratiNavidad = parseDay(`${year - 1}-12-01`);
    if (hire >= limiteGratiNavidad) percibeSextoGratifi = false;
  }

  // 1/6 de Gratificación percibida
  let sextoGratificacion = 0;
  if (percibeSextoGratifi) {
    sextoGratificacion = emp.sextoGratificacion != null ? emp.sextoGratificacion : round2(ordinary / 6);
  }

  const computable = ordinary + sextoGratificacion;
  const share = emp.regime === "pequena" ? 0.5 : 1;

  const montoMeses = computable * (months / 12);
  const montoDias = computable * (days / 360);

  return round2((montoMeses + montoDias) * share);
}

// Cálculo de Gratificación: Estrictamente por meses completos calendario (Ley 27735)
export function gratuityAmount(
  emp: Employee,
  company: Company,
  year: number,
  which: "julio" | "navidad",
): { grat: number; bonif: number } {
  if (emp.regime === "practicante" || emp.regime === "micro") return { grat: 0, bonif: 0 };

  const start = which === "julio" ? parseDay(`${year}-01-01`) : parseDay(`${year}-07-01`);
  const end = which === "julio" ? parseDay(`${year}-06-30`) : parseDay(`${year}-12-31`);
  const hire = parseDay(emp.hireDate);
  const exit = emp.endDate ? parseDay(emp.endDate) : null;
  const from = hire > start ? hire : start;
  const to = exit && exit < end ? exit : end;

  if (to < from) return { grat: 0, bonif: 0 };

  const { months } = getCommercialMonthsAndDays(from, to);
  const monthsWorked = Math.min(6, months);
  if (monthsWorked <= 0) return { grat: 0, bonif: 0 };

  const af = emp.familyAllowance ? company.rmv * 0.1 : 0;
  const baseMonthly = emp.salary + af;
  const share = emp.regime === "pequena" ? 0.5 : 1;

  const rawGrat = (baseMonthly * (monthsWorked / 6)) * share;
  const grat = round2(rawGrat);
  const bonif = round2(grat * 0.09); // 9% EsSalud (Ley 30334 / Ley 29351)

  return { grat, bonif };
}

// ----------------------------------------------------------------------
// CONSOLIDADO MASIVO DE BENEFICIOS SOCIALES POR EMPRESA
// ----------------------------------------------------------------------
export interface ConsolidadoBeneficioItem {
  dni: string;
  nombre: string;
  name: string;
  regimen: string;
  fechaIngreso: string;
  sueldoComputable: number;
  detalleCalculo: string;
  totalPagar: number;
  salaryBank?: string;
  salaryAccount?: string;
  ctsBank?: string;
  ctsAccount?: string;
}

export function calcularConsolidadoMasivo(
  employees: Employee[],
  company: Company,
  tipo: "cts-may" | "cts-nov" | "grati-julio" | "grati-navidad",
  year: number
): ConsolidadoBeneficioItem[] {
  return employees.map((emp) => {
    let monto = 0;
    let detalle = "";
    const af = emp.familyAllowance ? company.rmv * 0.1 : 0;
    const ordinary = emp.salary + af;

    if (tipo === "cts-may" || tipo === "cts-nov") {
      const which = tipo === "cts-nov" ? "nov" : "may";
      monto = ctsSemester(emp, company, year, which);
      const hire = parseDay(emp.hireDate);
      const incluyeSexto = which === "nov" ? hire < parseDay(`${year}-07-01`) : hire < parseDay(`${year - 1}-12-01`);
      
      let sextoVal = 0;
      if (incluyeSexto) {
        sextoVal = emp.sextoGratificacion != null ? emp.sextoGratificacion : round2(ordinary / 6);
      }
      
      detalle = `Sueldo + AF: S/. ${ordinary.toFixed(2)} | 1/6 Grati: ${incluyeSexto ? `S/. ${sextoVal.toFixed(2)}` : "No"}`;
    } else {
      const which = tipo === "grati-julio" ? "julio" : "navidad";
      const res = gratuityAmount(emp, company, year, which);
      monto = res.grat + res.bonif;
      detalle = `Grati: S/. ${res.grat.toFixed(2)} + Bono 9%: S/. ${res.bonif.toFixed(2)}`;
    }

    const nombreCompleto = fullName(emp);

    return {
      dni: emp.dni,
      nombre: nombreCompleto,
      name: nombreCompleto,
      regimen: emp.regime,
      fechaIngreso: emp.hireDate,
      sueldoComputable: round2(ordinary),
      detalleCalculo: detalle,
      totalPagar: monto,
      salaryBank: emp.salaryBank || emp.bank || "BCP",
      salaryAccount: emp.salaryAccount || emp.account || "Sin registrar",
      ctsBank: emp.ctsBank || "BCP",
      ctsAccount: emp.ctsAccount || "Sin registrar",
    };
  }).filter((item) => item.totalPagar > 0);
}

function vacationRate(emp: Employee): number {
  if (emp.regime === "general") return 2.5;
  return 1.25;
}

export function vacationEarned(emp: Employee, asOf = HOY): number {
  const start = parseDay(emp.hireDate);
  const end = parseDay(asOf);
  if (end < start) return 0;
  const months = Math.max(0, differenceInMonths(end, start));
  return round2(months * vacationRate(emp));
}

export function vacationTaken(emp: Employee, requests: TimeRequest[]): number {
  const approved = requests
    .filter((r) => r.employeeId === emp.id && r.kind === "vacaciones" && r.status === "aprobada")
    .reduce((sum, r) => sum + Math.max(0, inclusiveDays(r.start, r.end)), 0);
  return round2(emp.vacationHistory + approved);
}

export function vacationPending(emp: Employee, requests: TimeRequest[]): number {
  return round2(
    requests
      .filter((r) => r.employeeId === emp.id && r.kind === "vacaciones" && r.status === "pendiente")
      .reduce((sum, r) => sum + Math.max(0, inclusiveDays(r.start, r.end)), 0),
  );
}

export function vacationBalance(emp: Employee, requests: TimeRequest[], asOf = HOY): number {
  return round2(vacationEarned(emp, asOf) - vacationTaken(emp, requests));
}

export type PayrollInput = {
  employees: Employee[];
  company: Company;
  attendance: Attendance[];
  snapshots: Record<string, Payslip[]>;
};

export function calcPayslip(
  emp: Employee,
  company: Company,
  period: string,
  attendance: Attendance[],
): Payslip {
  const factor = payFactor(emp, period);
  const empty: Payslip = {
    employeeId: emp.id,
    period,
    factor,
    lines: [],
    gross: 0,
    discounts: 0,
    net: 0,
    essalud: 0,
    eps: 0,
    sctr: 0,
    sctrSalud: 0,
    sctrPension: 0,
    vidaLey: 0,
    pensionBase: 0,
    fifth: 0,
    cts: null,
    cappedPension: false,
  };
  if (factor <= 0) return empty;

  const month = monthIndex(period);
  const year = Number(period.slice(0, 4));
  
  // Integración automática de asistencias (faltas y tardanzas)
  const marks = attendance.filter((a) => a.employeeId === emp.id && a.date.startsWith(period));
  const faltas = marks.filter((a) => a.kind === "falta").length;
  const tardanzas = marks.filter((a) => a.kind === "tardanza").length;

  let minutosTardanzaTotales = 0;
  for (const m of marks) {
    if (m.kind === "tardanza" && m.checkIn) {
      const [hIn, minIn] = m.checkIn.split(":").map(Number);
      const totalMinIn = hIn * 60 + minIn;
      const limiteTolerancia = 8 * 60 + 15; // Tolerancia estándar 08:15 AM
      if (totalMinIn > limiteTolerancia) {
        minutosTardanzaTotales += (totalMinIn - (8 * 60));
      }
    }
  }

  const extra25 = marks.reduce((s, a) => s + a.extra25, 0);
  const extra35 = marks.reduce((s, a) => s + a.extra35, 0);
  const hourly = emp.salary / 30 / 8;

  const basic = round2(emp.salary * factor);
  const af = emp.familyAllowance ? round2(company.rmv * 0.1 * factor) : 0;
  const he25 = round2(hourly * 1.25 * extra25);
  const he35 = round2(hourly * 1.35 * extra35);
  const extraPay = round2(he25 + he35);

  // Cálculo de descuentos por faltas (proporcional a 30 días) y tardanzas
  const faltaDiscount = Math.min(basic, round2((emp.salary / 30) * faltas));
  const tardanzaDiscount = round2((hourly / 60) * minutosTardanzaTotales);
  const paidBasic = round2(basic - faltaDiscount - tardanzaDiscount);

  let grat = 0;
  let bonif = 0;
  if (month === 7) {
    const resGrati = gratuityAmount(emp, company, year, "julio");
    grat = resGrati.grat;
    bonif = resGrati.bonif;
  } else if (month === 12) {
    const resGrati = gratuityAmount(emp, company, year, "navidad");
    grat = resGrati.grat;
    bonif = resGrati.bonif;
  }

  const lines: PayLine[] = [];
  const push = (code: string, name: string, amount: number, kind: PayLine["kind"]) => {
    if (amount > 0.004) lines.push({ code, name, amount: round2(amount), kind });
  };

  push("BAS", "Remuneración básica", basic, "ingreso");
  push("AF", "Asignación familiar", af, "ingreso");
  push("HE25", "Horas extra 25%", he25, "ingreso");
  push("HE35", "Horas extra 35%", he35, "ingreso");
  push("GRA", "Gratificación legal", grat, "ingreso");
  push("BON", "Bonificación extraordinaria", bonif, "ingreso");
  push("FAL", faltas === 1 ? "Falta injustificada" : `Faltas injustificadas (${faltas})`, faltaDiscount, "descuento");
  push("TAR", tardanzas === 1 ? "Descuento por tardanza" : `Descuentos por tardanzas (${tardanzas})`, tardanzaDiscount, "descuento");

  const afecto = round2(paidBasic + af + extraPay);
  let pensionBase = 0;
  let cappedPension = false;
  if (emp.pension !== "ninguno" && emp.regime !== "practicante") {
    pensionBase = afecto;
    if (emp.pension !== "onp" && afecto > company.topeAfp) {
      pensionBase = round2(company.topeAfp);
      cappedPension = true;
    }
    if (emp.pension === "onp") {
      push("ONP", "Aporte ONP", pensionBase * company.onp, "descuento");
    } else {
      const com = company.afpComision[emp.pension];
      push("AFP", "Aporte obligatorio AFP", pensionBase * company.afpAporte, "descuento");
      push("COMI", "Comisión AFP", pensionBase * com, "descuento");
      push("SEGU", "Prima de seguro AFP", pensionBase * company.afpSeguro, "descuento");
    }
  }

  const ordinary = round2(paidBasic + af);
  const gratTimes = emp.regime === "general" ? 2 : emp.regime === "pequena" ? 1 : 0;
  // La retención de quinta categoría solo aplica si el colaborador está marcado
  // como afecto. Se proyecta su renta anual y se descuenta la doceava parte.
  const fifthParams = fifthCategoryParamsOf(company);
  const projection = projectFifthCategory({
    ordinaryMonthly: ordinary,
    extrasMonthly: extraPay,
    gratificationsPerYear: gratTimes,
    params: fifthParams,
    uit: company.uit,
  });
  const fifth = emp.fifthCategory ? projection.monthlyTax : 0;
  push("5TA", "Renta de quinta categoría", fifth, "descuento");

  const gross = round2(lines.filter((l) => l.kind === "ingreso").reduce((s, l) => s + l.amount, 0));
  const discounts = round2(lines.filter((l) => l.kind === "descuento").reduce((s, l) => s + l.amount, 0));

  // Base de aportes del empleador (remuneración afecta: básico pagado + AF + horas extra).
  const essaludBase = round2(paidBasic + af + extraPay);

  // Salud: EsSalud (9%) o EPS. La EPS se financia dentro del 9% de EsSalud, con
  // una porción (2.25% referencial) que se muestra aparte como aporte informativo.
  const esPracticante = emp.regime === "practicante";
  const epsInsurer = activeInsurer(company, emp.epsInsurerId);
  const usingEps = emp.healthInsurance === "eps" && Boolean(epsInsurer);
  const essalud = esPracticante ? 0 : round2(essaludBase * company.essalud);
  push(
    "ESS",
    esPracticante ? "Cobertura de salud practicante" : usingEps ? "EsSalud empleador (EPS)" : "EsSalud empleador",
    essalud,
    "aporte",
  );
  const eps = usingEps ? round2(essaludBase * ((epsInsurer?.rate ?? company.epsAporteTrabajador * 100) / 100)) : 0;
  if (eps > 0) push("EPS", `Aporte EPS ${epsInsurer?.name ?? ""}`.trim(), eps, "aporte");

  // SCTR (Seguro Complementario de Trabajo de Riesgo): la prima se compone de
  // un componente de salud y otro de pensión. SUNAT los exige desglosados, así
  // que se calculan y muestran por separado.
  const sctrInsurer = activeInsurer(company, emp.sctrInsurerId);
  const sctrSalud = sctrInsurer ? round2(essaludBase * ((sctrInsurer.healthRate ?? 0) / 100)) : 0;
  const sctrPension = sctrInsurer ? round2(essaludBase * ((sctrInsurer.pensionRate ?? 0) / 100)) : 0;
  const sctr = round2(sctrSalud + sctrPension);
  const sctrName = sctrInsurer?.name ?? "";
  if (sctrSalud > 0) push("SCTR-SAL", `SCTR Salud ${sctrName}`.trim(), sctrSalud, "aporte");
  if (sctrPension > 0) push("SCTR-PEN", `SCTR Pensión ${sctrName}`.trim(), sctrPension, "aporte");

  // Seguro de Vida Ley: prima a cargo del empleador.
  const vidaInsurer = activeInsurer(company, emp.vidaLeyInsurerId);
  const vidaLey = vidaInsurer ? round2(essaludBase * ((vidaInsurer.rate ?? 0) / 100)) : 0;
  if (vidaLey > 0) push("VIDALEY", `Seguro Vida Ley ${vidaInsurer?.name ?? ""}`.trim(), vidaLey, "aporte");

  const cts =
    month === 5 ? ctsSemester(emp, company, year, "may") : month === 11 ? ctsSemester(emp, company, year, "nov") : null;

  return {
    employeeId: emp.id,
    period,
    factor,
    lines,
    gross,
    discounts,
    net: round2(gross - discounts),
    essalud,
    eps,
    sctr,
    sctrSalud,
    sctrPension,
    vidaLey,
    pensionBase: round2(pensionBase),
    fifth,
    cts,
    cappedPension,
  };
}

export function livePayslips(data: Pick<PayrollInput, "employees" | "company" | "attendance">, period: string): Payslip[] {
  return data.employees
    .map((e) => calcPayslip(e, data.company, period, data.attendance))
    .filter((p) => p.factor > 0);
}

export function payslipsFor(data: PayrollInput, period: string): Payslip[] {
  const frozen = data.snapshots[period];
  if (frozen) return frozen;
  return livePayslips(data, period);
}

export function payslipFor(data: PayrollInput, employeeId: string, period: string): Payslip | null {
  return payslipsFor(data, period).find((p) => p.employeeId === employeeId) ?? null;
}