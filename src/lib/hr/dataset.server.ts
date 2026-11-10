import { getSql } from "@/lib/db";
import { createDemo } from "@/lib/hr/seed";
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
import { directReports } from "@/lib/hr/access";
import { canSeeMoney } from "@/lib/hr/access";
import type { Employee, HrData, ViewerMode } from "@/lib/hr/types";

/**
 * Server-authoritative dataset. The whole HR document lives in one `hr_dataset`
 * row (JSONB). The client never receives data its role may not see: every read
 * is filtered here, and every write is role-checked before it reaches the row.
 */

export const ADMIN_LOGIN = "inmoalogisticaysoluciones@gmail.com";
export const ADMIN_ROLE: ViewerMode = "rrhh";

const DATASET_ID = 1;

/** Roles assigned to the seeded employee accounts, keyed by DNI. */
const SEED_ROLES: Record<string, ViewerMode> = {
  "47090484": "rrhh",
  "47720216": "rrhh",
  "72853279": "jefatura",
};

type DatasetRow = { data: HrData };

export async function loadDataset(): Promise<HrData> {
  const sql = await getSql();
  const rows = await sql<DatasetRow>`select data from hr_dataset where id = ${DATASET_ID}`;
  if (rows[0]?.data) return rows[0].data;
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
  await setAdminPassword({ login: ADMIN_LOGIN, password: adminPassword, email: ADMIN_LOGIN, mustChange: true });
  lines.push(`ADMIN  ${ADMIN_LOGIN}  password: ${adminPassword}`);

  for (const emp of data.employees) {
    const pin = generatePin();
    await setEmployeeCredential({
      login: emp.dni,
      employeeId: emp.id,
      role: SEED_ROLES[emp.dni] ?? "colaborador",
      email: emp.email || null,
      pin,
      mustChange: true,
    });
    lines.push(`DNI    ${emp.dni}  ${emp.names} ${emp.paternal}  PIN: ${pin}`);
  }

  console.log(
    "\n[moasist] Credenciales iniciales (cámbialas en el primer ingreso; entrega cada PIN en privado):\n  " +
      lines.join("\n  ") +
      "\n",
  );
}

/** Roles, stripped of the dataset: what the client is allowed to see. */
export function viewerFor(session: SessionInfo): { mode: ViewerMode; employeeId: string } {
  return { mode: session.role, employeeId: session.employeeId };
}

/**
 * Filter the dataset for the caller's role. RR.HH. sees everything; jefatura
 * sees themselves + direct reports; colaborador sees only themselves. Salaries
 * of OTHER people are removed for non-RR.HH. viewers.
 */
export function sanitizeForViewer(data: HrData, session: SessionInfo): HrData {
  const { role, employeeId } = session;
  if (role === "rrhh") return { ...data, viewer: { mode: role, employeeId } };

  const visibleIds = new Set<string>([employeeId]);
  if (role === "jefatura") {
    for (const r of directReports(data.employees, employeeId)) visibleIds.add(r.id);
  }

  const employees = data.employees
    .filter((e) => visibleIds.has(e.id))
    .map((e) => (canSeeMoney({ mode: role, employeeId }, e.id) ? e : stripMoney(e)));

  const inView = (id: string) => visibleIds.has(id);

  return {
    ...data,
    employees,
    requests: data.requests.filter((r) => inView(r.employeeId)),
    attendance: data.attendance.filter((a) => inView(a.employeeId)),
    documents: data.documents.filter((d) => !d.employeeId || inView(d.employeeId)),
    snapshots: {},
    viewer: { mode: role, employeeId },
  };
}

function stripMoney(e: Employee): Employee {
  return {
    ...e,
    salary: 0,
    salaryAccount: "",
    ctsAccount: "",
    salaryBank: "",
    ctsBank: "",
    bank: undefined,
    account: undefined,
  };
}

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
export async function regenerateEmployeePin(employeeId: string, login: string, email: string | null, role: ViewerMode): Promise<RegeneratedPin> {
  const pin = generatePin();
  await setEmployeeCredential({ login, employeeId, role, email, pin, mustChange: true });
  return { employeeId, login, pin };
}

/** The role currently stored for a login, so a PIN reset never downgrades it. */
export async function roleForLogin(login: string): Promise<ViewerMode> {
  const cred = await getCredential(login);
  return cred?.role ?? "colaborador";
}
