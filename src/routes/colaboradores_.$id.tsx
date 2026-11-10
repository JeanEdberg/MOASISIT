import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BoletaView } from "@/components/boleta";
import { draftFromEmployee, EmployeeForm, validateDraft, type EmployeeDraft } from "@/components/employee-form";
import { Shell } from "@/components/shell";
import { Badge, Button, Modal } from "@/components/ui";
import { canSeeMoney, visibleEmployees } from "@/lib/hr/access";
import { payslipFor, vacationBalance, vacationEarned, vacationPending, vacationTaken } from "@/lib/hr/calc";
import {
  ageTone,
  ATTENDANCE_LABEL,
  CONTRACT_LABEL,
  currentPeriod,
  fmtDays,
  fullName,
  HOY,
  initials,
  PENSION_LABEL,
  pen,
  periodLabel,
  recentPeriods,
  REGIME_LABEL,
  REQUEST_LABEL,
  shortDate,
  STATUS_LABEL,
  WORK_MODE_LABEL,
} from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";

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
  const emp = data.employees.find((e) => e.id === id);
  const allowed = emp && visibleEmployees(data.employees, data.viewer).some((e) => e.id === emp.id);
  const [tab, setTab] = useState<"resumen" | "personal" | "laboral" | "pagos" | "tiempo">("resumen");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const money = emp ? canSeeMoney(data.viewer, emp.id) : false;
  const area = data.areas.find((a) => a.id === emp?.areaId);
  const boss = data.employees.find((e) => e.id === emp?.managerId);

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

  const balance = vacationBalance(emp, data.requests);
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
        {data.viewer.mode === "rrhh" ? (
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
            {emp.status === "activo" ? (
              <Button
                tone="danger"
                onClick={() => {
                  updateEmployee(emp.id, { status: "cesado", endDate: HOY });
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
            ["pagos", "Pagos"],
            ["tiempo", "Tiempo"],
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
            <Info label="Modalidad" value={WORK_MODE_LABEL[emp.workMode]} />
            <Info label="Banco (sueldo)" value={emp.salaryBank || emp.bank || "—"} />
            <Info label="Cuenta (sueldo)" value={emp.salaryAccount || emp.account || "—"} />
            <Info label="Banco (CTS)" value={emp.ctsBank || "—"} />
            <Info label="Cuenta (CTS)" value={emp.ctsAccount || "—"} />
            <Info label="Fin de contrato" value={emp.endDate ? shortDate(emp.endDate) : "Sin fecha"} />
            <Info label="Asignación familiar" value={emp.familyAllowance ? "Sí" : "No"} />
          </div>
        ) : null}
        {tab === "pagos" && money ? (
          <div className="space-y-4">
            {recentPeriods(4).map((period) => {
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
                <Info label="Ganados" value={fmtDays(vacationEarned(emp))} />
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
      </div>

      <Modal open={editing} title="Editar ficha" onClose={() => setEditing(false)} wide>
        {draft ? (
          <EmployeeForm
            value={draft}
            areas={data.areas}
            managers={data.employees.filter((e) => e.id !== emp.id && e.status === "activo")}
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
