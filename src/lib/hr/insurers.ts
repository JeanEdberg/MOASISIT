import type { HrData, Insurer, InsurerKind } from "@/lib/hr/types";

/**
 * Catálogo de aseguradoras vigentes en el Perú para los tres seguros que exige
 * la planilla (EPS, SCTR y Vida Ley). Los ids siguen el patrón
 * `<prefijoEmpresa>-<segmento>-<slug>` para que sigan resolviendo los
 * colaboradores ya registrados y para que la normalización sea idempotente.
 *
 * Las tasas son referenciales y editables en "Empresa → Aseguradoras": cada
 * aseguradora las ajusta por actividad y tramo, y cambian por año.
 */

/** Crédito EPS: 25% del aporte a EsSalud (9%) = 2.25% de la remuneración (Ley 26790). */
const EPS_RATE = 2.25;

/** Prefijo de los ids de aseguradora por empresa (los existentes no se tocan). */
const COMPANY_PREFIX: Record<string, string> = {
  inmoa: "inmoa",
  "7pollitos": "7p",
  plumifero: "plu",
};

type CatalogEntry = {
  kind: InsurerKind;
  /** Segmento usado en el id ("vida_ley" se acorta a "vida"). */
  seg: string;
  slug: string;
  name: string;
  rate?: number;
  pensionRate?: number;
  healthRate?: number;
};

const INSURER_CATALOG: readonly CatalogEntry[] = [
  // EPS: las cinco autorizadas y supervisadas por SUSALUD.
  { kind: "eps", seg: "eps", slug: "rimac", name: "Rímac EPS", rate: EPS_RATE },
  { kind: "eps", seg: "eps", slug: "pacifico", name: "Pacífico EPS", rate: EPS_RATE },
  { kind: "eps", seg: "eps", slug: "mapfre", name: "MAPFRE EPS", rate: EPS_RATE },
  { kind: "eps", seg: "eps", slug: "sanitas", name: "Sanitas EPS", rate: EPS_RATE },
  { kind: "eps", seg: "eps", slug: "lapositiva", name: "La Positiva EPS", rate: EPS_RATE },
  // SCTR: prima de pensión + salud (varía por aseguradora y actividad).
  { kind: "sctr", seg: "sctr", slug: "rimac", name: "Rímac Seguros (SCTR)", pensionRate: 0.9, healthRate: 0.6 },
  { kind: "sctr", seg: "sctr", slug: "pacifico", name: "Pacífico Seguros (SCTR)", pensionRate: 0.83, healthRate: 0.6 },
  { kind: "sctr", seg: "sctr", slug: "lapositiva", name: "La Positiva (SCTR)", pensionRate: 0.83, healthRate: 0.75 },
  { kind: "sctr", seg: "sctr", slug: "mapfre", name: "MAPFRE Seguros (SCTR)", pensionRate: 0.83, healthRate: 0.6 },
  { kind: "sctr", seg: "sctr", slug: "interseguro", name: "Interseguro (SCTR)", pensionRate: 0.85, healthRate: 0.65 },
  { kind: "sctr", seg: "sctr", slug: "protecta", name: "Protecta Security (SCTR)", pensionRate: 0.9, healthRate: 0.6 },
  { kind: "sctr", seg: "sctr", slug: "crecer", name: "Crecer Seguros (SCTR)", pensionRate: 0.9, healthRate: 0.7 },
  // Vida Ley: tasa total (varía por aseguradora y tramo de edad).
  { kind: "vida_ley", seg: "vida", slug: "rimac", name: "Rímac (Vida Ley)", rate: 0.53 },
  { kind: "vida_ley", seg: "vida", slug: "pacifico", name: "Pacífico (Vida Ley)", rate: 0.53 },
  { kind: "vida_ley", seg: "vida", slug: "lapositiva", name: "La Positiva (Vida Ley)", rate: 0.55 },
  { kind: "vida_ley", seg: "vida", slug: "mapfre", name: "Mapfre (Vida Ley)", rate: 0.55 },
  { kind: "vida_ley", seg: "vida", slug: "interseguro", name: "Interseguro (Vida Ley)", rate: 0.6 },
];

export function insurerPrefix(companyId: string): string {
  return COMPANY_PREFIX[companyId] ?? companyId;
}

/** Todas las aseguradoras del catálogo, con ids prefijados por empresa. */
export function catalogInsurers(companyId: string): Insurer[] {
  const prefix = insurerPrefix(companyId);
  return INSURER_CATALOG.map((entry) => {
    const insurer: Insurer = {
      id: `${prefix}-${entry.seg}-${entry.slug}`,
      name: entry.name,
      kind: entry.kind,
      active: true,
    };
    if (entry.rate != null) insurer.rate = entry.rate;
    if (entry.pensionRate != null) insurer.pensionRate = entry.pensionRate;
    if (entry.healthRate != null) insurer.healthRate = entry.healthRate;
    return insurer;
  });
}

/**
 * Agrega a cada empresa las aseguradoras del catálogo que aún no tenga, sin
 * tocar las existentes (ni sus tasas editadas). Datasets creados antes del
 * catálogo traían una sola aseguradora por tipo; esto los completa al cargar.
 * Devuelve el mismo objeto si no hubo cambios, para no reescribir la fila.
 */
export function withInsurerCatalog(data: HrData): HrData {
  let changed = false;
  const companies = data.companies.map((company) => {
    const existing = company.insurers ?? [];
    const existingIds = new Set(existing.map((i) => i.id));
    const missing = catalogInsurers(company.id).filter((i) => !existingIds.has(i.id));
    if (missing.length === 0) return company;
    changed = true;
    return { ...company, insurers: [...existing, ...missing] };
  });
  if (!changed) return data;
  const company = companies.find((c) => c.id === data.company.id) ?? data.company;
  return { ...data, company, companies };
}
