/**
 * Tablas paramétricas de SUNAT (Anexo 2) usadas por la ficha del colaborador y
 * por los generadores de importación. Se incluyen las tablas "cortas" que el
 * usuario elige en un desplegable; las tablas largas (ocupación, instituciones
 * educativas, organizaciones sindicales) se digitan por código.
 *
 * Módulo PURO. Al actualizar una tabla de SUNAT, edita aquí y en los tests.
 */

import type { DependentKind, Sex } from "@/lib/hr/types";

/** Situación educativa (tabla 9). */
export const EDUCATION_LEVELS: { code: string; name: string }[] = [
  { code: "01", name: "Sin educación formal" },
  { code: "02", name: "Educación especial incompleta" },
  { code: "03", name: "Educación especial completa" },
  { code: "04", name: "Primaria incompleta" },
  { code: "05", name: "Primaria completa" },
  { code: "06", name: "Secundaria incompleta" },
  { code: "07", name: "Secundaria completa" },
  { code: "08", name: "Técnica incompleta" },
  { code: "09", name: "Técnica completa" },
  { code: "10", name: "Superior (instituto) incompleta" },
  { code: "11", name: "Superior (instituto) completa" },
  { code: "12", name: "Universitaria incompleta" },
  { code: "13", name: "Universitaria completa" },
  { code: "14", name: "Grado de bachiller" },
  { code: "15", name: "Titulado" },
  { code: "16", name: "Estudios de maestría incompletos" },
  { code: "17", name: "Estudios de maestría completos" },
  { code: "18", name: "Grado de maestría" },
  { code: "19", name: "Estudios de doctorado incompletos" },
  { code: "20", name: "Estudios de doctorado completos" },
  { code: "21", name: "Grado de doctor" },
];

/** Nacionalidad (tabla 4). Se listan Perú y las más frecuentes; el resto por código. */
export const NATIONALITIES: { code: string; name: string }[] = [
  { code: "9589", name: "Perú" },
  { code: "9850", name: "Venezuela" },
  { code: "9169", name: "Colombia" },
  { code: "9239", name: "Ecuador" },
  { code: "9097", name: "Bolivia" },
  { code: "9211", name: "Chile" },
  { code: "9063", name: "Argentina" },
  { code: "9105", name: "Brasil" },
  { code: "9245", name: "España" },
  { code: "9249", name: "Estados Unidos" },
  { code: "9493", name: "México" },
  { code: "9215", name: "China" },
  { code: "9399", name: "Japón" },
  { code: "9507", name: "Namibia" },
  { code: "9011", name: "Otros países o lugares" },
];

/** Código de nacionalidad por defecto (Perú). */
export const NATIONALITY_DEFAULT = "9589";

/** Sexo para el T-Registro. */
export const SEX_OPTIONS: { value: Sex; name: string }[] = [
  { value: "masculino", name: "Masculino" },
  { value: "femenino", name: "Femenino" },
];

/** Vínculos familiares que ofrece la ficha (tabla 19). */
export const DEPENDENT_OPTIONS: { value: DependentKind; name: string }[] = [
  { value: "conyuge", name: "Cónyuge" },
  { value: "concubino", name: "Concubina(o)" },
  { value: "hijo", name: "Hijo(a)" },
  { value: "hijo_incapacitado", name: "Hijo(a) mayor incapacitado" },
  { value: "gestante", name: "Gestante" },
];

/** Nombre de una nacionalidad por su código (tabla 4). */
export function nationalityName(code: string | undefined): string {
  if (!code) return "Perú";
  return NATIONALITIES.find((n) => n.code === code)?.name ?? code;
}

/** Nombre de una situación educativa por su código (tabla 9). */
export function educationName(code: string | undefined): string {
  if (!code) return "";
  return EDUCATION_LEVELS.find((e) => e.code === code)?.name ?? code;
}
