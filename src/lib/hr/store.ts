import { create } from "zustand";
import { persist } from "zustand/middleware";
import { livePayslips } from "@/lib/hr/calc";
import { isDemoEmail, createDemo } from "@/lib/hr/seed";
import type {
  Area,
  Attendance,
  Company,
  DocItem,
  Employee,
  HrData,
  RequestStatus,
  TimeRequest,
  Viewer,
} from "@/lib/hr/types";

type HrState = HrData & {
  hydrated: boolean;
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
  setViewer: (viewer: Viewer) => void;
  importPeople: (employees: Employee[], areas: Area[]) => void;
  clearDemoPeople: () => void;
  resetDemo: () => void;
};

export const useHr = create<HrState>()(
  persist(
    (set) => ({
      ...createDemo(),
      hydrated: false,
      updateCompany: (patch) => set((s) => ({ company: { ...s.company, ...patch } })),
      switchTenantCompany: (ruc: string) =>
        set((state) => {
          const tenants: Record<string, Company> = {
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
              rmv: 1130,
              uit: 5350,
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
              rmv: 1130,
              uit: 5350,
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
              rmv: 1130,
              uit: 5350,
              topeAfp: 12599,
              essalud: 0.09,
              onp: 0.13,
              afpAporte: 0.1,
              afpSeguro: 0.0137,
              afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
            },
          };
          const target = tenants[ruc] || state.company;
          return { company: target };
        }),
      addArea: (name) =>
        set((s) => ({
          areas: [...s.areas, { id: `a-${Date.now().toString(36)}`, name: name.trim() }],
        })),
      renameArea: (id, name) =>
        set((s) => ({
          areas: s.areas.map((a) => (a.id === id ? { ...a, name: name.trim() } : a)),
        })),
      addEmployee: (emp) => set((s) => ({ employees: [...s.employees, emp] })),
      updateEmployee: (id, patch) =>
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      addRequest: (req) => set((s) => ({ requests: [req, ...s.requests] })),
      decideRequest: (id, status) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, status, decidedAt: "2026-11-08" } : r,
          ),
        })),
      upsertAttendance: (row) =>
        set((s) => {
          const id = `${row.employeeId}-${row.date}`;

          // Reglas de horario INMOA (08:00 a 17:00 con 15 min de tolerancia)
          const INICIO_OFICIAL = 8 * 60;     // 08:00 a.m. (480 min)
          const TOLERANCIA_INGRESO = 15;     // 15 minutos
          const FIN_OFICIAL = 17 * 60;       // 17:00 p.m. (1020 min)
          const TOLERANCIA_SALIDA = 15;      // 15 minutos posteriores

          const [hIn, mIn] = row.checkIn.split(":").map(Number);
          const minutosIn = hIn * 60 + mIn;

          const [hOut, mOut] = row.checkOut.split(":").map(Number);
          const minutosOut = hOut * 60 + mOut;

          let estado: "presente" | "tardanza" | "falta" | "permiso" | "vacaciones" =
            row.kind === "falta" || row.kind === "permiso" || row.kind === "vacaciones"
              ? row.kind
              : "presente";

          let extrasIngresoMinutos = 0;

          if (minutosIn < INICIO_OFICIAL) {
            // Ingreso temprano antes de las 08:00 AM cuenta como hora extra previa
            extrasIngresoMinutos = INICIO_OFICIAL - minutosIn;
          } else if (minutosIn > (INICIO_OFICIAL + TOLERANCIA_INGRESO) && estado === "presente") {
            // Marcó después de las 08:15 AM -> Tardanza
            estado = "tardanza";
          }

          let extrasSalidaMinutos = 0;
          const limiteSalidaConTolerancia = FIN_OFICIAL + TOLERANCIA_SALIDA; // 17:15

          if (minutosOut > limiteSalidaConTolerancia) {
            // Horas extras a partir de los 15 min posteriores a las 17:00
            extrasSalidaMinutos = minutosOut - FIN_OFICIAL;
          }

          const totalMinutosExtras = extrasIngresoMinutos + extrasSalidaMinutos;
          const horasExtrasCalculadas = Math.round((totalMinutosExtras / 60) * 10) / 10;

          const next: Attendance = {
            ...row,
            id,
            kind: estado,
            extra25: horasExtrasCalculadas,
          };

          const i = s.attendance.findIndex((a) => a.id === id);
          const attendance = [...s.attendance];
          if (i >= 0) attendance[i] = next;
          else attendance.push(next);
          return { attendance };
        }),
      addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
      signDocument: (id) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, status: "firmado" } : d)),
        })),
      closePeriod: (period) =>
        set((s) => ({
          snapshots: {
            ...s.snapshots,
            [period]: livePayslips(s, period),
          },
        })),
      reopenPeriod: (period) =>
        set((s) => {
          const snapshots = { ...s.snapshots };
          delete snapshots[period];
          return { snapshots };
        }),
      setViewer: (viewer) => set({ viewer }),
      importPeople: (employees, areas) =>
        set((s) => ({
          areas: [...s.areas, ...areas.filter((a) => !s.areas.some((x) => x.id === a.id))],
          employees: [
            ...s.employees.filter((e) => !employees.some((n) => n.dni === e.dni)),
            ...employees,
          ],
        })),
      clearDemoPeople: () =>
        set((s) => {
          const demoIds = new Set(s.employees.filter((e) => isDemoEmail(e.email)).map((e) => e.id));
          const employees = s.employees.filter((e) => !demoIds.has(e.id));
          const still = employees.some((e) => e.id === s.viewer.employeeId);
          return {
            employees,
            requests: s.requests.filter((r) => !demoIds.has(r.employeeId)),
            attendance: s.attendance.filter((a) => !demoIds.has(a.employeeId)),
            documents: s.documents.filter((d) => !d.employeeId || !demoIds.has(d.employeeId)),
            snapshots: {},
            viewer: still ? s.viewer : { mode: "rrhh", employeeId: employees[0]?.id ?? "" },
          };
        }),
      resetDemo: () => set({ ...createDemo() }),
    }),
    {
      name: "moasist-hr-v3",
      skipHydration: true,
      version: 4,
      migrate: (persisted) => {
        const data = persisted as HrData;
        if (!data?.company) return data;
        return {
          ...data,
          company: {
            id: "inmoa",
            brandName: "Moasist",
            brandMark: "MO",
            brandColor: "#0284c7",
            accentColor: "#0369a1",
            name: "INMOA Logística y Soluciones E.I.R.L.",
            ruc: "20614684772",
            ...data.company,
          },
        };
      },
      merge: (persisted, current) => {
        const data = persisted as Partial<HrData> | undefined;
        if (!data?.company || !data.employees) return current;
        return {
          ...current,
          ...data,
          company: {
            ...current.company,
            ...data.company,
            brandName: "Moasist",
            brandMark: "MO",
            brandColor: "#0284c7",
            accentColor: "#0369a1",
          },
        };
      },
      partialize: (s) => ({
        company: s.company,
        areas: s.areas,
        employees: s.employees,
        requests: s.requests,
        attendance: s.attendance,
        documents: s.documents,
        snapshots: s.snapshots,
        viewer: s.viewer,
      }),
    },
  ),
);

let hydrateStarted = false;

export function hydrateHr() {
  if (hydrateStarted) return;
  hydrateStarted = true;
  void useHr.persist.rehydrate();
}
