import { livePayslips } from "@/lib/hr/calc";
import { uid } from "@/lib/hr/format";
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
 * Every mutation the app can perform, as a serializable value. The server
 * applies these with `applyHrAction` (pure) after a role check, so the client
 * never holds authority over the dataset — it only requests a change.
 */
export type HrAction =
  | { type: "updateEmployee"; id: string; patch: Partial<Employee> }
  | { type: "addEmployee"; employee: Employee }
  | { type: "importPeople"; employees: Employee[]; areas: Area[] }
  | { type: "clearDemoPeople" }
  | { type: "addRequest"; request: TimeRequest }
  | { type: "decideRequest"; id: string; status: RequestStatus }
  | { type: "upsertAttendance"; row: Attendance }
  | { type: "addDocument"; doc: DocItem }
  | { type: "signDocument"; id: string }
  | { type: "closePeriod"; period: string }
  | { type: "reopenPeriod"; period: string }
  | { type: "updateCompany"; patch: Partial<Company> }
  | { type: "addArea"; name: string }
  | { type: "renameArea"; id: string; name: string };

/** Actions only RR.HH. may run (company config, payroll periods, bulk edits). */
const RRHH_ONLY = new Set<HrAction["type"]>([
  "updateEmployee",
  "addEmployee",
  "importPeople",
  "clearDemoPeople",
  "addDocument",
  "signDocument",
  "closePeriod",
  "reopenPeriod",
  "updateCompany",
  "addArea",
  "renameArea",
]);

/** Actions a jefatura may run on their own reports. */
const JEFATURA_OK = new Set<HrAction["type"]>(["decideRequest", "addRequest", "upsertAttendance"]);

/**
 * Role gate. `selfId` is the caller's own employee id (empty for the admin).
 * Returns null when allowed, or a message when the action is denied.
 */
export function authorizeAction(
  action: HrAction,
  role: ViewerMode,
  selfId: string,
  data: HrData,
): string | null {
  if (role === "rrhh") return null;
  if (RRHH_ONLY.has(action.type)) return "Tu rol no permite esta acción.";

  if (role === "jefatura") {
    if (!JEFATURA_OK.has(action.type)) return "Tu rol no permite esta acción.";
    if (action.type === "decideRequest") {
      const req = data.requests.find((r) => r.id === action.id);
      if (!req || !isReport(data, selfId, req.employeeId)) return "Solo puedes decidir solicitudes de tu equipo.";
    }
    if (action.type === "upsertAttendance" && action.row.employeeId !== selfId && !isReport(data, selfId, action.row.employeeId)) {
      return "Solo puedes registrar asistencia de tu equipo.";
    }
    return null;
  }

  // colaborador: only their own records.
  if (action.type === "addRequest" && action.request.employeeId !== selfId) return "Solo puedes registrar tus propias solicitudes.";
  if (action.type === "upsertAttendance" && action.row.employeeId !== selfId) return "Solo puedes registrar tu propia asistencia.";
  return null;
}

function isReport(data: HrData, managerId: string, employeeId: string): boolean {
  return data.employees.some((e) => e.id === employeeId && e.managerId === managerId);
}

/** Pure reducer: returns the next dataset for an action. */
export function applyHrAction(data: HrData, action: HrAction): HrData {
  switch (action.type) {
    case "updateEmployee":
      return {
        ...data,
        employees: data.employees.map((e) => (e.id === action.id ? { ...e, ...action.patch, id: e.id } : e)),
      };
    case "addEmployee":
      return { ...data, employees: [...data.employees, action.employee] };
    case "importPeople":
      return {
        ...data,
        areas: [...data.areas, ...action.areas.filter((a) => !data.areas.some((x) => x.id === a.id))],
        employees: [
          ...data.employees.filter((e) => !action.employees.some((n) => n.dni === e.dni)),
          ...action.employees,
        ],
      };
    case "clearDemoPeople": {
      const demo = new Set(data.employees.filter((e) => e.email.endsWith("@inmoa.pe")).map((e) => e.id));
      const employees = data.employees.filter((e) => !demo.has(e.id));
      return {
        ...data,
        employees,
        requests: data.requests.filter((r) => !demo.has(r.employeeId)),
        attendance: data.attendance.filter((a) => !demo.has(a.employeeId)),
        documents: data.documents.filter((d) => !d.employeeId || !demo.has(d.employeeId)),
        snapshots: {},
      };
    }
    case "addRequest":
      return { ...data, requests: [action.request, ...data.requests] };
    case "decideRequest":
      return {
        ...data,
        requests: data.requests.map((r) => (r.id === action.id ? { ...r, status: action.status, decidedAt: "2026-11-08" } : r)),
      };
    case "upsertAttendance": {
      const row = normalizeAttendance(action.row);
      const i = data.attendance.findIndex((a) => a.id === row.id);
      const attendance = [...data.attendance];
      if (i >= 0) attendance[i] = row;
      else attendance.push(row);
      return { ...data, attendance };
    }
    case "addDocument":
      return { ...data, documents: [action.doc, ...data.documents] };
    case "signDocument":
      return {
        ...data,
        documents: data.documents.map((d) => (d.id === action.id ? { ...d, status: "firmado" } : d)),
      };
    case "closePeriod":
      return { ...data, snapshots: { ...data.snapshots, [action.period]: livePayslips(data, action.period) } };
    case "reopenPeriod": {
      const snapshots = { ...data.snapshots };
      delete snapshots[action.period];
      return { ...data, snapshots };
    }
    case "updateCompany":
      return { ...data, company: { ...data.company, ...action.patch } };
    case "addArea":
      return { ...data, areas: [...data.areas, { id: uid("a"), name: action.name.trim() }] };
    case "renameArea":
      return { ...data, areas: data.areas.map((a) => (a.id === action.id ? { ...a, name: action.name.trim() } : a)) };
  }
}

/** Horario INMOA: 08:00–17:00 con 15 min de tolerancia; recargo por tardanza. */
function normalizeAttendance(row: Attendance): Attendance {
  const INICIO_OFICIAL = 8 * 60;
  const TOLERANCIA_INGRESO = 15;
  const FIN_OFICIAL = 17 * 60;
  const TOLERANCIA_SALIDA = 15;

  const [hIn, mIn] = row.checkIn.split(":").map(Number);
  const minutosIn = hIn * 60 + mIn;
  const [hOut, mOut] = row.checkOut.split(":").map(Number);
  const minutosOut = hOut * 60 + mOut;

  let estado: Attendance["kind"] =
    row.kind === "falta" || row.kind === "vacaciones" ? row.kind : "presente";

  let extrasIngresoMinutos = 0;
  if (minutosIn < INICIO_OFICIAL) {
    extrasIngresoMinutos = INICIO_OFICIAL - minutosIn;
  } else if (minutosIn > INICIO_OFICIAL + TOLERANCIA_INGRESO && estado === "presente") {
    estado = "tardanza";
  }

  let extrasSalidaMinutos = 0;
  if (minutosOut > FIN_OFICIAL + TOLERANCIA_SALIDA) {
    extrasSalidaMinutos = minutosOut - FIN_OFICIAL;
  }

  const totalMinutosExtras = extrasIngresoMinutos + extrasSalidaMinutos;
  const horasExtrasCalculadas = Math.round((totalMinutosExtras / 60) * 10) / 10;

  return {
    ...row,
    id: `${row.employeeId}-${row.date}`,
    kind: estado,
    extra25: horasExtrasCalculadas,
  };
}
