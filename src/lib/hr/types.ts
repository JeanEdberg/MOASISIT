export type Pension = "onp" | "habitat" | "integra" | "prima" | "profuturo" | "ninguno";

/** Estado de la suscripción mensual de una empresa. */
export type SubscriptionStatus = "activa" | "cancelada";

/** Suscripción mensual de una empresa (plan, día de cobro y vencimiento). */
export type Subscription = {
  /** Precio mensual del plan (S/). El superadmin lo edita. */
  monthlyPrice: number;
  /** Día de cobro del mes (1–31). `null` = último día del mes. */
  billingDay: number | null;
  /** Fecha de alta de la suscripción (ISO). */
  startDate: string | null;
  /** Fecha de vencimiento: el día del próximo cobro (ISO). */
  paidUntil: string | null;
  /** Estado de la suscripción. */
  status: SubscriptionStatus;
};

export type Regime = "general" | "pequena" | "micro" | "practicante";

/**
 * Régimen laboral de la EMPRESA (REMYPE). Los colaboradores lo heredan al
 * registrarse. "mype" se ofrece por control tributario, pero sus cálculos son
 * los del régimen general (la micro y pequeña empresa se eligen aparte).
 */
export type CompanyRegime = "general" | "mype" | "pequena" | "micro";

export type ContractType = "indefinido" | "plazo_fijo" | "practicas";

export type EmployeeStatus = "activo" | "cesado";

export type AfpFund = "habitat" | "integra" | "prima" | "profuturo";

export type WorkMode = 
  | "presencial"    // Oficina central (Aplica Geocerca estricta en Tambopata)
  | "campo"         // Galponeros / Operarios en campo (Modo offline-first / GPS flexible)
  | "virtual"       // Personal remoto en Lima, Piura, etc. (Sin geocerca física estricta)
  | "hibrido"       // Alterna entre campo y oficina
  | "itinerante";   // Gerencia / Viajeros frecuentes (Jean y Ericka - Bypass geográfico con auditoría GPS)

/** Aseguradoras que la empresa tiene contratadas. Las tasas varían por proveedor. */
export type InsurerKind = "sctr" | "eps" | "vida_ley";

export type Insurer = {
  id: string;
  name: string;
  kind: InsurerKind;
  /** SCTR: prima de pensión (%). Solo aplica a kind === "sctr". */
  pensionRate?: number;
  /** SCTR: prima de salud (%). Solo aplica a kind === "sctr". */
  healthRate?: number;
  /** EPS / Vida Ley: tasa total a cargo del empleador (%). */
  rate?: number;
  active: boolean;
};

/**
 * Tramo de la escala progresiva acumulativa del impuesto a la renta de quinta
 * categoría. `span` es el ancho del tramo expresado en UIT; `null` marca el
 * último tramo (sin tope superior).
 */
export type FifthCategoryBand = {
  span: number | null;
  rate: number;
};

/**
 * Parámetros del cálculo de retención de quinta categoría. Son editables porque
 * la UIT, la deducción fija y los tramos cambian por norma (la deducción de 7
 * UIT y la escala pueden variar entre años).
 */
export type FifthCategoryParams = {
  /** Deducción fija expresada en UIT (7 UIT en la referencia 2026). */
  deductionUit: number;
  /** Escala progresiva acumulativa, ordenada de menor a mayor renta. */
  bands: FifthCategoryBand[];
};

export type Company = {
  id: string; // Identificador único para multiempresa (ej: "inmoa", "7pollitos", "plumifero")
  name: string;
  /** Nombre corto para el saludo y las cabeceras (ej. "INMOA", "Plumífero"). */
  shortName: string;
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
  /** Logo de la empresa como data URL (PNG/JPG). Vacío = sin logo. */
  logo?: string;
  /** Régimen laboral de la empresa (REMYPE). Los colaboradores lo heredan. */
  regime: CompanyRegime;
  /**
   * Constancia de acreditación al régimen REMYPE: solo la fecha. La constancia
   * escaneada se adjunta aparte (sustento ante fiscalización).
   */
  mypeAccreditationDate: string;
  /** Constancia de acreditación REMYPE escaneada, como data URL (PDF/JPG/PNG). */
  mypeAccreditationFile?: string;
  rmv: number;
  uit: number;
  /** Parámetros de la retención de quinta categoría (deducción y tramos). */
  fifthCategory: FifthCategoryParams;
  topeAfp: number;
  essalud: number;
  onp: number;
  afpAporte: number;
  afpSeguro: number;
  afpComision: Record<AfpFund, number>;
  /** Aporte adicional del trabajador a la EPS (%) sobre la remuneración. */
  epsAporteTrabajador: number;
  /** Aseguradoras vigentes (SCTR, EPS, Vida Ley) con sus tasas editables. */
  insurers: Insurer[];
  /** Suscripción mensual de la empresa (plan, día de cobro y vencimiento). */
  subscription: Subscription;
};

export type Area = {
  id: string;
  name: string;
  companyId: string;
};

/** Cobertura de salud del trabajador: EsSalud regular o EPS. */
export type HealthInsurance = "essalud" | "eps";

/** Tipo de documento adjunto del colaborador. */
export type AttachmentKind = "tRegistroAlta" | "tRegistroBaja" | "contrato" | "liquidacion";

export type EmployeeAttachment = {
  /** Nombre del archivo, para mostrarlo en la ficha. */
  name: string;
  /** Contenido como data URL. */
  dataUrl: string;
  /** Fecha del documento (ISO), cuando aplica. */
  date: string;
};

/** Documentos adjuntos del colaborador, por tipo. Vacío = no se cargó. */
export type EmployeeAttachments = Partial<Record<AttachmentKind, EmployeeAttachment>>;

/** Un cese cerrado, conservado en el histórico del colaborador. */
export type CessationRecord = {
  /** Fecha de cese (ISO). */
  endDate: string;
  /** Motivo (renuncia, fin de contrato, despido, etc.). */
  reason: string;
  /** Fecha en que se registró el cese en la app (ISO). */
  registeredAt: string;
};

/** Nivel de acceso del colaborador dentro de la app. */
export type AccessRole = ViewerMode;

export type Employee = {
  id: string;
  code: string;
  /** Empresa a la que pertenece. Filtra todo lo que ve el colaborador. */
  companyId: string;
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
  /**
   * Si el colaborador está afecto a la retención de renta de quinta categoría.
   * Cuando es `true`, la planilla calcula y descuenta la retención mensual a
   * partir de la proyección anual de sus ingresos. Los practicantes y quienes
   * no superan la deducción fija quedan fuera.
   */
  fifthCategory: boolean;
  /**
   * 1/6 de la gratificación percibida en el semestre anterior (S/), usado para
   * el cálculo de la CTS. Si no se indica, se calcula como sueldo/6. Reemplaza
   * el antiguo caso especial por DNI, que incrustaba datos personales en el
   * código de cálculo.
   */
  sextoGratificacion?: number | null;
  pension: Pension;
  /**
   * Código Único de Identificación del Sistema Privado de Pensiones (CUSPP).
   * Lo asigna la AFP; es obligatorio para declarar en AFPnet. Vacío para ONP o
   * sin régimen pensionario.
   */
  cuspp: string;

  // Seguridad social y seguros (base del cálculo de beneficios y aportes)
  /** Cobertura de salud: EsSalud regular o EPS. */
  healthInsurance: HealthInsurance;
  /** Aseguradora EPS (id de company.insurers) cuando healthInsurance === "eps". */
  epsInsurerId: string | null;
  /** SCTR: aseguradora contratada (id de company.insurers) o null. */
  sctrInsurerId: string | null;
  /** Seguro de Vida Ley: aseguradora contratada (id de company.insurers) o null. */
  vidaLeyInsurerId: string | null;

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

  /**
   * Documentos del colaborador (T-Registro de alta/baja, contrato firmado,
   * liquidación). Se guardan como data URL dentro del dataset.
   */
  attachments?: EmployeeAttachments;

  /**
   * Histórico de ceses y reincorporaciones. Cada cese guarda su fecha y motivo;
   * al reincorporarse se abre un periodo nuevo sin borrar el anterior.
   */
  cessations?: CessationRecord[];

  /**
   * Marca de persona ficticia sembrada por la demo. Solo la usan las personas
   * del seed; las creadas por el formulario o la importación nunca la llevan.
   * Es la única señal que decide qué borra "Quitar personas de ejemplo", para
   * no confundir personas reales que compartan el dominio de correo.
   */
  isDemo?: boolean;
};

export type RequestKind = "vacaciones" | "licencia" | "permiso" | "descanso_medico";

export type RequestStatus = "pendiente" | "aprobada" | "rechazada";

export type TimeRequest = {
  id: string;
  employeeId: string;
  companyId: string;
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
  companyId: string;
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
  companyId: string;
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
  /** Aporte del empleador a la EPS (complemento/sustituto de EsSalud). */
  eps: number;
  /** Prima SCTR total a cargo del empleador (salud + pensión). */
  sctr: number;
  /** SCTR: prima de salud a cargo del empleador. */
  sctrSalud: number;
  /** SCTR: prima de pensión a cargo del empleador. */
  sctrPension: number;
  /** Prima del Seguro de Vida Ley a cargo del empleador. */
  vidaLey: number;
  pensionBase: number;
  fifth: number;
  cts: number | null;
  cappedPension: boolean;
};

export type ViewerMode = "superadmin" | "rrhh" | "jefatura" | "colaborador";

export type Viewer = {
  mode: ViewerMode;
  employeeId: string;
  /** Empresa que el viewer está viendo. Un RR.HH. de empresa queda fijado a la suya. */
  companyId: string;
};

export type HrData = {
  company: Company;
  /** Todas las empresas. Solo el superadmin puede cambiarlas; el resto ve solo la suya. */
  companies: Company[];
  areas: Area[];
  employees: Employee[];
  requests: TimeRequest[];
  attendance: Attendance[];
  documents: DocItem[];
  snapshots: Record<string, Payslip[]>;
  viewer: Viewer;
};
