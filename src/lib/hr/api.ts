import { createServerFn } from "@tanstack/react-start";
import type { HrAction } from "@/lib/hr/actions";
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
    return { ok: true, data: sanitizeForViewer(full, { ...session, mustChange: false }) };
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
    const denial = authorizeAction(action, session.role, session.employeeId, full);
    if (denial) return { ok: false, error: denial };
    const next = applyHrAction(full, action);
    await saveDataset(next);
    // The DNI is the sign-in login: keep the credential in step with an edit.
    if (action.type === "updateEmployee" && typeof action.patch.dni === "string") {
      const before = full.employees.find((e) => e.id === action.id)?.dni;
      const after = next.employees.find((e) => e.id === action.id)?.dni;
      if (before && after && before !== after) {
        const { renameLogin } = await import("@/lib/hr/credentials.server");
        await renameLogin(before, after);
      }
    }
    return { ok: true, data: sanitizeForViewer(next, session) };
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
    if (session.role !== "rrhh") return { ok: false, error: "Solo RR.HH. puede generar PIN." };
    const { loadDataset, regenerateEmployeePin, roleForLogin } = await import("@/lib/hr/dataset.server");
    const full = await loadDataset();
    const emp = full.employees.find((e) => e.id === employeeId);
    if (!emp) return { ok: false, error: "Colaborador no encontrado." };
    const role = await roleForLogin(emp.dni);
    const { pin } = await regenerateEmployeePin(emp.id, emp.dni, emp.email || null, role);
    return { ok: true, pin, login: emp.dni };
  });
