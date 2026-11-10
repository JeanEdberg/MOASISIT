import { create } from "zustand";
import type { HrAction } from "@/lib/hr/actions";
import { buildCompany } from "@/lib/hr/company";
import type { NewCompanyInput } from "@/lib/hr/company";
import type { RucLookupResult } from "@/lib/hr/ruc";
import type { StatusCheck } from "@/lib/hr/status";
import type {
  Area,
  Attendance,
  Company,
  DocItem,
  Employee,
  HrData,
  RequestStatus,
  Subscription,
  TimeRequest,
  ViewerMode,
} from "@/lib/hr/types";

/**
 * Client store. It holds a MIRROR of the server's dataset for rendering, but it
 * has no authority: every mutation is sent to the server (`applyAction`), which
 * re-checks the caller's role and returns the dataset that role may see. The
 * role itself comes from the signed-in session, never from a client control.
 */

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

type HrState = HrData & {
  hydrated: boolean;
  session: SessionView | null;
  loadError: string | null;

  refresh: () => Promise<void>;
  signIn: (login: string, secret: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  changeSecret: (secret: string) => Promise<{ ok: boolean; error?: string }>;
  resetEmployeePin: (employeeId: string) => Promise<{ ok: boolean; pin?: string; error?: string }>;
  setAccessRole: (employeeId: string, role: ViewerMode) => Promise<{ ok: boolean; error?: string }>;

  updateCompany: (patch: Partial<Company>) => void;
  updateCompanySubscription: (companyId: string, patch: Partial<Subscription>) => void;
  removeCompany: (companyId: string) => void;
  switchCompany: (companyId: string) => Promise<void>;
  createCompany: (
    input: NewCompanyInput,
  ) => Promise<{ ok: boolean; error?: string; adminLogin?: string | null; adminPassword?: string | null }>;
  lookupRuc: (ruc: string) => Promise<RucLookupResult>;
  getSystemStatus: () => Promise<{ ok: boolean; checks?: StatusCheck[]; error?: string }>;
  addArea: (name: string) => void;
  renameArea: (id: string, name: string) => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  addRequest: (req: TimeRequest) => void;
  decideRequest: (id: string, status: RequestStatus) => void;
  upsertAttendance: (row: Attendance) => void;
  addDocument: (doc: DocItem) => void;
  signDocument: (id: string) => void;
  closePeriod: (period: string) => void;
  reopenPeriod: (period: string) => void;
  importPeople: (employees: Employee[], areas: Area[]) => void;
  clearDemoPeople: () => void;
  resetDemo: () => void;
};

/**
 * Estado inicial del cliente: una empresa "placeholder" vacía, sin NINGÚN dato
 * de personas. El navegador solo debe ver lo que llega del servidor tras iniciar
 * sesión (`loadHr`). Antes este estado se armaba con `createDemo()`, lo que
 * incrustaba en el bundle público nombres, DNIs y sueldos reales del seed.
 */
const EMPTY_COMPANY: Company = buildCompany(
  {
    ruc: "",
    name: "Moasist",
    shortName: "Moasist",
    tradeName: "Moasist",
    city: "",
    address: "",
    email: "",
  },
  "moasist",
);

const EMPTY: HrData = {
  company: EMPTY_COMPANY,
  companies: [EMPTY_COMPANY],
  areas: [],
  employees: [],
  requests: [],
  attendance: [],
  documents: [],
  snapshots: {},
  viewer: { mode: "colaborador", employeeId: "", companyId: "" },
};

async function sendAction(action: HrAction): Promise<{ ok: boolean; data?: HrData; error?: string }> {
  const { applyAction } = await import("@/lib/hr/api");
  try {
    const res = await applyAction({ data: { action } });
    return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.error };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error al guardar." };
  }
}

export const useHr = create<HrState>()((set, get) => {
  /** Fire a mutation and adopt the server's reply (it decides what we may see). */
  const run = (action: HrAction) => {
    void sendAction(action).then((res) => {
      if (res.ok && res.data) set({ ...res.data });
      else if (res.error) set({ loadError: res.error });
    });
  };

  return {
    ...EMPTY,
    hydrated: false,
    session: null,
    loadError: null,

    refresh: async () => {
      const { loadHr } = await import("@/lib/hr/api");
      try {
        const res = await loadHr();
        if (res.data) set({ ...res.data, session: res.session, hydrated: true, loadError: null });
        else set({ session: null, hydrated: true });
      } catch {
        set({ hydrated: true, loadError: "No se pudo cargar la información." });
      }
    },

    signIn: async (login, secret) => {
      const { signIn: apiSignIn } = await import("@/lib/hr/api");
      try {
        const res = await apiSignIn({ data: { login, secret } });
        if (res.ok) {
          set({ ...res.data, session: res.session, hydrated: true, loadError: null });
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error de conexión." };
      }
    },

    signOut: async () => {
      const { signOut: apiSignOut } = await import("@/lib/hr/api");
      await apiSignOut();
      set({ ...EMPTY, session: null, hydrated: true, loadError: null });
    },

    changeSecret: async (secret) => {
      const { changeSecret: apiChange } = await import("@/lib/hr/api");
      try {
        const res = await apiChange({ data: { secret } });
        if (res.ok) {
          set((s) => (s.session ? { ...res.data, session: { ...s.session, mustChange: false } } : { ...res.data }));
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error al cambiar." };
      }
    },

    resetEmployeePin: async (employeeId) => {
      const { resetEmployeePin: apiReset } = await import("@/lib/hr/api");
      try {
        const res = await apiReset({ data: { employeeId } });
        return res.ok ? { ok: true, pin: res.pin } : { ok: false, error: res.error };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error al generar PIN." };
      }
    },

    setAccessRole: async (employeeId, role) => {
      const { setAccessRole: apiSet } = await import("@/lib/hr/api");
      try {
        const res = await apiSet({ data: { employeeId, role } });
        if (res.ok) {
          set({ ...res.data });
          return { ok: true };
        }
        return { ok: false, error: res.error };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error al asignar acceso." };
      }
    },

    updateCompany: (patch) => run({ type: "updateCompany", patch, companyId: get().company.id }),
    updateCompanySubscription: (companyId, patch) => run({ type: "updateCompanySubscription", companyId, patch }),
    removeCompany: (companyId) => run({ type: "removeCompany", companyId }),
    switchCompany: async (companyId) => {
      const { switchCompany: apiSwitch } = await import("@/lib/hr/api");
      const res = await apiSwitch({ data: { companyId } });
      if (res.ok) set({ ...res.data, loadError: null });
      else set({ loadError: res.error });
    },
    createCompany: async (input) => {
      const { createCompany: apiCreate } = await import("@/lib/hr/api");
      try {
        const res = await apiCreate({ data: { company: input } });
        if (res.ok) {
          set({ ...res.data, loadError: null });
          return { ok: true, adminLogin: res.adminLogin, adminPassword: res.adminPassword };
        }
        return { ok: false, error: res.error };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "No se pudo crear la empresa." };
      }
    },
    lookupRuc: async (ruc) => {
      const { lookupRuc: apiLookup } = await import("@/lib/hr/api");
      try {
        return await apiLookup({ data: { ruc } });
      } catch {
        return { ok: false, error: "No se pudo consultar el RUC (sin conexión)." };
      }
    },
    getSystemStatus: async () => {
      const { getSystemStatus: apiStatus } = await import("@/lib/hr/api");
      try {
        const res = await apiStatus();
        return res.ok ? { ok: true, checks: res.checks } : { ok: false, error: res.error };
      } catch {
        return { ok: false, error: "No se pudo leer el estado del sistema." };
      }
    },
    addArea: (name) => run({ type: "addArea", name, companyId: get().company.id }),
    renameArea: (id, name) => run({ type: "renameArea", id, name }),
    addEmployee: (emp) => run({ type: "addEmployee", employee: emp }),
    updateEmployee: (id, patch) => run({ type: "updateEmployee", id, patch }),
    addRequest: (req) => run({ type: "addRequest", request: req }),
    decideRequest: (id, status) => run({ type: "decideRequest", id, status }),
    upsertAttendance: (row) => run({ type: "upsertAttendance", row }),
    addDocument: (doc) => run({ type: "addDocument", doc }),
    signDocument: (id) => run({ type: "signDocument", id }),
    closePeriod: (period) => run({ type: "closePeriod", period }),
    reopenPeriod: (period) => run({ type: "reopenPeriod", period }),
    importPeople: (employees, areas) => run({ type: "importPeople", employees, areas }),
    clearDemoPeople: () => run({ type: "clearDemoPeople" }),
    resetDemo: () => run({ type: "updateCompany", patch: get().company }),
  };
});

let hydrateStarted = false;

export function hydrateHr() {
  if (hydrateStarted) return;
  hydrateStarted = true;
  void useHr.getState().refresh();
}
