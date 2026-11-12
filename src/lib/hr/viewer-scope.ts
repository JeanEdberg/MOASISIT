import { canSeeMoney, directReports, restrictAttachments } from "@/lib/hr/access";
import type { Company, Employee, HrData, Payslip, ViewerMode } from "@/lib/hr/types";

/** The viewer context a filter needs: role, identity and active company. */
export type ViewerScope = {
  role: ViewerMode;
  employeeId: string;
  /** Empresa activa de la sesión. Vacío para el superadmin sin empresa fija. */
  companyId: string;
};

/** The company a session is scoped to (its active company). */
export function activeCompanyId(data: HrData, session: { role: ViewerMode; companyId: string }): string {
  if (session.role === "superadmin") {
    return data.companies.some((c) => c.id === session.companyId) ? session.companyId : data.companies[0]?.id ?? "";
  }
  return session.companyId || data.companies[0]?.id || "";
}

/**
 * Filter the dataset for the caller's role and company.
 *
 * - **superadmin** (developer): may switch across companies; sees one at a time.
 * - **rrhh**: everything of ITS OWN company; the company switch is disabled.
 * - **jefatura**: themselves + direct reports of their company.
 * - **colaborador**: only themselves.
 * Salaries of OTHER people are removed for non-admin viewers.
 *
 * Pure: no database access, so it can be unit-tested without the server stack.
 */
export function sanitizeForViewer(data: HrData, session: ViewerScope): HrData {
  const { role, employeeId } = session;
  const companyId = activeCompanyId(data, session);
  const company = data.companies.find((c) => c.id === companyId) ?? data.companies[0]!;
  const isSuper = role === "superadmin";

  // Solo el superadmin ve el selector con todas las empresas; el resto queda fijo.
  const companies: Company[] = isSuper ? data.companies : [company];

  const inCompany = <T extends { companyId: string }>(rows: T[]) => rows.filter((r) => r.companyId === companyId);

  const companyEmployees = inCompany(data.employees);
  const companyAreas = inCompany(data.areas);
  const companyRequests = inCompany(data.requests);
  const companyAttendance = inCompany(data.attendance);
  const companyDocs = data.documents.filter((d) => d.companyId === companyId);

  const visibleEmployeeIds = new Set(companyEmployees.map((e) => e.id));
  const companySnapshots: Record<string, Payslip[]> = {};
  for (const [period, slips] of Object.entries(data.snapshots)) {
    const own = slips.filter((s) => visibleEmployeeIds.has(s.employeeId));
    if (own.length) companySnapshots[period] = own;
  }

  const base = {
    ...data,
    company,
    companies,
    employees: companyEmployees,
    areas: companyAreas,
    requests: companyRequests,
    attendance: companyAttendance,
    documents: companyDocs,
    snapshots: companySnapshots,
    viewer: { mode: role, employeeId, companyId },
  };

  if (isSuper || role === "rrhh") return base;

  const visibleIds = new Set<string>([employeeId]);
  if (role === "jefatura") {
    for (const r of directReports(companyEmployees, employeeId)) visibleIds.add(r.id);
  }

  const employees = companyEmployees
    .filter((e) => visibleIds.has(e.id))
    .map((e) => (canSeeMoney({ mode: role, employeeId, companyId }, e.id) ? e : stripMoney(e)))
    .map((e) => restrictAttachments(e, { mode: role, employeeId, companyId }));

  const inView = (id: string) => visibleIds.has(id);

  const snapshots: Record<string, Payslip[]> = {};
  for (const [period, slips] of Object.entries(companySnapshots)) {
    const own = slips.filter((s) => inView(s.employeeId));
    if (own.length) snapshots[period] = own;
  }

  return {
    ...base,
    employees,
    requests: companyRequests.filter((r) => inView(r.employeeId)),
    attendance: companyAttendance.filter((a) => inView(a.employeeId)),
    documents: companyDocs.filter((d) => !d.employeeId || inView(d.employeeId)),
    snapshots,
  };
}

function stripMoney(e: Employee): Employee {
  return {
    ...e,
    salary: 0,
    salaryAccount: "",
    ctsAccount: "",
    salaryBank: "",
    ctsBank: "",
    bank: undefined,
    account: undefined,
    // El legajo documental (T-Registros, contrato, liquidación) solo lo ve RR.HH.
    attachments: undefined,
    // Las boletas anteriores subidas tampoco salen hacia la jefatura.
    payslipFiles: undefined,
  };
}
