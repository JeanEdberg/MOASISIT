import { createFileRoute } from "@tanstack/react-router";
import { CalendarOff, Clock, RotateCcw, Trash2, UserX, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Badge, Button, Card, Field, fieldClass, Modal, PageHeader, StatCard } from "@/components/ui";
import { isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { ATTENDANCE_LABEL, fullName, shortDate, todayIso } from "@/lib/hr/format";
import { holidayName, isRestDay, isSunday } from "@/lib/hr/holidays";
import { useHr } from "@/lib/hr/store";
import type { AttendanceKind } from "@/lib/hr/types";
import { AttendanceView } from "@/lib/hr/AttendanceView";

export const Route = createFileRoute("/asistencia")({ component: AttendancePage });

const KINDS = Object.keys(ATTENDANCE_LABEL) as AttendanceKind[];

/** Etiqueta del día de descanso: el feriado manda sobre el domingo. */
function restDayLabel(iso: string): string | null {
  const holiday = holidayName(iso);
  if (holiday) return `Feriado: ${holiday}`;
  if (isSunday(iso)) return "Domingo";
  return null;
}

function AttendancePage() {
  const data = useHr();
  const upsert = useHr((s) => s.upsertAttendance);
  const removeAttendance = useHr((s) => s.removeAttendance);
  const admin = isCompanyAdmin(data.viewer.mode);
  const people = useMemo(
    () => visibleEmployees(data.employees, data.viewer).filter((e) => e.status === "activo"),
    [data.employees, data.viewer],
  );
  const marks = useMemo(() => {
    const ids = new Set(people.map((e) => e.id));
    return data.attendance
      .filter((a) => ids.has(a.employeeId))
      .sort((a, b) => b.date.localeCompare(a.date) || a.employeeId.localeCompare(b.employeeId));
  }, [data.attendance, people]);
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ date: todayIso(), employeeId: "" });
  const [form, setForm] = useState({
    employeeId: data.viewer.employeeId || people[0]?.id || "",
    date: todayIso(),
    kind: "presente" as AttendanceKind,
    checkIn: "09:00",
    checkOut: "18:00",
    extra: "0",
  });

  const faltas = marks.filter((m) => m.kind === "falta").length;
  const tardanzas = marks.filter((m) => m.kind === "tardanza").length;
  const extras = marks.reduce((s, m) => s + m.extra25 + m.extra35, 0);
  const closed = Boolean(data.snapshots[form.date.slice(0, 7)]);
  // La lista de colaboradores llega después del primer render (sesión + dataset),
  // así que el colaborador por defecto se resuelve aquí, no en el useState inicial.
  const employeeId = form.employeeId || data.viewer.employeeId || people[0]?.id || "";

  const save = () => {
    if (!employeeId || !form.date) return;
    if (data.snapshots[form.date.slice(0, 7)]) {
      toast.error("Ese periodo ya está cerrado");
      return;
    }
    const hours = Math.max(0, Number(form.extra) || 0);
    const extra25 = Math.min(2, hours);
    const extra35 = Math.max(0, hours - 2);
    const absent = form.kind === "falta";
    upsert({
      id: `${employeeId}-${form.date}`,
      employeeId,
      companyId: data.company.id,
      date: form.date,
      kind: form.kind,
      checkIn: absent ? "" : form.checkIn,
      checkOut: absent ? "" : form.checkOut,
      extra25: absent ? 0 : extra25,
      extra35: absent ? 0 : extra35,
    });
    setOpen(false);
    toast.success("Marcación guardada");
  };

  const borrarMarca = (date: string, employeeId: string) => {
    removeAttendance(date, employeeId);
    toast.success(`Se restableció el ${shortDate(date)}`);
  };

  const restablecerDia = () => {
    if (!resetForm.date) return;
    const cuantas = data.attendance.filter(
      (a) => a.date === resetForm.date && (!resetForm.employeeId || a.employeeId === resetForm.employeeId),
    ).length;
    if (cuantas === 0) {
      toast.error("Ese día no tiene marcas que restablecer");
      return;
    }
    removeAttendance(resetForm.date, resetForm.employeeId || undefined);
    setResetOpen(false);
    toast.success(`Se restableció el día ${shortDate(resetForm.date)} (${cuantas} marca(s))`);
  };

  return (
    <Shell>
      <PageHeader
        kicker="Jornada"
        title="Asistencia"
        lede="Una falta descuenta un treintavo; las dos primeras horas extra van al 25% y el resto al 35%. El domingo y los feriados se reconocen solos: si alguien marca ese día, pasa a Adicionales con recargo del 100%."
        actions={
          data.viewer.mode !== "colaborador" ? (
            <div className="flex flex-wrap gap-2">
              {admin ? (
                <Button tone="line" onClick={() => setResetOpen(true)}>
                  <RotateCcw className="size-4" aria-hidden />
                  Restablecer día
                </Button>
              ) : null}
              <Button onClick={() => setOpen(true)}>Registrar día</Button>
            </div>
          ) : undefined
        }
      />

      {/* Si el usuario actual navega en modo colaborador, mostramos su panel personal de fichaje GPS */}
      {data.viewer.mode === "colaborador" && (
        <div className="mb-6">
          <AttendanceView />
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Faltas" value={String(faltas)} hint="en el periodo visible" icon={UserX} tone={faltas ? "danger" : "neutral"} />
        <StatCard label="Tardanzas" value={String(tardanzas)} hint="en el periodo visible" icon={Clock} tone={tardanzas ? "warn" : "neutral"} />
        <StatCard label="Horas extra" value={`${extras} h`} hint="acumuladas" icon={Zap} tone="info" />
      </div>
      {marks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No hay marcas en esta vista.
        </p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Día</th>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Horario</th>
                <th className="px-4 py-3 font-medium">Extra</th>
                {admin ? <th className="px-4 py-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const who = data.employees.find((e) => e.id === m.employeeId);
                const rest = isRestDay(m.date);
                const restLabel = restDayLabel(m.date);
                return (
                  <tr
                    key={m.id}
                    className={`border-t border-line ${rest ? "bg-danger-soft" : ""}`}
                  >
                    <td className={`px-4 py-3 ${rest ? "font-semibold text-danger" : ""}`}>{shortDate(m.date)}</td>
                    <td className="px-4 py-3">
                      {restLabel ? (
                        <Badge tone="danger">
                          <CalendarOff className="mr-1 size-3.5" aria-hidden />
                          {restLabel}
                        </Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{who ? fullName(who) : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={m.kind === "falta" ? "danger" : m.kind === "tardanza" ? "warn" : "ok"}>
                        {ATTENDANCE_LABEL[m.kind]}
                      </Badge>
                    </td>
                    <td className="num px-4 py-3">{m.checkIn ? `${m.checkIn} – ${m.checkOut}` : "—"}</td>
                    <td className="num px-4 py-3">{m.extra25 + m.extra35 || "—"}</td>
                    {admin ? (
                      <td className="px-4 py-3 text-right">
                        <Button
                          tone="ghost"
                          className="min-h-9 px-2 text-danger"
                          title="Restablecer esta marca"
                          onClick={() => borrarMarca(m.date, m.employeeId)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Restablecer
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} title="Registrar marcación" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Colaborador">
            <select className={fieldClass} value={employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
              {people.map((e) => (
                <option key={e.id} value={e.id}>
                  {fullName(e)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <input className={fieldClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          {form.date && isRestDay(form.date) ? (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {restDayLabel(form.date)}: si marcas asistencia, se pagará con recargo del 100% en Adicionales.
            </p>
          ) : null}
          <Field label="Estado">
            <select className={fieldClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as AttendanceKind })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {ATTENDANCE_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada">
              <input className={fieldClass} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </Field>
            <Field label="Salida">
              <input className={fieldClass} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </Field>
          </div>
          <Field label="Horas extra del día" hint="Hasta 2 horas al 25%, el resto al 35%.">
            <input className={fieldClass} inputMode="decimal" value={form.extra} onChange={(e) => setForm({ ...form, extra: e.target.value })} />
          </Field>
          {closed ? <p className="text-sm text-clay">La planilla de ese mes está cerrada. Reábrela para corregir marcas.</p> : null}
          <Button onClick={save} disabled={closed}>
            Guardar marca
          </Button>
        </div>
      </Modal>

      <Modal open={resetOpen} title="Restablecer un día" onClose={() => setResetOpen(false)}>
        <div className="grid gap-3">
          <p className="text-sm text-muted">
            Borra las marcas de una fecha para volver a registrarla. Útil si marcaste un día por error (por ejemplo, un día que
            todavía no llega). Solo RR.HH. y el administrador pueden hacerlo.
          </p>
          <Field label="Fecha a restablecer">
            <input
              className={fieldClass}
              type="date"
              value={resetForm.date}
              onChange={(e) => setResetForm({ ...resetForm, date: e.target.value })}
            />
          </Field>
          <Field label="Colaborador" hint="Déjalo en «Todos» para limpiar el día completo.">
            <select
              className={fieldClass}
              value={resetForm.employeeId}
              onChange={(e) => setResetForm({ ...resetForm, employeeId: e.target.value })}
            >
              <option value="">Todos</option>
              {people.map((e) => (
                <option key={e.id} value={e.id}>
                  {fullName(e)}
                </option>
              ))}
            </select>
          </Field>
          <Button onClick={restablecerDia}>
            <RotateCcw className="size-4" aria-hidden />
            Restablecer día
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}
