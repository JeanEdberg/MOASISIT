import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import type { ViewerMode } from "@/lib/hr/types";

/**
 * Server-only credential + session store for the app's OWN sign-in (DNI + PIN
 * for employees, email + password for the admin account).
 *
 * Secrets are never stored in plaintext: PINs and passwords are hashed with
 * scrypt and compared in constant time. Employee PINs are random, NOT derived
 * from personal data (a PIN built from a name + birth date is guessable).
 */

export type CredentialKind = "employee" | "admin";

export type SessionInfo = {
  login: string;
  kind: CredentialKind;
  role: ViewerMode;
  employeeId: string;
  /** Empresa a la que pertenece la sesión. Vacío para el superadmin. */
  companyId: string;
  email: string | null;
  mustChange: boolean;
  emailVerified: boolean;
};

export const PIN_LENGTH = 6;
export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
const SESSION_DAYS = 7;

export function hashSecret(secret: string, salt = randomBytes(16).toString("hex")) {
  return { hash: scryptSync(secret, salt, 64).toString("hex"), salt };
}

export function verifySecret(secret: string, hash: string | null, salt: string | null): boolean {
  if (!hash || !salt) return false;
  const candidate = scryptSync(secret, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** Random numeric PIN, independent of any personal data. */
export function generatePin(): string {
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return String(n).padStart(PIN_LENGTH, "0");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

type CredRow = {
  login: string;
  kind: CredentialKind;
  employee_id: string | null;
  role: ViewerMode;
  company_id: string | null;
  email: string | null;
  pin_hash: string | null;
  pin_salt: string | null;
  password_hash: string | null;
  password_salt: string | null;
  must_change: boolean;
  email_verified: boolean;
  failed_attempts: number;
  locked_until: string | null;
};

export async function getCredential(login: string): Promise<CredRow | null> {
  const sql = await getSql();
  const rows = await sql<CredRow>`select * from hr_credential where login = ${login}`;
  return rows[0] ?? null;
}

export async function listCredentials(): Promise<CredRow[]> {
  const sql = await getSql();
  return sql<CredRow>`select * from hr_credential order by login`;
}

/** Create or replace an employee credential with a fresh PIN. */
export async function setEmployeeCredential(input: {
  login: string;
  employeeId: string;
  role: ViewerMode;
  email: string | null;
  companyId: string;
  pin: string;
  mustChange?: boolean;
}): Promise<void> {
  const { hash, salt } = hashSecret(input.pin);
  const sql = await getSql();
  await sql`
    insert into hr_credential (login, kind, employee_id, role, company_id, email, pin_hash, pin_salt, password_hash, password_salt, must_change, email_verified, failed_attempts, locked_until, updated_at)
    values (${input.login}, 'employee', ${input.employeeId}, ${input.role}, ${input.companyId}, ${input.email}, ${hash}, ${salt}, null, null, ${input.mustChange ?? true}, false, 0, null, now())
    on conflict (login) do update set
      kind = 'employee',
      employee_id = excluded.employee_id,
      role = excluded.role,
      company_id = excluded.company_id,
      email = excluded.email,
      pin_hash = excluded.pin_hash,
      pin_salt = excluded.pin_salt,
      must_change = excluded.must_change,
      failed_attempts = 0,
      locked_until = null,
      updated_at = now()
  `;
}

export async function setAdminPassword(input: {
  login: string;
  password: string;
  email: string | null;
  /** Nivel de acceso del administrador. Por defecto `superadmin`. */
  role?: ViewerMode;
  mustChange?: boolean;
}): Promise<void> {
  const { hash, salt } = hashSecret(input.password);
  const role: ViewerMode = input.role ?? "superadmin";
  const sql = await getSql();
  await sql`
    insert into hr_credential (login, kind, employee_id, role, email, pin_hash, pin_salt, password_hash, password_salt, must_change, email_verified, failed_attempts, locked_until, updated_at)
    values (${input.login}, 'admin', null, ${role}, ${input.email}, null, null, ${hash}, ${salt}, ${input.mustChange ?? true}, false, 0, null, now())
    on conflict (login) do update set
      kind = 'admin',
      role = ${role},
      email = excluded.email,
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      must_change = excluded.must_change,
      failed_attempts = 0,
      locked_until = null,
      updated_at = now()
  `;
}

export async function updateSecret(login: string, secret: string): Promise<void> {
  const { hash, salt } = hashSecret(secret);
  const sql = await getSql();
  const cred = await getCredential(login);
  if (!cred) return;
  if (cred.kind === "admin") {
    await sql`update hr_credential set password_hash = ${hash}, password_salt = ${salt}, must_change = false, updated_at = now() where login = ${login}`;
  } else {
    await sql`update hr_credential set pin_hash = ${hash}, pin_salt = ${salt}, must_change = false, updated_at = now() where login = ${login}`;
  }
}

export async function setEmailVerified(login: string): Promise<void> {
  const sql = await getSql();
  await sql`update hr_credential set email_verified = true, updated_at = now() where login = ${login}`;
}

/**
 * Move a credential to a new login. RR.HH. signs in with the DNI, so correcting
 * a mistyped DNI must move the credential too — otherwise the employee keeps an
 * old login and a new, unreachable one is never created. No-op when unchanged.
 */
export async function renameLogin(oldLogin: string, newLogin: string): Promise<void> {
  if (oldLogin === newLogin) return;
  const sql = await getSql();
  // A DNI already on file would collide on the primary key; drop the stale row
  // only when it belongs to nobody, and otherwise leave it for RR.HH. to see.
  await sql`delete from hr_credential where login = ${newLogin} and employee_id is null`;
  await sql`update hr_credential set login = ${newLogin}, updated_at = now() where login = ${oldLogin}`;
}

export async function bumpFailedAttempt(login: string): Promise<void> {
  const sql = await getSql();
  const cred = await getCredential(login);
  if (!cred) return;
  const attempts = cred.failed_attempts + 1;
  const lock = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null;
  await sql`update hr_credential set failed_attempts = ${attempts}, locked_until = ${lock}, updated_at = now() where login = ${login}`;
}

export async function resetAttempts(login: string): Promise<void> {
  const sql = await getSql();
  await sql`update hr_credential set failed_attempts = 0, locked_until = null, updated_at = now() where login = ${login}`;
}

export function lockRemainingMs(lockedUntil: string | null): number {
  if (!lockedUntil) return 0;
  const t = new Date(lockedUntil).getTime();
  return Number.isFinite(t) ? Math.max(0, t - Date.now()) : 0;
}

export async function createSession(info: SessionInfo): Promise<string> {
  const token = generateToken();
  const sql = await getSql();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  await sql`
    insert into hr_session (token, login, kind, role, employee_id, active_company_id, expires_at)
    values (${token}, ${info.login}, ${info.kind}, ${info.role}, ${info.employeeId}, ${info.companyId || null}, ${expires})
  `;
  return token;
}

type SessionRow = {
  token: string;
  login: string;
  kind: CredentialKind;
  role: ViewerMode;
  employee_id: string | null;
  active_company_id: string | null;
  expires_at: string;
};

export async function getSession(token: string | null): Promise<SessionInfo | null> {
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<SessionRow>`select * from hr_session where token = ${token}`;
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await sql`delete from hr_session where token = ${token}`;
    return null;
  }
  const cred = await getCredential(row.login);
  if (!cred) return null;
  // El superadmin elige empresa por sesión; los demás quedan fijos a la suya.
  const companyId = row.role === "superadmin" ? row.active_company_id ?? "" : cred.company_id ?? "";
  return {
    login: row.login,
    kind: row.kind,
    role: row.role,
    employeeId: row.employee_id ?? "",
    companyId,
    email: cred.email,
    mustChange: cred.must_change,
    emailVerified: cred.email_verified,
  };
}

/** Cambia la empresa activa de la sesión (solo tiene efecto para el superadmin). */
export async function setSessionCompany(token: string, companyId: string): Promise<void> {
  const sql = await getSql();
  await sql`update hr_session set active_company_id = ${companyId} where token = ${token}`;
}

export async function deleteSession(token: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from hr_session where token = ${token}`;
}

/** RR.HH./superadmin: change an employee's access role (colaborador/jefatura/rrhh). */
export async function setCredentialRole(login: string, role: ViewerMode): Promise<void> {
  const sql = await getSql();
  await sql`update hr_credential set role = ${role}, updated_at = now() where login = ${login}`;
}

/** Move an employee credential to another company (superadmin only). */
export async function setCredentialCompany(login: string, companyId: string): Promise<void> {
  const sql = await getSql();
  await sql`update hr_credential set company_id = ${companyId}, updated_at = now() where login = ${login}`;
}
