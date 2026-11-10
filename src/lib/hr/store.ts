import { create } from "zustand";
import type { HrAction } from "@/lib/hr/actions";
import { createDemo } from "@/lib/hr/seed";
import type {
  Area,
  Attendance,
  Company,
  DocItem,
  Employee,
  HrData,
  RequestStatus,
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

  updateCompany: (patch: Partial<Company>) => void;
  switchTenantCompany: (ruc: string) => void;
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

/** The three companies the operator can switch between (RR.HH. only). */
export const TENANTS: Record<string, Company> = {
  "20614684772": {
    id: "inmoa",
    name: "INMOA Logística y Soluciones E.I.R.L.",
    tradeName: "INMOA Soluciones",
    ruc: "20614684772",
    address: "Av. León Velarde 450, Tambopata",
    city: "Puerto Maldonado",
    email: "contacto@inmoa.pe",
    phone: "082 571 200",
    brandName: "Moasist",
    brandMark: "MO",
    brandColor: "#0284c7",
    accentColor: "#0369a1",
    rmv: 1230,
    uit: 5500,
    topeAfp: 12599,
    essalud: 0.09,
    onp: 0.13,
    afpAporte: 0.1,
    afpSeguro: 0.0137,
    afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
  },
  "20614684773": {
    id: "7pollitos",
    name: "Los 7 Pollitos Inversiones E.I.R.L.",
    tradeName: "Los 7 Pollitos",
    ruc: "20614684773",
    address: "Av. Panamericana Norte Km. 120",
    city: "Piura",
    email: "contacto@7pollitos.pe",
    phone: "073 441 190",
    brandName: "Moasist",
    brandMark: "7P",
    brandColor: "#0284c7",
    accentColor: "#0369a1",
    rmv: 1230,
    uit: 5500,
    topeAfp: 12599,
    essalud: 0.09,
    onp: 0.13,
    afpAporte: 0.1,
    afpSeguro: 0.0137,
    afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
  },
  "20614684774": {
    id: "plumifero",
    name: "Inversiones y Negociaciones Plumífero E.I.R.L.",
    tradeName: "Plumífero",
    ruc: "20614684774",
    address: "Zona Industrial S/N",
    city: "Talara",
    email: "contacto@plumifero.pe",
    phone: "073 382 100",
    brandName: "Moasist",
    brandMark: "PL",
    brandColor: "#0284c7",
    accentColor: "#0369a1",
    rmv: 1230,
    uit: 5500,
    topeAfp: 12599,
    essalud: 0.09,
    onp: 0.13,
    afpAporte: 0.1,
    afpSeguro: 0.0137,
    afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
  },
};

const EMPTY: HrData = {
  ...createDemo(),
  employees: [],
  requests: [],
  attendance: [],
  documents: [],
  snapshots: {},
  viewer: { mode: "colaborador", employeeId: "" },
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

    updateCompany: (patch) => run({ type: "updateCompany", patch }),
    switchTenantCompany: (ruc) => {
      const target = TENANTS[ruc];
      if (target) run({ type: "updateCompany", patch: target });
    },
    addArea: (name) => run({ type: "addArea", name }),
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
