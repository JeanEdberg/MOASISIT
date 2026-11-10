import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Badge, Button, Field, fieldClass, Modal, PageHeader } from "@/components/ui";
import { visibleEmployees } from "@/lib/hr/access";
import { ATTENDANCE_LABEL, fullName, shortDate } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { AttendanceKind } from "@/lib/hr/types";
import { AttendanceView } from "@/lib/hr/AttendanceView";

export const Route = createFileRoute("/asistencia")({ component: AttendancePage });

const KINDS = Object.keys(ATTENDANCE_LABEL) as AttendanceKind[];

function AttendancePage() {
  const data = useHr();
  const upsert = useHr((s) => s.upsertAttendance);
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
  const [form, setForm] = useState({
    employeeId: data.viewer.employeeId || people[0]?.id || "",
    date: "2026-11-06",
    kind: "presente" as AttendanceKind,
    checkIn: "09:00",
    checkOut: "18:00",
    extra: "0",
  });

  const faltas = marks.filter((m) => m.kind === "falta").length;
  const tardanzas = marks.filter((m) => m.kind === "tardanza").length;
  const extras = marks.reduce((s, m) => s + m.extra25 + m.extra35, 0);
  const closed = Boolean(data.snapshots[form.date.slice(0, 7)]);

  const save = () => {
    if (!form.employeeId || !form.date) return;
    if (data.snapshots[form.date.slice(0, 7)]) {
      toast.error("Ese periodo ya está cerrado");
      return;
    }
    const hours = Math.max(0, Number(form.extra) || 0);
    const extra25 = Math.min(2, hours);
    const extra35 = Math.max(0, hours - 2);
    const absent = form.kind === "falta";
    upsert({
      id: `${form.employeeId}-${form.date}`,
      employeeId: form.employeeId,
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

  return (
    <Shell>
      <PageHeader
        kicker="Jornada"
        title="Asistencia"
        lede="La semana del 2 al 6 de noviembre ya tiene marcas. Una falta descuenta un treintavo; las dos primeras horas extra van al 25% y el resto al 35%."
        actions={
          data.viewer.mode !== "colaborador" ? (
            <Button onClick={() => setOpen(true)}>Registrar día</Button>
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
        <Mini label="Faltas" value={String(faltas)} />
        <Mini label="Tardanzas" value={String(tardanzas)} />
        <Mini label="Horas extra" value={String(extras)} />
      </div>
      {marks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          No hay marcas en esta vista.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-max min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Horario</th>
                <th className="px-4 py-3 font-medium">Extra</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const who = data.employees.find((e) => e.id === m.employeeId);
                return (
                  <tr key={m.id} className="border-t border-line">
                    <td className="px-4 py-3">{shortDate(m.date)}</td>
                    <td className="px-4 py-3">{who ? fullName(who) : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={m.kind === "falta" ? "clay" : m.kind === "tardanza" ? "ink" : "line"}>{ATTENDANCE_LABEL[m.kind]}</Badge>
                    </td>
                    <td className="num px-4 py-3">{m.checkIn ? `${m.checkIn} – ${m.checkOut}` : "—"}</td>
                    <td className="num px-4 py-3">{m.extra25 + m.extra35 || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Registrar marcación" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <Field label="Colaborador">
            <select className={fieldClass} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
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
    </Shell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-1 font-display text-2xl">{value}</p>
    </article>
  );
}
