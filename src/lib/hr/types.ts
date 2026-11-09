export type Pension = "onp" | "habitat" | "integra" | "prima" | "profuturo" | "ninguno";

export type Regime = "general" | "pequena" | "micro" | "practicante";

export type ContractType = "indefinido" | "plazo_fijo" | "practicas";

export type EmployeeStatus = "activo" | "cesado";

export type AfpFund = "habitat" | "integra" | "prima" | "profuturo";

export type WorkMode = 
  | "presencial"    // Oficina central (Aplica Geocerca estricta en Tambopata)
  | "campo"         // Galponeros / Operarios en campo (Modo offline-first / GPS flexible)
  | "virtual"       // Personal remoto en Lima, Piura, etc. (Sin geocerca física estricta)
  | "hibrido"       // Alterna entre campo y oficina
  | "itinerante";   // Gerencia / Viajeros frecuentes (Jean y Ericka - Bypass geográfico con auditoría GPS)

export type Company = {
  id: string; // Identificador único para multiempresa (ej: "inmoa", "7pollitos", "plumifero")
  name: string;
  tradeName: string;
  ruc: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  brandName: string;
  brandMark: string;
  brandColor: string;
  accentColor: string;
  rmv: number;
  uit: number;
  topeAfp: number;
  essalud: number;
  onp: number;
  afpAporte: number;
  afpSeguro: number;
  afpComision: Record<AfpFund, number>;
};

export type Area = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  code: string;
  names: string;
  paternal: string;
  maternal: string;
  dni: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  hireDate: string;
  endDate: string | null;
  status: EmployeeStatus;
  areaId: string;
  position: string;
  managerId: string | null;
  contract: ContractType;
  regime: Regime;
  salary: number;
  familyAllowance: boolean;
  pension: Pension;

  // Modalidad de Trabajo para Asistencia y Geofencing
  workMode: WorkMode;

  // Nuevos campos para gestión bancaria y depósito de beneficios
  salaryBank: string;     // Banco para pago de remuneraciones (ej: "BCP", "BBVA", "Interbank")
  salaryAccount: string;  // N° de cuenta o CCI para pago de remuneraciones
  ctsBank: string;        // Entidad financiera para depósito de CTS (ej: "BCP", "Caja Piura")
  ctsAccount: string;     // N° de cuenta para depósito de CTS

  /** Compatibilidad legada si existen vistas antiguas que lean 'bank' y 'account' */
  bank?: string;
  account?: string;

  children: number;
  /** Días de vacaciones gozados antes de entrar a Moasist. */
  vacationHistory: number;
};

export type RequestKind = "vacaciones" | "licencia" | "permiso" | "descanso_medico";

export type RequestStatus = "pendiente" | "aprobada" | "rechazada";

export type TimeRequest = {
  id: string;
  employeeId: string;
  kind: RequestKind;
  start: string;
  end: string;
  status: RequestStatus;
  note: string;
  createdAt: string;
  decidedAt?: string;
};

export type AttendanceKind =
  | "presente"
  | "tardanza"
  | "falta"
  | "remoto"
  | "vacaciones"
  | "licencia"
  | "descanso";

export type Attendance = {
  id: string;
  employeeId: string;
  date: string;
  kind: AttendanceKind;
  checkIn: string;
  checkOut: string;
  extra25: number;
  extra35: number;
};

export type DocKind = "contrato" | "boleta" | "politica" | "anexo" | "certificado";

export type DocItem = {
  id: string;
  employeeId: string | null;
  title: string;
  kind: DocKind;
  date: string;
  status: "firmado" | "pendiente" | "vigente";
  period?: string;
};

export type PayKind = "ingreso" | "descuento" | "aporte";

export type PayLine = {
  code: string;
  name: string;
  amount: number;
  kind: PayKind;
};

export type Payslip = {
  employeeId: string;
  period: string;
  factor: number;
  lines: PayLine[];
  gross: number;
  discounts: number;
  net: number;
  essalud: number;
  pensionBase: number;
  fifth: number;
  cts: number | null;
  cappedPension: boolean;
};

export type ViewerMode = "rrhh" | "jefatura" | "colaborador";

export type Viewer = {
  mode: ViewerMode;
  employeeId: string;
};

export type HrData = {
  company: Company;
  areas: Area[];
  employees: Employee[];
  requests: TimeRequest[];
  attendance: Attendance[];
  documents: DocItem[];
  snapshots: Record<string, Payslip[]>;
  viewer: Viewer;
};
