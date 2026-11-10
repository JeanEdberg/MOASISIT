import { getSql } from "@/lib/db";
import { withFifthCategory } from "@/lib/hr/fifth";
import { withInsurerCatalog } from "@/lib/hr/insurers";
import { createDemo, withDemoFlags } from "@/lib/hr/seed";
import { withSubscriptions } from "@/lib/hr/subscription";
import {
  bumpFailedAttempt,
  createSession,
  generatePin,
  getCredential,
  listCredentials,
  lockRemainingMs,
  resetAttempts,
  setAdminPassword,
  setEmployeeCredential,
  updateSecret,
  verifySecret,
  type SessionInfo,
} from "@/lib/hr/credentials.server";
import type { HrData, ViewerMode } from "@/lib/hr/types";

/**
 * Server-authoritative dataset. The whole HR document lives in one `hr_dataset`
 * row (JSONB). The client never receives data its role may not see: every read
 * is filtered here (by company AND by role), and every write is role-checked
 * before it reaches the row.
 */

/**
 * Correo del administrador (superadmin). Se puede definir con la variable de
 * entorno MOASIST_ADMIN_LOGIN; si no, usa el valor histórico de INMOA. No es un
 * secreto, pero sacarlo del código permite cambiarlo por despliegue.
 */
export const ADMIN_LOGIN = process.env.MOASIST_ADMIN_LOGIN?.trim() || "inmoalogisticaysoluciones@gmail.com";
/** The developer account: sees and switches across every company. */
export const ADMIN_ROLE: ViewerMode = "superadmin";

const DATASET_ID = 1;

/** Roles assigned to the seeded employee accounts, keyed by DNI. */
const SEED_ROLES: Record<string, ViewerMode> = {
  "47090484": "rrhh", // Ericka — RR.HH. de INMOA
  "72853279": "jefatura", // Randy — jefatura de su equipo
  "45218377": "rrhh", // María Elena — RR.HH. de Los 7 Pollitos
  "43890125": "rrhh", // Carlos — RR.HH. de Plumífero
};

type DatasetRow = { data: HrData };

export async function loadDataset(): Promise<HrData> {
  const sql = await getSql();
  const rows = await sql<DatasetRow>`select data from hr_dataset where id = ${DATASET_ID}`;
  if (rows[0]?.data) {
    const normalized = withInsurerCatalog(rows[0].data);
    const flagged = withDemoFlags(normalized);
    const withSubs = withSubscriptions(flagged);
    const migrated = withFifthCategory(withSubs);
    if (migrated !== rows[0].data) await saveDataset(migrated);
    return migrated;
  }
  return seedDataset();
}

/**
 * Seed once, idempotently. Call before reading credentials so the first
 * sign-in attempt has an account to match (and the one-time secrets get logged).
 */
let seedOnce: Promise<void> | null = null;
export function ensureSeeded(): Promise<void> {
  seedOnce ??= loadDataset().then(() => undefined).catch((err) => {
    seedOnce = null;
    throw err;
  });
  return seedOnce;
}

export async function saveDataset(data: HrData): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into hr_dataset (id, data, updated_at) values (${DATASET_ID}, ${JSON.stringify(data)}::jsonb, now())
    on conflict (id) do update set data = excluded.data, updated_at = now()
  `;
}

/** Seed the dataset once, and mint first-login credentials for the admin and employees. */
async function seedDataset(): Promise<HrData> {
  const data = createDemo();
  await saveDataset(data);
  await seedCredentials(data);
  return data;
}

/**
 * Create the admin + employee credentials. Prints the one-time secrets to the
 * server log: this is the private channel where the operator reads them and
 * hands each PIN to its owner. Secrets are never stored in plaintext.
 */
async function seedCredentials(data: HrData): Promise<void> {
  const existing = await listCredentials();
  if (existing.length > 0) return;

  const lines: string[] = [];
  const adminPassword = process.env.MOASIST_ADMIN_PASSWORD?.trim() || generatePin().repeat(3);
  await setAdminPassword({ login: ADMIN_LOGIN, password: adminPassword, email: ADMIN_LOGIN, role: ADMIN_ROLE, mustChange: true });
  lines.push(`ADMIN  ${ADMIN_LOGIN}  password: ${adminPassword}  (superadmin: todas las empresas)`);

  for (const emp of data.employees) {
    const pin = generatePin();
    await setEmployeeCredential({
      login: emp.dni,
      employeeId: emp.id,
      role: SEED_ROLES[emp.dni] ?? "colaborador",
      email: emp.email || null,
      companyId: emp.companyId,
      pin,
      mustChange: true,
    });
    const company = data.companies.find((c) => c.id === emp.companyId)?.tradeName ?? emp.companyId;
    lines.push(`DNI    ${emp.dni}  ${emp.names} ${emp.paternal}  [${company}]  PIN: ${pin}`);
  }

  // El registro de credenciales iniciales muestra DNI y PIN en la consola del
  // servidor. Es útil en la primera instalación; en un servidor compartido se
  // desactiva con MOASIST_LOG_CREDENTIALS=false.
  if (process.env.MOASIST_LOG_CREDENTIALS === "false") return;
  console.log(
    "\n[moasist] Credenciales iniciales (cámbialas en el primer ingreso; entrega cada PIN en privado):\n  " +
      lines.join("\n  ") +
      "\n",
  );
}

/** The company a session is scoped to (its active company). */
export { activeCompanyId, sanitizeForViewer } from "@/lib/hr/viewer-scope";

// ── Sign-in / session orchestration ─────────────────────────────────────────

export type LoginResult =
  | { ok: true; session: SessionInfo }
  | { ok: false; error: string; mustChange?: boolean };

/**
 * Verify DNI + PIN (employees) or email + password (admin). Applies the
 * lockout policy: after MAX_ATTEMPTS wrong tries the account is locked for
 * LOCK_MINUTES.
 */
export async function authenticate(login: string, secret: string): Promise<LoginResult> {
  await ensureSeeded();
  const cred = await getCredential(login);
  if (!cred) return { ok: false, error: "Credenciales incorrectas." };

  const remaining = lockRemainingMs(cred.locked_until);
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60_000);
    return { ok: false, error: `Cuenta bloqueada. Intenta de nuevo en ${mins} min.` };
  }

  const isAdmin = cred.kind === "admin";
  const ok = isAdmin
    ? verifySecret(secret, cred.password_hash, cred.password_salt)
    : verifySecret(secret, cred.pin_hash, cred.pin_salt);

  if (!ok) {
    await bumpFailedAttempt(login);
    return { ok: false, error: "Credenciales incorrectas." };
  }

  await resetAttempts(login);
  return {
    ok: true,
    session: {
      login,
      kind: cred.kind,
      role: cred.role,
      employeeId: cred.employee_id ?? "",
      companyId: cred.company_id ?? "",
      email: cred.email,
      mustChange: cred.must_change,
      emailVerified: cred.email_verified,
    },
  };
}

export { createSession, updateSecret };

export type RegeneratedPin = { employeeId: string; login: string; pin: string };

/**
 * RR.HH. action: mint a fresh random PIN for an employee and return it once so
 * it can be handed over privately. Also forces a change on next sign-in.
 */
export async function regenerateEmployeePin(
  employeeId: string,
  login: string,
  email: string | null,
  role: ViewerMode,
  companyId: string,
): Promise<RegeneratedPin> {
  const pin = generatePin();
  await setEmployeeCredential({ login, employeeId, role, email, companyId, pin, mustChange: true });
  return { employeeId, login, pin };
}

/** The role currently stored for a login, so a PIN reset never downgrades it. */
export async function roleForLogin(login: string): Promise<ViewerMode> {
  const cred = await getCredential(login);
  return cred?.role ?? "colaborador";
}
