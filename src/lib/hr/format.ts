import { differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";
import type {
  AttendanceKind,
  ContractType,
  DocKind,
  HealthInsurance,
  InsurerKind,
  Pension,
  Regime,
  RequestKind,
  RequestStatus,
  ViewerMode,
  WorkMode,
} from "@/lib/hr/types";

export const HOY = "2026-11-08";

export const MONTHS = [
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
];

export function inkFor(hex: string): string {
  const raw = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return "#fff7f2";
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.64 ? "#1e1a16" : "#fff7f2";
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const name = MONTHS[(m ?? 1) - 1] ?? period;
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

export function longDate(iso: string): string {
  const raw = format(parseDay(iso), "EEEE d 'de' MMMM yyyy", { locale: es });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function shortDate(iso: string): string {
  return format(parseDay(iso), "d MMM yyyy", { locale: es });
}

export function inclusiveDays(start: string, end: string): number {
  return differenceInCalendarDays(parseDay(end), parseDay(start)) + 1;
}

export function recentPeriods(n = 6, from = HOY): string[] {
  const d = parseDay(from);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(isoDay(dt).slice(0, 7));
  }
  return out;
}

export function currentPeriod(from = HOY): string {
  return from.slice(0, 7);
}

export function pen(n: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDays(n: number): string {
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(n);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function fullName(e: { names: string; paternal: string; maternal: string }): string {
  return [e.names, e.paternal, e.maternal].filter(Boolean).join(" ");
}

export function initials(e: { names: string; paternal: string }): string {
  const a = e.names.trim().charAt(0);
  const b = e.paternal.trim().charAt(0);
  return `${a}${b}`.toUpperCase();
}

/**
 * Nombre corto de la empresa para saludos y cabeceras. Usa `shortName` y cae en
 * `tradeName` o en la primera palabra de la razón social.
 */
export function companyShortName(c: { shortName?: string; tradeName?: string; name?: string }): string {
  return (c.shortName?.trim() || c.tradeName?.trim() || c.name?.trim().split(/\s+/)[0] || "la empresa");
}

/**
 * Saludo de bienvenida según quién entra:
 * - Colaborador / jefatura: saluda por su nombre de pila ("Hola, Randy").
 * - RR.HH. / superadmin: saluda a la empresa en curso ("Hola, INMOA").
 */
export function greeting(
  viewerMode: ViewerMode,
  company: { shortName?: string; tradeName?: string; name?: string },
  employeeName?: string | null,
): string {
  const isCompanyAdmin = viewerMode === "rrhh" || viewerMode === "superadmin";
  const firstName = employeeName?.trim().split(/\s+/)[0];
  if (isCompanyAdmin || !firstName) return `Hola, ${companyShortName(company)}`;
  return `Hola, ${firstName}`;
}

export const PENSION_LABEL: Record<Pension, string> = {
  onp: "ONP",
  habitat: "AFP Habitat",
  integra: "AFP Integra",
  prima: "Prima AFP",
  profuturo: "Profuturo AFP",
  ninguno: "Sin régimen pensionario",
};

export const REGIME_LABEL: Record<Regime, string> = {
  general: "Régimen general",
  pequena: "Pequeña empresa",
  micro: "Microempresa",
  practicante: "Prácticas",
};

export const CONTRACT_LABEL: Record<ContractType, string> = {
  indefinido: "Indefinido",
  plazo_fijo: "Plazo fijo",
  practicas: "Convenio de prácticas",
};

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  presencial: "Presencial (oficina central)",
  campo: "Campo / galpón",
  virtual: "Virtual / remoto",
  hibrido: "Híbrido",
  itinerante: "Itinerante / viajero",
};

export const HEALTH_INSURANCE_LABEL: Record<HealthInsurance, string> = {
  essalud: "EsSalud",
  eps: "EPS",
};

export const INSURER_KIND_LABEL: Record<InsurerKind, string> = {
  sctr: "SCTR",
  eps: "EPS",
  vida_ley: "Seguro de Vida Ley",
};

export const ROLE_LABEL: Record<ViewerMode, string> = {
  superadmin: "Superadministrador (todas las empresas)",
  rrhh: "RR.HH. (solo mi empresa)",
  jefatura: "Jefatura (mi equipo)",
  colaborador: "Colaborador (mi ficha)",
};

export const REQUEST_LABEL: Record<RequestKind, string> = {
  vacaciones: "Vacaciones",
  licencia: "Licencia",
  permiso: "Permiso",
  descanso_medico: "Descanso médico",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export const ATTENDANCE_LABEL: Record<AttendanceKind, string> = {
  presente: "Presente",
  tardanza: "Tardanza",
  falta: "Falta",
  remoto: "Remoto",
  vacaciones: "Vacaciones",
  licencia: "Licencia",
  descanso: "Descanso médico",
};

export const DOC_LABEL: Record<DocKind, string> = {
  contrato: "Contrato",
  boleta: "Boleta",
  politica: "Política",
  anexo: "Anexo",
  certificado: "Certificado",
};

export function ageTone(id: string): "clay" | "moss" | "ink" {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (["clay", "moss", "ink"] as const)[n % 3] ?? "clay";
}
