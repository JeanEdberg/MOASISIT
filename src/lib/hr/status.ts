/**
 * Estado de configuración del sistema, para el panel "Puesta en marcha".
 *
 * Este módulo es PURO: recibe hechos crudos (sin secretos) y decide qué está
 * listo, qué falta y qué es crítico. La recolección de esos hechos vive en
 * `status.server.ts`; así la lógica se prueba sin tocar la base ni el entorno.
 */

export type StatusLevel = "ok" | "warn" | "danger";

export type StatusCheck = {
  id: string;
  title: string;
  /** Qué significa y por qué importa, en palabras simples. */
  detail: string;
  level: StatusLevel;
  /** Acción sugerida cuando no está en verde. */
  fix?: string;
};

/** Hechos del entorno que el servidor reporta (nunca incluye valores secretos). */
export type StatusFacts = {
  /** true = Postgres (Neon): los datos persisten. false = PGLite en memoria. */
  databasePersistent: boolean;
  /** true = hay un proveedor de RUC con token propio configurado. */
  rucTokenConfigured: boolean;
  /** true = se definió MOASIST_ADMIN_PASSWORD (contraseña inicial propia). */
  adminPasswordConfigured: boolean;
  /** Cuántas empresas existen hoy en el dataset. */
  companyCount: number;
  /** Cuántos colaboradores existen hoy. */
  employeeCount: number;
  /** true = todavía hay personas de ejemplo (Andes & Cacao) sin quitar. */
  hasDemoPeople: boolean;
  /** true = la app corre en producción (NODE_ENV=production). */
  isProduction: boolean;
  /** Cuántas suscripciones están vencidas (danger). */
  subscriptionsOverdue: number;
  /** Cuántas suscripciones vencen dentro de 7 días (warn). */
  subscriptionsDueSoon: number;
};

/**
 * Traduce los hechos a una lista de chequeos legibles, ordenados por
 * importancia (lo crítico primero).
 */
export function buildStatusChecks(facts: StatusFacts): StatusCheck[] {
  const checks: StatusCheck[] = [];
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  checks.push(
    facts.databasePersistent
      ? {
          id: "db",
          title: "Base de datos permanente",
          detail: "Tus datos se guardan en la nube y no se borran al reiniciar ni al desplegar.",
          level: "ok",
        }
      : {
          id: "db",
          title: "Base de datos temporal (memoria)",
          detail:
            "Ahora mismo los datos viven solo en memoria: se BORRAN cada vez que se reinicia o se vuelve a desplegar. Sirve para demos, no para uso real.",
          level: "danger",
          fix: "Conecta Neon (DATABASE_URL en Vercel) siguiendo la guía de puesta en marcha.",
        },
  );

  checks.push(
    facts.rucTokenConfigured
      ? {
          id: "ruc",
          title: "Consulta de RUC con tu propio token",
          detail: "La búsqueda de RUC usa tu proveedor con cuota propia (1,000 consultas/mes).",
          level: "ok",
        }
      : {
          id: "ruc",
          title: "Consulta de RUC en modo gratuito",
          detail:
            "La búsqueda de RUC funciona, pero con el servicio público de cuota limitada. Si se agota, podrás escribir los datos a mano.",
          level: "warn",
          fix: "Opcional: define RUC_API_ENDPOINT y RUC_API_TOKEN en Vercel para usar tu propio token.",
        },
  );

  checks.push(
    facts.adminPasswordConfigured
      ? {
          id: "admin",
          title: "Contraseña de Administración definida",
          detail: "La cuenta de Administración usa la contraseña que definiste.",
          level: "ok",
        }
      : {
          id: "admin",
          title: "Contraseña de Administración automática",
          detail:
            "No definiste MOASIST_ADMIN_PASSWORD: la app generó una al azar y la mostró en los registros del servidor.",
          level: "warn",
          fix: "Define MOASIST_ADMIN_PASSWORD en Vercel para controlar la contraseña inicial.",
        },
  );

  checks.push(
    facts.companyCount > 1
      ? {
          id: "companies",
          title: `${facts.companyCount} empresas registradas`,
          detail: `Tienes ${facts.companyCount} empresas y ${facts.employeeCount} colaboradores.`,
          level: "ok",
        }
      : {
          id: "companies",
          title: "Empresa pendiente de configurar",
          detail:
            facts.companyCount === 1
              ? `Solo está la empresa inicial. Tienes ${facts.employeeCount} colaboradores.`
              : "Todavía no hay empresas registradas.",
          level: "warn",
          fix: "Crea tus empresas en Empresa → Nueva empresa.",
        },
  );

  if (facts.hasDemoPeople) {
    checks.push({
      id: "demo",
      title: "Datos de ejemplo presentes",
      detail:
        'Todavía aparecen personas de ejemplo ("Andes & Cacao"). Son ficticias y sirven para recorrer el producto.',
      level: "warn",
      fix: "Cuando estés listo, ve a Empresa → Quitar personas de ejemplo.",
    });
  }

  if (facts.subscriptionsOverdue > 0) {
    checks.push({
      id: "subscriptions",
      title: `${facts.subscriptionsOverdue} ${plural(facts.subscriptionsOverdue, "suscripción vencida", "suscripciones vencidas")}`,
      detail: "Una o más empresas tienen el periodo pagado vencido y siguen facturándose.",
      level: "danger",
      fix: "Entra a Empresa → Suscripciones y registra el cobro, o cancela la suscripción.",
    });
  } else if (facts.subscriptionsDueSoon > 0) {
    checks.push({
      id: "subscriptions",
      title: `${facts.subscriptionsDueSoon} ${plural(facts.subscriptionsDueSoon, "suscripción por vencer", "suscripciones por vencer")}`,
      detail: "Alguna empresa cumple su fecha de cobro en los próximos 7 días.",
      level: "warn",
      fix: "Revisa Empresa → Suscripciones para preparar la renovación.",
    });
  }

  return checks;
}

/** Resumen global: el peor nivel entre los chequeos define el estado. */
export function overallLevel(checks: StatusCheck[]): StatusLevel {
  if (checks.some((c) => c.level === "danger")) return "danger";
  if (checks.some((c) => c.level === "warn")) return "warn";
  return "ok";
}

/** Cuántos chequeos están pendientes (warn + danger). */
export function pendingCount(checks: StatusCheck[]): number {
  return checks.filter((c) => c.level !== "ok").length;
}
