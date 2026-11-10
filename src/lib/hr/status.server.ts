import { dbSource } from "@/lib/db";
import { isDemoPerson } from "@/lib/hr/seed";
import { buildStatusChecks, type StatusCheck, type StatusFacts } from "@/lib/hr/status";

/**
 * Recolecta los hechos del entorno (server-only) y los traduce a chequeos
 * legibles. Nunca devuelve el valor de una variable: solo si está definida.
 */
export async function collectStatus(): Promise<StatusCheck[]> {
  const { loadDataset } = await import("@/lib/hr/dataset.server");
  const data = await loadDataset();

  const facts: StatusFacts = {
    databasePersistent: dbSource === "neon",
    rucTokenConfigured: Boolean(process.env.RUC_API_TOKEN?.trim()),
    adminPasswordConfigured: Boolean(process.env.MOASIST_ADMIN_PASSWORD?.trim()),
    companyCount: data.companies.length,
    employeeCount: data.employees.length,
    hasDemoPeople: data.employees.some(isDemoPerson),
    isProduction: process.env.NODE_ENV === "production",
  };

  return buildStatusChecks(facts);
}
