import { vacationBalance, vacationEarned, livePayslips } from "@/lib/hr/calc";
import { catalogInsurers } from "@/lib/hr/insurers";
import { HOY } from "@/lib/hr/format";
import type {
  Attendance,
  Company,
  DocItem,
  Employee,
  HrData,
  TimeRequest,
} from "@/lib/hr/types";

const DEMO_DOMAIN = "@inmoa.pe";

/**
 * true = la persona la sembró la demo (marca explícita). Se usa para "Quitar
 * personas de ejemplo" y para el panel de estado. No depende del correo, para
 * no borrar por error a personas reales que usen el mismo dominio.
 */
export function isDemoPerson(employee: { isDemo?: boolean }): boolean {
  return employee.isDemo === true;
}

/** @deprecated Usa `isDemoPerson`. Solo se conserva por compatibilidad. */
export function isDemoEmail(email: string): boolean {
  return email.endsWith(DEMO_DOMAIN);
}

/**
 * Ids de las personas que siembra la demo. Sirve para migrar datasets ya
 * guardados (creados antes de que existiera la marca `isDemo`): se marcan solo
 * esas personas, sin tocar a las reales.
 */
export function demoPersonIds(): Set<string> {
  return new Set(buildPeople().map((e) => e.id));
}

/** Marca como demo a las personas sembradas que aún no lo estén. Idempotente. */
export function withDemoFlags(data: HrData): HrData {
  const ids = demoPersonIds();
  let changed = false;
  const employees = data.employees.map((e) => {
    if (e.isDemo === undefined && ids.has(e.id)) {
      changed = true;
      return { ...e, isDemo: true };
    }
    return e;
  });
  return changed ? { ...data, employees } : data;
}

/** Parámetros legales compartidos (varían por norma, no por empresa). */
const LEGAL = {
  rmv: 1230,
  uit: 5500,
  topeAfp: 12599,
  essalud: 0.09,
  onp: 0.13,
  afpAporte: 0.1,
  afpSeguro: 0.0137,
  afpComision: { habitat: 0.0147, integra: 0.0155, prima: 0.016, profuturo: 0.0169 },
  epsAporteTrabajador: 0.0225,
};

const companies: Company[] = [
  {
    id: "inmoa",
    name: "INMOA Logística y Soluciones E.I.R.L.",
    shortName: "INMOA",
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
    ...LEGAL,
    insurers: catalogInsurers("inmoa"),
  },
  {
    id: "7pollitos",
    name: "Los 7 Pollitos Inversiones E.I.R.L.",
    shortName: "Los 7 Pollitos",
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
    ...LEGAL,
    insurers: catalogInsurers("7pollitos"),
  },
  {
    id: "plumifero",
    name: "Inversiones y Negociaciones Plumífero E.I.R.L.",
    shortName: "Plumífero",
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
    ...LEGAL,
    insurers: catalogInsurers("plumifero"),
  },
];

function person(partial: Employee): Employee {
  return { isDemo: true, ...partial };
}

const INMOA = companies[0]!;
const POLLITOS = companies[1]!;
const PLUMIFERO = companies[2]!;

function buildPeople(): Employee[] {
  const rows: Employee[] = [
    person({
      id: "e1",
      code: "EMP-001",
      companyId: INMOA.id,
      names: "Ericka Carolina",
      paternal: "Coveñas",
      maternal: "Mogollón",
      dni: "47090484",
      email: "ecovenas@inmoa.pe",
      phone: "987 441 220",
      birthDate: "1993-05-14",
      address: "Puerto Maldonado",
      hireDate: "2026-01-01",
      endDate: null,
      status: "activo",
      areaId: "a1",
      position: "Gerente General",
      managerId: null,
      contract: "indefinido",
      regime: "general",
      salary: 3700,
      familyAllowance: false,
      pension: "integra",
      healthInsurance: "eps",
      epsInsurerId: "inmoa-eps-sanitas",
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "itinerante", // Viajera / Gerencia con bypass GPS

      // Cuentas bancarias de pago y beneficios
      salaryBank: "BCP",
      salaryAccount: "191-47090484-0-10",
      ctsBank: "BCP",
      ctsAccount: "191-47090484-0-99",
      bank: "BCP",
      account: "191-47090484-0-10",

      children: 0,
      vacationHistory: 0,
    }),
    person({
      id: "e2",
      code: "EMP-002",
      companyId: INMOA.id,
      names: "Jean Edberg",
      paternal: "Guevara",
      maternal: "Escobar",
      dni: "47720216",
      email: "jguevara@inmoa.pe",
      phone: "982 104 550",
      birthDate: "1991-09-17",
      address: "Talara / Puerto Maldonado",
      hireDate: "2025-12-01",
      endDate: null,
      status: "activo",
      areaId: "a2",
      position: "Asistente Gerencial Administrativo",
      managerId: "e1",
      contract: "indefinido",
      regime: "general",
      salary: 2300,
      familyAllowance: false,
      pension: "habitat",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "itinerante", // Itinerante / Viajero frecuente

      // Cuentas bancarias de pago y beneficios
      salaryBank: "BCP",
      salaryAccount: "191-47720216-0-11",
      ctsBank: "BCP",
      ctsAccount: "191-47720216-0-88",
      bank: "BCP",
      account: "191-47720216-0-11",

      children: 0,
      vacationHistory: 0,
    }),
    person({
      id: "e3",
      code: "EMP-003",
      companyId: INMOA.id,
      names: "Randy Jhared",
      paternal: "Chunga",
      maternal: "Alburqueque",
      dni: "72853279",
      email: "rchunga@inmoa.pe",
      phone: "955 123 440",
      birthDate: "1998-04-10",
      address: "Puerto Maldonado",
      hireDate: "2026-09-01",
      endDate: null,
      status: "activo",
      areaId: "a4",
      position: "Ing. Industrial (Supervisión de Procesos en Planta de Alimentos)",
      managerId: "e1",
      contract: "indefinido",
      regime: "general",
      salary: 3400,
      familyAllowance: true,
      pension: "prima",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "presencial", // Oficina central Tambopata

      // Cuentas bancarias de pago y beneficios
      salaryBank: "Interbank",
      salaryAccount: "200-72853279-0-12",
      ctsBank: "BCP",
      ctsAccount: "191-72853279-0-77",
      bank: "Interbank",
      account: "200-72853279-0-12",

      children: 1,
      vacationHistory: 0,
    }),
    person({
      id: "e4",
      code: "EMP-004",
      companyId: INMOA.id,
      names: "Erick Bryan",
      paternal: "Yovera",
      maternal: "Olivares",
      dni: "72225038",
      email: "eyovera@inmoa.pe",
      phone: "964 881 202",
      birthDate: "1999-02-15",
      address: "Puerto Maldonado",
      hireDate: "2026-07-01",
      endDate: null,
      status: "activo",
      areaId: "a4",
      position: "Asistente de Procesos de Producción",
      managerId: "e3",
      contract: "plazo_fijo",
      regime: "general",
      salary: 2500,
      familyAllowance: false,
      pension: "onp",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "campo", // Galponero / Operario en campo

      // Cuentas bancarias de pago y beneficios
      salaryBank: "BBVA",
      salaryAccount: "0011-7222-0200722250",
      ctsBank: "BCP",
      ctsAccount: "191-72225038-0-66",
      bank: "BBVA",
      account: "0011-7222-0200722250",

      children: 0,
      vacationHistory: 0,
    }),
    person({
      id: "e5",
      code: "EMP-005",
      companyId: INMOA.id,
      names: "Peter Jhon",
      paternal: "Alanocca",
      maternal: "Peralta",
      dni: "09635940",
      email: "palanocca@inmoa.pe",
      phone: "977 440 119",
      birthDate: "1985-11-22",
      address: "Puerto Maldonado",
      hireDate: "2026-08-01",
      endDate: null,
      status: "activo",
      areaId: "a5",
      position: "Chofer / Técnico Mecánico",
      managerId: "e1",
      contract: "indefinido",
      regime: "general",
      salary: 2300,
      familyAllowance: true,
      pension: "profuturo",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "campo", // Campo / Rutas en galpones

      // Cuentas bancarias de pago y beneficios
      salaryBank: "BCP",
      salaryAccount: "194-9635940-0-15",
      ctsBank: "BCP",
      ctsAccount: "191-09635940-0-55",
      bank: "BCP",
      account: "194-9635940-0-15",

      children: 2,
      vacationHistory: 0,
    }),
    person({
      id: "e6",
      code: "EMP-006",
      companyId: INMOA.id,
      names: "Erick Alberto",
      paternal: "Sanchez",
      maternal: "Valladares",
      dni: "72461929",
      email: "esanchez@inmoa.pe",
      phone: "951 330 448",
      birthDate: "1996-08-04",
      address: "Puerto Maldonado",
      hireDate: "2026-10-01",
      endDate: null,
      status: "activo",
      areaId: "a5",
      position: "Jefe - Técnico Mantenimiento General",
      managerId: "e1",
      contract: "indefinido",
      regime: "general",
      salary: 2500,
      familyAllowance: true,
      pension: "habitat",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "inmoa-sctr-pacifico",
      vidaLeyInsurerId: "inmoa-vida-rimac",
      workMode: "presencial", // Oficina central Tambopata

      // Cuentas bancarias de pago y beneficios
      salaryBank: "Interbank",
      salaryAccount: "200-72461929-0-16",
      ctsBank: "BCP",
      ctsAccount: "191-72461929-0-44",
      bank: "Interbank",
      account: "200-72461929-0-16",

      children: 1,
      vacationHistory: 0,
    }),
    // ── Los 7 Pollitos ─────────────────────────────────────────────────────
    person({
      id: "p1",
      code: "7P-001",
      companyId: POLLITOS.id,
      names: "María Elena",
      paternal: "Palacios",
      maternal: "Ríos",
      dni: "45218377",
      email: "mpalacios@7pollitos.pe",
      phone: "968 220 145",
      birthDate: "1990-03-22",
      address: "Piura",
      hireDate: "2026-02-01",
      endDate: null,
      status: "activo",
      areaId: "b1",
      position: "Administradora de Granja",
      managerId: null,
      contract: "indefinido",
      regime: "general",
      salary: 3100,
      familyAllowance: true,
      pension: "integra",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "7p-sctr-lapositiva",
      vidaLeyInsurerId: "7p-vida-mapfre",
      workMode: "presencial",
      salaryBank: "BBVA",
      salaryAccount: "0011-4521-8300004521",
      ctsBank: "BBVA",
      ctsAccount: "0011-4521-8300009900",
      children: 2,
      vacationHistory: 0,
    }),
    person({
      id: "p2",
      code: "7P-002",
      companyId: POLLITOS.id,
      names: "José Antonio",
      paternal: "Neyra",
      maternal: "Castro",
      dni: "41088221",
      email: "jneyra@7pollitos.pe",
      phone: "971 553 902",
      birthDate: "1995-11-05",
      address: "Piura",
      hireDate: "2026-05-15",
      endDate: null,
      status: "activo",
      areaId: "b2",
      position: "Jefe de Planta",
      managerId: "p1",
      contract: "indefinido",
      regime: "general",
      salary: 2800,
      familyAllowance: false,
      pension: "habitat",
      healthInsurance: "eps",
      epsInsurerId: "7p-eps-pacifico",
      sctrInsurerId: "7p-sctr-lapositiva",
      vidaLeyInsurerId: "7p-vida-mapfre",
      workMode: "campo",
      salaryBank: "BCP",
      salaryAccount: "194-41088221-0-20",
      ctsBank: "BCP",
      ctsAccount: "191-41088221-0-21",
      children: 0,
      vacationHistory: 0,
    }),
    person({
      id: "p3",
      code: "7P-003",
      companyId: POLLITOS.id,
      names: "Rosa Amelia",
      paternal: "Flores",
      maternal: "Díaz",
      dni: "46720913",
      email: "rflores@7pollitos.pe",
      phone: "952 118 664",
      birthDate: "1997-07-30",
      address: "Piura",
      hireDate: "2026-08-01",
      endDate: null,
      status: "activo",
      areaId: "b2",
      position: "Operaria de Clasificación",
      managerId: "p2",
      contract: "plazo_fijo",
      regime: "general",
      salary: 1400,
      familyAllowance: false,
      pension: "onp",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "7p-sctr-lapositiva",
      vidaLeyInsurerId: "7p-vida-mapfre",
      workMode: "campo",
      salaryBank: "BCP",
      salaryAccount: "194-46720913-0-30",
      ctsBank: "BCP",
      ctsAccount: "191-46720913-0-31",
      children: 0,
      vacationHistory: 0,
    }),
    // ── Plumífero ──────────────────────────────────────────────────────────
    person({
      id: "l1",
      code: "PL-001",
      companyId: PLUMIFERO.id,
      names: "Carlos Enrique",
      paternal: "Zapata",
      maternal: "Mendoza",
      dni: "43890125",
      email: "czapata@plumifero.pe",
      phone: "969 330 771",
      birthDate: "1988-01-19",
      address: "Talara",
      hireDate: "2026-03-01",
      endDate: null,
      status: "activo",
      areaId: "c1",
      position: "Gerente de Operaciones",
      managerId: null,
      contract: "indefinido",
      regime: "general",
      salary: 4200,
      familyAllowance: true,
      pension: "prima",
      healthInsurance: "eps",
      epsInsurerId: "plu-eps-sanitas",
      sctrInsurerId: "plu-sctr-rimac",
      vidaLeyInsurerId: "plu-vida-pacifico",
      workMode: "itinerante",
      salaryBank: "Interbank",
      salaryAccount: "200-43890125-0-40",
      ctsBank: "Interbank",
      ctsAccount: "200-43890125-0-41",
      children: 3,
      vacationHistory: 0,
    }),
    person({
      id: "l2",
      code: "PL-002",
      companyId: PLUMIFERO.id,
      names: "Luis Fernando",
      paternal: "Quispe",
      maternal: "Huamán",
      dni: "42117763",
      email: "lquispe@plumifero.pe",
      phone: "975 662 118",
      birthDate: "1992-09-12",
      address: "Talara",
      hireDate: "2026-06-01",
      endDate: null,
      status: "activo",
      areaId: "c2",
      position: "Supervisor de Planta",
      managerId: "l1",
      contract: "indefinido",
      regime: "general",
      salary: 2600,
      familyAllowance: false,
      pension: "profuturo",
      healthInsurance: "essalud",
      epsInsurerId: null,
      sctrInsurerId: "plu-sctr-rimac",
      vidaLeyInsurerId: "plu-vida-pacifico",
      workMode: "campo",
      salaryBank: "BCP",
      salaryAccount: "194-42117763-0-50",
      ctsBank: "BCP",
      ctsAccount: "191-42117763-0-51",
      children: 1,
      vacationHistory: 0,
    }),
  ];
  return rows;
}

const requests: TimeRequest[] = [
  {
    id: "r1",
    employeeId: "e3",
    companyId: INMOA.id,
    kind: "vacaciones",
    start: "2026-11-16",
    end: "2026-11-20",
    status: "pendiente",
    note: "Coordinado con gerencia.",
    createdAt: "2026-11-04",
  },
  {
    id: "r2",
    employeeId: "p2",
    companyId: POLLITOS.id,
    kind: "permiso",
    start: "2026-11-18",
    end: "2026-11-18",
    status: "pendiente",
    note: "Trámite personal.",
    createdAt: "2026-11-06",
  },
];

const TARGET_BALANCE: Record<string, number> = {
  e1: 10,
  e2: 8,
  e3: 4,
  e4: 3,
  e5: 2,
  e6: 1,
};

function withHistory(employees: Employee[]): Employee[] {
  return employees.map((e) => {
    const earned = vacationEarned(e, HOY);
    const approved = requests
      .filter((r) => r.employeeId === e.id && r.kind === "vacaciones" && r.status === "aprobada")
      .reduce((sum, r) => {
        const [ys, ms, ds] = r.start.split("-").map(Number);
        const [ye, me, de] = r.end.split("-").map(Number);
        const a = new Date(ys, ms - 1, ds);
        const b = new Date(ye, me - 1, de);
        return sum + Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
      }, 0);
    const target = TARGET_BALANCE[e.id] ?? 0;
    const history = Math.max(0, Math.round((earned - approved - target) * 10) / 10);
    return { ...e, vacationHistory: history };
  });
}

function buildAttendance(employees: Employee[]): Attendance[] {
  const days = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];
  const rows: Attendance[] = [];
  for (const emp of employees) {
    if (emp.status !== "activo") continue;
    for (const date of days) {
      rows.push({
        id: `${emp.id}-${date}`,
        employeeId: emp.id,
        companyId: emp.companyId,
        date,
        kind: "presente",
        checkIn: "08:30",
        checkOut: "18:00",
        extra25: 0,
        extra35: 0,
      });
    }
  }
  return rows;
}

function buildDocs(employees: Employee[]): DocItem[] {
  const policies: DocItem[] = companies.flatMap((c) => [
    {
      id: `d-pol-vac-${c.id}`,
      employeeId: null,
      companyId: c.id,
      title: "Política de vacaciones",
      kind: "politica" as const,
      date: "2026-01-15",
      status: "vigente" as const,
    },
    {
      id: `d-reg-${c.id}`,
      employeeId: null,
      companyId: c.id,
      title: "Reglamento interno de trabajo",
      kind: "politica" as const,
      date: "2026-01-01",
      status: "vigente" as const,
    },
  ]);
  const peopleDocs: DocItem[] = [];
  for (const e of employees) {
    peopleDocs.push({
      id: `d-cto-${e.id}`,
      employeeId: e.id,
      companyId: e.companyId,
      title: "Contrato de trabajo",
      kind: "contrato",
      date: e.hireDate,
      status: "firmado",
    });
    peopleDocs.push({
      id: `d-bol-${e.id}-2026-10`,
      employeeId: e.id,
      companyId: e.companyId,
      title: "Boleta Octubre 2026",
      kind: "boleta",
      date: "2026-10-30",
      status: "firmado",
      period: "2026-10",
    });
  }
  return [...policies, ...peopleDocs];
}

export function createDemo(): HrData {
  const employees = withHistory(buildPeople());
  const tuned = employees.map((e) => {
    const target = TARGET_BALANCE[e.id] ?? 0;
    let history = 0;
    for (let i = 0; i < 4; i++) {
      const draft = { ...e, vacationHistory: history };
      const bal = vacationBalance(draft, requests, HOY);
      history = Math.max(0, Math.round((history + (bal - target)) * 10) / 10);
    }
    const draft = { ...e, vacationHistory: history };
    const bal = vacationBalance(draft, requests, HOY);
    history = Math.max(0, Math.round((history + (bal - target)) * 10) / 10);
    return { ...e, vacationHistory: history };
  });
  const attendance = buildAttendance(tuned);
  // Cada empresa cierra su planilla de octubre por separado.
  const snapshots: Record<string, ReturnType<typeof livePayslips>> = {};
  for (const c of companies) {
    const empOfCompany = tuned.filter((e) => e.companyId === c.id);
    if (!empOfCompany.length) continue;
    snapshots["2026-10"] = [
      ...(snapshots["2026-10"] ?? []),
      ...livePayslips({ employees: empOfCompany, company: c, attendance }, "2026-10"),
    ];
  }
  return {
    company: companies[0]!,
    companies,
    areas: [
      { id: "a1", name: "Gerencia", companyId: INMOA.id },
      { id: "a2", name: "Administración", companyId: INMOA.id },
      { id: "a4", name: "Operaciones y Producción", companyId: INMOA.id },
      { id: "a5", name: "Mantenimiento y Logística", companyId: INMOA.id },
      { id: "b1", name: "Administración", companyId: POLLITOS.id },
      { id: "b2", name: "Planta y Producción", companyId: POLLITOS.id },
      { id: "c1", name: "Gerencia", companyId: PLUMIFERO.id },
      { id: "c2", name: "Planta y Producción", companyId: PLUMIFERO.id },
    ],
    employees: tuned,
    requests,
    attendance,
    documents: buildDocs(tuned),
    snapshots,
    viewer: { mode: "colaborador", employeeId: "", companyId: companies[0]!.id },
  };
}

export const DEMO_EMAIL_DOMAIN = DEMO_DOMAIN;
