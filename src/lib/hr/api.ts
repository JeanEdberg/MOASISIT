import { createServerFn } from "@tanstack/react-start";
import type { HrAction } from "@/lib/hr/actions";
import type { NewCompanyInput } from "@/lib/hr/company";
import type { RucLookupResult } from "@/lib/hr/ruc";
import type { HrData, ViewerMode } from "@/lib/hr/types";

/**
 * The app's server API. Every call runs server-side: it resolves the signed-in
 * session from an httpOnly cookie, applies the role gate, and only then reads
 * or writes the dataset. The client holds no authority — it just asks.
 */

export const SESSION_COOKIE = "moasist_session";

export type SessionView = {
  signedIn: true;
  role: ViewerMode;
  employeeId: string;
  companyId: string;
  login: string;
  kind: "employee" | "admin";
  mustChange: boolean;
  emailVerified: boolean;
  displayName: string;
};

export type SessionState = { session: SessionView | null };

export type LoadedHr = { session: SessionView | null; data: HrData | null };

export type SignInResult =
  | { ok: true; session: SessionView; data: HrData }
  | { ok: false; error: string };

export type ActionResult =
  | { ok: true; data: HrData }
  | { ok: false; error: string };

export type CreateCompanyResult =
  | { ok: true; data: HrData; companyId: string; adminLogin: string | null; adminPassword: string | null }
  | { ok: false; error: string };

async function readSessionToken(): Promise<string | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(SESSION_COOKIE) ?? null;
}

async function writeSessionCookie(token: string): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86_400,
  });
}

async function clearSessionCookie(): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

async function currentSession() {
  const { getSession } = await import("@/lib/hr/credentials.server");
  return getSession(await readSessionToken());
}

function toView(session: NonNullable<Awaited<ReturnType<typeof currentSession>>>, name: string | null): SessionView {
  return {
    signedIn: true,
    role: session.role,
    employeeId: session.employeeId,
    companyId: session.companyId,
    login: session.login,
    kind: session.kind,
    mustChange: session.mustChange,
    emailVerified: session.emailVerified,
    displayName: name ?? session.login,
  };
}

function displayNameFor(data: HrData, session: { kind: string; employeeId: string; login: string }): string {
  if (session.kind === "admin") return "Administración";
  const emp = data.employees.find((e) => e.id === session.employeeId);
  return emp ? `${emp.names} ${emp.paternal}` : session.login;
}

/** Resolve the current session (if any). Safe to call from any client effect. */
export const getSessionState = createServerFn({ method: "GET" }).handler(async (): Promise<SessionState> => {
  const session = await currentSession();
  if (!session) return { session: null };
  const { loadDataset } = await import("@/lib/hr/dataset.server");
  const data = await loadDataset();
  return { session: toView(session, displayNameFor(data, session)) };
});

/** Load the dataset the caller's role may see. */
export const loadHr = createServerFn({ method: "GET" }).handler(async (): Promise<LoadedHr> => {
  const session = await currentSession();
  if (!session) return { session: null, data: null };
  const { loadDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
  const full = await loadDataset();
  return {
    session: toView(session, displayNameFor(full, session)),
    data: sanitizeForViewer(full, session),
  };
});

/** Sign in with DNI + PIN (employee) or email + password (admin). */
export const signIn = createServerFn({ method: "POST" })
  .validator((input: { login: string; secret: string }) => input)
  .handler(async ({ data }): Promise<SignInResult> => {
    const { authenticate } = await import("@/lib/hr/dataset.server");
    const result = await authenticate(String(data.login ?? "").trim().toLowerCase(), String(data.secret ?? ""));
    if (!result.ok) return { ok: false, error: result.error };
    const { createSession } = await import("@/lib/hr/credentials.server");
    const token = await createSession(result.session);
    await writeSessionCookie(token);
    const { loadDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const full = await loadDataset();
    return { ok: true, session: toView(result.session, displayNameFor(full, result.session)), data: sanitizeForViewer(full, result.session) };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true }> => {
  const token = await readSessionToken();
  if (token) {
    const { deleteSession } = await import("@/lib/hr/credentials.server");
    await deleteSession(token);
  }
  await clearSessionCookie();
  return { ok: true };
});

/** Change the caller's PIN (employees) or password (admin). Clears `mustChange`. */
export const changeSecret = createServerFn({ method: "POST" })
  .validator((input: { secret: string }) => input)
  .handler(async ({ data }): Promise<ActionResult> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    const { updateSecret } = await import("@/lib/hr/credentials.server");
    await updateSecret(session.login, String(data.secret ?? ""));
    const { loadDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const full = await loadDataset();
    return { ok: true, data: sanitizeForViewer(full, session) };
  });

/** Apply a mutation. The role gate runs server-side before anything is written. */
export const applyAction = createServerFn({ method: "POST" })
  .validator((input: { action: HrAction }) => input)
  .handler(async ({ data }): Promise<ActionResult> => {
    const action = data.action;
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    const { loadDataset, saveDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const { applyHrAction, authorizeAction } = await import("@/lib/hr/actions");
    const full = await loadDataset();
    // El gate de rol corre para TODOS: cubre las acciones solo-superadmin
    // (crear/eliminar empresa, suscripción) y el alcance por empresa de RR.HH.
    const denial = authorizeAction(action, session.role, session.employeeId, full);
    if (denial) return { ok: false, error: denial };
    if (session.role === "rrhh") {
      const targetCompany = companyIdForAction(action, full);
      if (targetCompany && targetCompany !== session.companyId) {
        return { ok: false, error: "Solo puedes editar datos de tu empresa." };
      }
    }
    const next = applyHrAction(full, action);
    await saveDataset(next);
    // Al eliminar una empresa se borran también sus credenciales (colaboradores
    // y usuarios RR.HH.): esas cuentas no deben seguir pudiendo iniciar sesión.
    if (action.type === "removeCompany") {
      const { deleteCredentialsForCompany } = await import("@/lib/hr/credentials.server");
      await deleteCredentialsForCompany(action.companyId);
    }
    // The DNI is the sign-in login: keep the credential in step with an edit.
    if (action.type === "updateEmployee") {
      const before = full.employees.find((e) => e.id === action.id);
      const after = next.employees.find((e) => e.id === action.id);
      if (before && after) {
        const { renameLogin, setCredentialCompany } = await import("@/lib/hr/credentials.server");
        if (before.dni && after.dni && before.dni !== after.dni) {
          await renameLogin(before.dni, after.dni);
        }
        // Reubicar de empresa solo lo autoriza el superadmin.
        if (session.role === "superadmin" && before.companyId !== after.companyId) {
          const login = after.dni;
          await setCredentialCompany(login, after.companyId);
        }
      }
    }
    return { ok: true, data: sanitizeForViewer(next, session) };
  });

/** La empresa a la que pertenece el registro que toca una acción (null si global). */
function companyIdForAction(action: HrAction, data: HrData): string | null {
  switch (action.type) {
    case "updateCompany":
      return action.companyId ?? data.company.id;
    case "updateEmployee":
      return data.employees.find((e) => e.id === action.id)?.companyId ?? null;
    case "addEmployee":
      return action.employee.companyId ?? null;
    case "importPeople":
      return action.employees[0]?.companyId ?? null;
    case "upsertAttendance":
      return data.employees.find((e) => e.id === action.row.employeeId)?.companyId ?? null;
    case "addRequest":
      return data.employees.find((e) => e.id === action.request.employeeId)?.companyId ?? null;
    case "decideRequest":
      return data.requests.find((r) => r.id === action.id)?.companyId ?? null;
    case "addDocument":
    case "signDocument":
      return null; // documentos usan la empresa activa de la sesión
    default:
      return null;
  }
}

/** Superadmin: cambiar la empresa activa de la sesión. */
export const switchCompany = createServerFn({ method: "POST" })
  .validator((input: { companyId: string }) => input)
  .handler(async ({ data }): Promise<ActionResult> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "superadmin") return { ok: false, error: "Solo el superadministrador puede cambiar de empresa." };
    const { loadDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const { setSessionCompany } = await import("@/lib/hr/credentials.server");
    const token = await readSessionToken();
    const full = await loadDataset();
    const target = full.companies.find((c) => c.id === data.companyId);
    if (!target) return { ok: false, error: "Empresa no encontrada." };
    if (token) await setSessionCompany(token, target.id);
    return { ok: true, data: sanitizeForViewer(full, { ...session, companyId: target.id }) };
  });

/**
 * RR.HH./superadmin: asignar el nivel de acceso de un colaborador. Un RR.HH. de
 * empresa solo puede administrar el acceso dentro de su empresa.
 */
export const setAccessRole = createServerFn({ method: "POST" })
  .validator((input: { employeeId: string; role: ViewerMode }) => input)
  .handler(async ({ data }): Promise<ActionResult> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "rrhh" && session.role !== "superadmin") {
      return { ok: false, error: "Solo RR.HH. puede asignar accesos." };
    }
    const allowed: ViewerMode[] = ["colaborador", "jefatura", "rrhh"];
    if (!allowed.includes(data.role)) return { ok: false, error: "Rol no válido." };
    const { loadDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const { setCredentialRole, getCredential } = await import("@/lib/hr/credentials.server");
    const full = await loadDataset();
    const emp = full.employees.find((e) => e.id === data.employeeId);
    if (!emp) return { ok: false, error: "Colaborador no encontrado." };
    if (session.role === "rrhh" && emp.companyId !== session.companyId) {
      return { ok: false, error: "Solo puedes administrar el acceso de tu empresa." };
    }
    const cred = await getCredential(emp.dni);
    if (!cred) return { ok: false, error: "Ese colaborador todavía no tiene credencial. Genera su PIN primero." };
    if (cred.kind === "admin") return { ok: false, error: "No puedes cambiar el rol de la cuenta administradora." };
    await setCredentialRole(emp.dni, data.role);
    return { ok: true, data: sanitizeForViewer(full, session) };
  });

/**
 * Consulta de RUC contra SUNAT (vía el proveedor configurado). Corre en el
 * servidor: la llave `RUC_API_TOKEN` nunca llega al navegador. Solo RR.HH. y el
 * superadmin pueden consultar (es parte del alta de empresas).
 */
export const lookupRuc = createServerFn({ method: "POST" })
  .validator((input: { ruc: string }) => input)
  .handler(async ({ data }): Promise<RucLookupResult> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "rrhh" && session.role !== "superadmin") {
      return { ok: false, error: "Tu rol no permite consultar RUC." };
    }
    const { lookupRuc: run } = await import("@/lib/hr/ruc.server");
    return run(String(data.ruc ?? ""));
  });

/**
 * Superadmin: estado de puesta en marcha del sistema. Devuelve chequeos legibles
 * (nunca el valor de un secreto) para que la app muestre qué falta configurar.
 */
export const getSystemStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: true; checks: import("@/lib/hr/status").StatusCheck[] } | { ok: false; error: string }> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "superadmin") {
      return { ok: false, error: "Solo el superadministrador puede ver el estado del sistema." };
    }
    const { collectStatus } = await import("@/lib/hr/status.server");
    return { ok: true, checks: await collectStatus() };
  },
);

/**
 * Superadmin: crear una empresa nueva. Añade la empresa al dataset y, si se
 * indicó un correo, crea su usuario RR.HH. con una contraseña temporal que se
 * devuelve UNA sola vez para entregarla en privado.
 */
export const createCompany = createServerFn({ method: "POST" })
  .validator((input: { company: NewCompanyInput }) => input)
  .handler(async ({ data }): Promise<CreateCompanyResult> => {
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "superadmin") return { ok: false, error: "Solo el superadministrador puede crear empresas." };

    const { loadDataset, saveDataset, sanitizeForViewer } = await import("@/lib/hr/dataset.server");
    const { buildCompany, uniqueCompanyId, validateNewCompany } = await import("@/lib/hr/company");
    const full = await loadDataset();

    const input = data.company;
    const invalid = validateNewCompany(input, full.companies.map((c) => c.id));
    if (invalid) return { ok: false, error: invalid };
    const ruc = String(input.ruc ?? "").replace(/\D/g, "");
    if (ruc && full.companies.some((c) => c.ruc === ruc)) {
      return { ok: false, error: "Ya existe una empresa con ese RUC." };
    }

    const id = uniqueCompanyId(input.shortName || input.name, full.companies.map((c) => c.id));
    const company = buildCompany(input, id);
    const { applyHrAction } = await import("@/lib/hr/actions");
    const next = applyHrAction(full, { type: "addCompany", company });
    await saveDataset(next);

    let adminPassword: string | null = null;
    const adminEmail = input.adminEmail?.trim().toLowerCase();
    if (adminEmail) {
      const { setAdminPassword, setCredentialCompany, generatePin } = await import("@/lib/hr/credentials.server");
      adminPassword = `${generatePin()}-${generatePin()}`;
      await setAdminPassword({ login: adminEmail, password: adminPassword, email: adminEmail, role: "rrhh", mustChange: true });
      // El rol RR.HH. queda fijo a su empresa; sin esto, su sesión no vería datos.
      await setCredentialCompany(adminEmail, company.id);
    }

    return {
      ok: true,
      data: sanitizeForViewer(next, session),
      companyId: company.id,
      adminLogin: adminEmail ?? null,
      adminPassword,
    };
  });

/**
 * RR.HH.-only: mint a fresh random PIN for one employee. The PIN is returned
 * once (to hand over privately) and forces a change on the next sign-in.
 */
export const resetEmployeePin = createServerFn({ method: "POST" })
  .validator((input: { employeeId: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; pin: string; login: string } | { ok: false; error: string }> => {
    const employeeId = data.employeeId;
    const session = await currentSession();
    if (!session) return { ok: false, error: "Sesión expirada." };
    if (session.role !== "rrhh" && session.role !== "superadmin") return { ok: false, error: "Solo RR.HH. puede generar PIN." };
    const { loadDataset, regenerateEmployeePin, roleForLogin } = await import("@/lib/hr/dataset.server");
    const full = await loadDataset();
    const emp = full.employees.find((e) => e.id === employeeId);
    if (!emp) return { ok: false, error: "Colaborador no encontrado." };
    if (session.role === "rrhh" && emp.companyId !== session.companyId) {
      return { ok: false, error: "Solo puedes generar PIN de tu empresa." };
    }
    const role = await roleForLogin(emp.dni);
    const { pin } = await regenerateEmployeePin(emp.id, emp.dni, emp.email || null, role, emp.companyId);
    return { ok: true, pin, login: emp.dni };
  });
