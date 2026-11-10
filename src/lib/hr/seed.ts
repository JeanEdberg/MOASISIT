import { vacationBalance, vacationEarned, livePayslips } from "@/lib/hr/calc";
import { HOY } from "@/lib/hr/format";
import type { Attendance, Company, DocItem, Employee, HrData, TimeRequest } from "@/lib/hr/types";

const DEMO_DOMAIN = "@inmoa.pe";

export function isDemoEmail(email: string): boolean {
  return email.endsWith(DEMO_DOMAIN);
}

const company: Company = {
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
  rmv: 1230,   // Remuneración Mínima Vital actualizada
  uit: 5500,   // Unidad Impositiva Tributaria vigente
  topeAfp: 12599,
  essalud: 0.09,
  onp: 0.13,
  afpAporte: 0.1,
  afpSeguro: 0.0137,
  afpComision: {
    habitat: 0.0147,
    integra: 0.0155,
    prima: 0.016,
    profuturo: 0.0169,
  },
};

function person(partial: Employee): Employee {
  return partial;
}

function buildPeople(): Employee[] {
  const rows: Employee[] = [
    person({
      id: "e1",
      code: "EMP-001",
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
  ];
  return rows;
}

const requests: TimeRequest[] = [
  {
    id: "r1",
    employeeId: "e3",
    kind: "vacaciones",
    start: "2026-11-16",
    end: "2026-11-20",
    status: "pendiente",
    note: "Coordinado con gerencia.",
    createdAt: "2026-11-04",
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
  const policies: DocItem[] = [
    {
      id: "d-pol-vac",
      employeeId: null,
      title: "Política de vacaciones",
      kind: "politica",
      date: "2026-01-15",
      status: "vigente",
    },
    {
      id: "d-reg",
      employeeId: null,
      title: "Reglamento interno de trabajo",
      kind: "politica",
      date: "2026-01-01",
      status: "vigente",
    },
  ];
  const peopleDocs: DocItem[] = [];
  for (const e of employees) {
    peopleDocs.push({
      id: `d-cto-${e.id}`,
      employeeId: e.id,
      title: "Contrato de trabajo",
      kind: "contrato",
      date: e.hireDate,
      status: "firmado",
    });
    peopleDocs.push({
      id: `d-bol-${e.id}-2026-10`,
      employeeId: e.id,
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
  const october = livePayslips({ employees: tuned, company, attendance }, "2026-10");
  return {
    company,
    areas: [
      { id: "a1", name: "Gerencia" },
      { id: "a2", name: "Administración" },
      { id: "a4", name: "Operaciones y Producción" },
      { id: "a5", name: "Mantenimiento y Logística" },
    ],
    employees: tuned,
    requests,
    attendance,
    documents: buildDocs(tuned),
    snapshots: { "2026-10": october },
    viewer: { mode: "colaborador", employeeId: "" },
  };
}

export const DEMO_EMAIL_DOMAIN = DEMO_DOMAIN;