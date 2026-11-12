import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BoletaView } from "@/components/boleta";
import { draftFromEmployee, EmployeeForm, validateDraft, type EmployeeDraft } from "@/components/employee-form";
import { EmployeeDocuments } from "@/components/employee-documents";
import { Shell } from "@/components/shell";
import { Badge, Button, Modal } from "@/components/ui";
import { canSeeMoney, isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { payslipFor, vacationBalance, vacationEarned, vacationPending, vacationTaken } from "@/lib/hr/calc";
import {
  ageTone,
  ATTENDANCE_LABEL,
  CONTRACT_LABEL,
  currentPeriod,
  fmtDays,
  fullName,
  HEALTH_INSURANCE_LABEL,
  todayIso,
  initials,
  PENSION_LABEL,
  pen,
  periodLabel,

  REGIME_LABEL,
  REQUEST_LABEL,
  ROLE_LABEL,
  shortDate,
  STATUS_LABEL,
  WORK_MODE_LABEL,
} from "@/lib/hr/format";
import { companyPeriods } from "@/lib/hr/subscription";
import { useHr } from "@/lib/hr/store";
import type { ViewerMode } from "@/lib/hr/types";

export const Route = createFileRoute("/colaboradores_/$id")({ component: FichaPage });

const TONES = {
  clay: "bg-clay text-clay-ink",
  moss: "bg-moss text-moss-ink",
  ink: "bg-ink text-clay-ink",
};

function FichaPage() {
  const { id } = Route.useParams();
  const data = useHr();
  const updateEmployee = useHr((s) => s.updateEmployee);
  const resetEmployeePin = useHr((s) => s.resetEmployeePin);
  const setAccessRole = useHr((s) => s.setAccessRole);
  const companies = useHr((s) => s.companies);
  const emp = data.employees.find((e) => e.id === id);
  const allowed = emp && visibleEmployees(data.employees, data.viewer).some((e) => e.id === emp.id);
  const [tab, setTab] = useState<"resumen" | "personal" | "laboral" | "seguros" | "pagos" | "tiempo" | "documentos">("resumen");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const money = emp ? canSeeMoney(data.viewer, emp.id) : false;
  const area = data.areas.find((a) => a.id === emp?.areaId);
  const boss = data.employees.find((e) => e.id === emp?.managerId);
  const insurerName = (id: string | null | undefined) =>
    id ? (data.company.insurers.find((i) => i.id === id)?.name ?? "—") : "—";

  if (!emp || !allowed) {
    return (
      <Shell>
        <h1 className="text-3xl">Ficha no disponible</h1>
        <p className="mt-2 text-sm text-muted">Esta persona no está en tu vista.</p>
        <Link to="/colaboradores" className="mt-4 inline-flex min-h-11 items-center text-sm text-clay">
          Volver al directorio
        </Link>
      </Shell>
    );
  }

  const balance = vacationBalance(emp, data.requests, todayIso(), data.company);
  const marks = data.attendance.filter((a) => a.employeeId === emp.id).sort((a, b) => b.date.localeCompare(a.date));
  const reqs = data.requests.filter((r) => r.employeeId === emp.id);

  const save = () => {
    if (!draft) return;
    const err = validateDraft(draft);
    if (err) {
      setError(err);
      return;
    }
    updateEmployee(emp.id, draft);
    setEditing(false);
    toast.success("Ficha actualizada");
  };

  return (
    <Shell>
      <Link to="/colaboradores" className="text-sm text-muted">
        Directorio
      </Link>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`grid size-16 shrink-0 place-items-center rounded-lg font-display text-2xl ${TONES[ageTone(emp.id)]}`}>
          {initials(emp)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl">{fullName(emp)}</h1>
            <Badge tone={emp.status === "activo" ? "moss" : "line"}>{emp.status === "activo" ? "Activo" : "Cesado"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {emp.position} · {area?.name} · {emp.code}
          </p>
          <p className="text-sm text-muted">Ingreso {shortDate(emp.hireDate)}</p>
        </div>
        {isCompanyAdmin(data.viewer.mode) ? (
          <div className="flex flex-wrap gap-2">
            <Button
              tone="line"
              onClick={() => {
                setDraft(draftFromEmployee(emp));
                setError(null);
                setEditing(true);
              }}
            >
              Editar ficha
            </Button>
            <Button
              tone="line"
              onClick={async () => {
                if (!confirm(`¿Generar un PIN temporal nuevo para ${fullName(emp)}? Se entregará una sola vez.`)) return;
                const res = await resetEmployeePin(emp.id);
                if (res.ok && res.pin) {
                  window.alert(`PIN temporal para ${fullName(emp)} (DNI ${emp.dni}):\n\n${res.pin}\n\nEntrégalo en privado. Deberá cambiarlo al ingresar.`);
                  toast.success("PIN temporal generado");
                } else {
                  toast.error(res.error ?? "No se pudo generar el PIN");
                }
              }}
            >
              Generar PIN
            </Button>
            {emp.status === "activo" ? (
              <Button
                tone="danger"
                onClick={() => {
                  updateEmployee(emp.id, { status: "cesado", endDate: todayIso() });
                  toast.success("Marcado como cesado");
                }}
              >
                Registrar cese
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {(
          [
            ["resumen", "Resumen"],
            ["personal", "Personal"],
            ["laboral", "Laboral"],
            ["seguros", "Seguros"],
            ["pagos", "Pagos"],
            ["tiempo", "Tiempo"],
            ["documentos", "Documentos"],
          ] as const
        )
          .filter(([key]) => key !== "pagos" || money)
          .map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`min-h-11 shrink-0 rounded-md px-3 text-sm ${tab === key ? "bg-ink text-clay-ink" : "bg-surface text-muted"}`}
            >
              {label}
            </button>
          ))}
      </div>

      <div className="mt-4">
        {tab === "resumen" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Jefatura" value={boss ? `${boss.names} ${boss.paternal}` : "—"} />
            <Info label="Contrato" value={CONTRACT_LABEL[emp.contract]} />
            <Info label="Vacaciones" value={`${fmtDays(balance)} días`} />
            {money ? <Info label="Sueldo" value={pen(emp.salary)} /> : <Info label="Régimen" value={REGIME_LABEL[emp.regime]} />}
          </div>
        ) : null}
        {tab === "personal" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="DNI" value={emp.dni} />
            <Info label="Nacimiento" value={shortDate(emp.birthDate)} />
            <Info label="Correo" value={emp.email || "—"} />
            <Info label="Celular" value={emp.phone || "—"} />
            <Info label="Dirección" value={emp.address || "—"} />
            <Info label="Hijos" value={String(emp.children)} />
          </div>
        ) : null}
        {tab === "laboral" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Área" value={area?.name ?? "—"} />
            <Info label="Cargo" value={emp.position} />
            <Info label="Régimen" value={REGIME_LABEL[emp.regime]} />
            <Info label="Pensión" value={PENSION_LABEL[emp.pension]} />
            {emp.pension !== "onp" && emp.pension !== "ninguno" ? (
              <Info label="CUSPP" value={emp.cuspp || "Sin registrar"} />
            ) : null}
            <Info label="Modalidad" value={WORK_MODE_LABEL[emp.workMode]} />
            <Info label="Banco (sueldo)" value={emp.salaryBank || emp.bank || "—"} />
            <Info label="Cuenta (sueldo)" value={emp.salaryAccount || emp.account || "—"} />
            <Info label="Banco (CTS)" value={emp.ctsBank || "—"} />
            <Info label="Cuenta (CTS)" value={emp.ctsAccount || "—"} />
            <Info label="Fin de contrato" value={emp.endDate ? shortDate(emp.endDate) : "Sin fecha"} />
            <Info label="Asignación familiar" value={emp.familyAllowance ? "Sí" : "No"} />
            <Info label="Renta 5ta categoría" value={emp.fifthCategory ? "Afecto" : "No afecto"} />
          </div>
        ) : null}
        {tab === "seguros" ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-line bg-surface p-4">
              <h2 className="text-2xl">Seguridad social</h2>
              <p className="mt-1 text-sm text-muted">
                Cobertura de salud y seguros contratados. Las tasas por aseguradora se administran en Empresa.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Cobertura de salud" value={HEALTH_INSURANCE_LABEL[emp.healthInsurance]} />
                <Info
                  label="EPS"
                  value={emp.healthInsurance === "eps" ? insurerName(emp.epsInsurerId) : "No aplica"}
                />
                <Info label="SCTR" value={insurerName(emp.sctrInsurerId)} />
                <Info label="Seguro de Vida Ley" value={insurerName(emp.vidaLeyInsurerId)} />
              </div>
            </section>
            {isCompanyAdmin(data.viewer.mode) ? (
              <section className="rounded-lg border border-line bg-surface p-4">
                <h2 className="text-2xl">Acceso a Moasist</h2>
                <p className="mt-1 text-sm text-muted">
                  Define qué puede ver y hacer esta persona al ingresar con su DNI.
                </p>
                <div className="mt-4 max-w-md">
                  <label className="block text-xs text-muted">Nivel de acceso</label>
                  <select
                    className="mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 text-sm"
                    defaultValue="colaborador"
                    onChange={async (e) => {
                      const role = e.target.value as ViewerMode;
                      const res = await setAccessRole(emp.id, role);
                      if (res.ok) toast.success(`Acceso actualizado a ${ROLE_LABEL[role]}`);
                      else toast.error(res.error ?? "No se pudo actualizar el acceso");
                    }}
                  >
                    <option value="colaborador">{ROLE_LABEL.colaborador}</option>
                    <option value="jefatura">{ROLE_LABEL.jefatura}</option>
                    <option value="rrhh">{ROLE_LABEL.rrhh}</option>
                  </select>
                  <p className="mt-2 text-xs text-muted">
                    Requiere que el colaborador ya tenga credencial (genera su PIN si aún no la tiene).
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
        {tab === "pagos" && money ? (
          <div className="space-y-4">
            {companyPeriods(data.company, 4).map((period) => {
              const slip = payslipFor(data, emp.id, period);
              if (!slip) return null;
              return (
                <div key={period}>
                  <p className="mb-2 text-sm text-muted">{periodLabel(period)}{data.snapshots[period] ? " · cerrado" : ""}</p>
                  <BoletaView slip={slip} employee={emp} company={data.company} />
                </div>
              );
            })}
          </div>
        ) : null}
        {tab === "tiempo" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-line bg-surface p-4">
              <h2 className="text-2xl">Vacaciones</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Info label="Ganados" value={fmtDays(vacationEarned(emp, todayIso(), data.company))} />
                <Info label="Gozados y reservados" value={fmtDays(vacationTaken(emp, data.requests))} />
                <Info label="En trámite" value={fmtDays(vacationPending(emp, data.requests))} />
                <Info label="Saldo" value={fmtDays(balance)} />
              </dl>
              <ul className="mt-4 space-y-2 text-sm">
                {reqs.length === 0 ? <li className="text-muted">Sin solicitudes.</li> : null}
                {reqs.map((r) => (
                  <li key={r.id} className="flex justify-between gap-2">
                    <span>
                      {REQUEST_LABEL[r.kind]} · {shortDate(r.start)}
                    </span>
                    <span className="text-muted">{STATUS_LABEL[r.status]}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-line bg-surface p-4">
              <h2 className="text-2xl">Marcaciones</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {marks.length === 0 ? <li className="text-muted">Sin marcas todavía.</li> : null}
                {marks.map((m) => (
                  <li key={m.id} className="flex justify-between gap-2">
                    <span>
                      {shortDate(m.date)} · {ATTENDANCE_LABEL[m.kind]}
                    </span>
                    <span className="num text-muted">
                      {m.checkIn || "—"} {m.checkOut ? `– ${m.checkOut}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">Periodo de referencia {periodLabel(currentPeriod())}.</p>
            </section>
          </div>
        ) : null}
        {tab === "documentos" ? (
          <EmployeeDocuments
            emp={emp}
            company={data.company}
            requests={data.requests}
            viewer={data.viewer}
            editable={isCompanyAdmin(data.viewer.mode)}
            onPatch={(patch) => {
              updateEmployee(emp.id, patch);
            }}
          />
        ) : null}
      </div>

      <Modal open={editing} title="Editar ficha" onClose={() => setEditing(false)} wide>
        {draft ? (
          <EmployeeForm
            value={draft}
            areas={data.areas}
            managers={data.employees.filter((e) => e.id !== emp.id && e.status === "activo")}
            companies={companies}
            isEditing
            onChange={setDraft}
          />
        ) : null}
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>Guardar cambios</Button>
        </div>
      </Modal>
    </Shell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
