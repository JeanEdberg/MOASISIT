import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Badge, Button, Field, fieldClass, Modal, PageHeader } from "@/components/ui";
import { canApprove, visibleEmployees } from "@/lib/hr/access";
import { vacationBalance, vacationEarned, vacationPending, vacationTaken } from "@/lib/hr/calc";
import {
  fmtDays,
  fullName,
  HOY,
  inclusiveDays,
  parseDay,
  REQUEST_LABEL,
  shortDate,
  STATUS_LABEL,
  uid,
} from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { RequestKind, TimeRequest } from "@/lib/hr/types";

export const Route = createFileRoute("/vacaciones")({ component: VacationsPage });

function VacationsPage() {
  const data = useHr();
  const addRequest = useHr((s) => s.addRequest);
  const decideRequest = useHr((s) => s.decideRequest);
  const people = visibleEmployees(data.employees, data.viewer).filter((e) => e.status === "activo");
  const [tab, setTab] = useState<"saldos" | "solicitudes" | "calendario">("saldos");
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("2026-11");
  const [form, setForm] = useState({
    employeeId: data.viewer.employeeId || people[0]?.id || "",
    kind: "vacaciones" as RequestKind,
    start: "2026-11-16",
    end: "2026-11-20",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    return people
      .map((e) => ({
        e,
        earned: vacationEarned(e),
        taken: vacationTaken(e, data.requests),
        pending: vacationPending(e, data.requests),
        balance: vacationBalance(e, data.requests),
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [people, data.requests]);

  const total = rows.reduce((s, r) => s + r.balance, 0);
  const avg = rows.length ? total / rows.length : 0;
  const visibleReqs = data.requests.filter((r) => people.some((e) => e.id === r.employeeId));

  const submit = () => {
    if (!form.employeeId) {
      setError("Elige a la persona.");
      return;
    }
    if (form.end < form.start) {
      setError("La fecha de fin no puede ser anterior al inicio.");
      return;
    }
    const days = inclusiveDays(form.start, form.end);
    if (days <= 0 || days > 60) {
      setError("Revisa el rango de fechas.");
      return;
    }
    const clash = data.requests.some(
      (r) =>
        r.employeeId === form.employeeId &&
        r.status !== "rechazada" &&
        r.start <= form.end &&
        form.start <= r.end,
    );
    if (clash) {
      setError("Ya hay una solicitud que se cruza con esas fechas.");
      return;
    }
    const emp = data.employees.find((e) => e.id === form.employeeId);
    if (form.kind === "vacaciones" && emp) {
      const bal = vacationBalance(emp, data.requests);
      if (days > bal + 0.05) {
        setError(`El saldo es ${fmtDays(bal)} días. Ajusta el rango o registra el adelanto con RR. HH.`);
        return;
      }
    }
    const req: TimeRequest = {
      id: uid("r"),
      employeeId: form.employeeId,
      kind: form.kind,
      start: form.start,
      end: form.end,
      status: "pendiente",
      note: form.note.trim(),
      createdAt: HOY,
    };
    addRequest(req);
    setOpen(false);
    setTab("solicitudes");
    toast.success("Solicitud enviada");
  };

  return (
    <Shell>
      <PageHeader
        kicker="Tiempo libre"
        title="Vacaciones"
        lede="Saldo a 2.5 días por mes en régimen general, y 1.25 en pequeña empresa, microempresa y prácticas."
        actions={
          <Button
            onClick={() => {
              setError(null);
              setForm((f) => ({
                ...f,
                employeeId:
                  data.viewer.mode === "colaborador"
                    ? data.viewer.employeeId
                    : f.employeeId || data.viewer.employeeId || people[0]?.id || "",
              }));
              setOpen(true);
            }}
          >
            Nueva solicitud
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Mini label="Saldo visible" value={`${fmtDays(total)} días`} />
        <Mini label="Promedio" value={`${fmtDays(avg)} días`} />
        <Mini label="En trámite" value={String(visibleReqs.filter((r) => r.status === "pendiente").length)} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["saldos", "Saldos"],
            ["solicitudes", "Solicitudes"],
            ["calendario", "Calendario"],
          ] as const
        ).map(([key, label]) => (
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

      {tab === "saldos" ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-max min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Ganados</th>
                <th className="px-4 py-3 font-medium">Gozados</th>
                <th className="px-4 py-3 font-medium">Trámite</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.e.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <span className="font-medium">{fullName(r.e)}</span>
                    <span className="block text-xs text-muted">{data.areas.find((a) => a.id === r.e.areaId)?.name}</span>
                  </td>
                  <td className="num px-4 py-3">{fmtDays(r.earned)}</td>
                  <td className="num px-4 py-3">{fmtDays(r.taken)}</td>
                  <td className="num px-4 py-3">{fmtDays(r.pending)}</td>
                  <td className="num px-4 py-3 font-medium">{fmtDays(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "solicitudes" ? (
        <ul className="space-y-3">
          {visibleReqs.map((r) => {
            const who = data.employees.find((e) => e.id === r.employeeId);
            const can = canApprove(data.viewer, data.employees, r.employeeId);
            return (
              <li key={r.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{who ? fullName(who) : "Colaborador"}</p>
                    <p className="text-sm text-muted">
                      {REQUEST_LABEL[r.kind]} · {shortDate(r.start)} – {shortDate(r.end)} · {inclusiveDays(r.start, r.end)} días
                    </p>
                    {r.note ? <p className="mt-1 text-sm">{r.note}</p> : null}
                  </div>
                  <Badge tone={r.status === "aprobada" ? "moss" : r.status === "rechazada" ? "line" : "clay"}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
                </div>
                {r.status === "pendiente" && can ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => {
                        decideRequest(r.id, "aprobada");
                        toast.success("Solicitud aprobada");
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      tone="line"
                      onClick={() => {
                        decideRequest(r.id, "rechazada");
                        toast.success("Solicitud rechazada");
                      }}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {tab === "calendario" ? (
        <section>
          <div className="mb-3 flex gap-2">
            {["2026-11", "2026-12"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(m)}
                className={`min-h-11 rounded-md px-3 text-sm ${month === m ? "bg-ink text-clay-ink" : "bg-surface text-muted"}`}
              >
                {m === "2026-11" ? "Noviembre" : "Diciembre"}
              </button>
            ))}
          </div>
          <MonthGrid
            month={month}
            items={visibleReqs.filter((r) => r.status !== "rechazada" && r.start.slice(0, 7) <= month && r.end.slice(0, 7) >= month)}
            nameOf={(id) => {
              const e = data.employees.find((x) => x.id === id);
              return e ? e.names : "";
            }}
          />
        </section>
      ) : null}

      <Modal open={open} title="Nueva solicitud" onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          {data.viewer.mode !== "colaborador" ? (
            <Field label="Colaborador">
              <select className={fieldClass} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                {people.map((e) => (
                  <option key={e.id} value={e.id}>
                    {fullName(e)}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field label="Tipo">
            <select className={fieldClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as RequestKind })}>
              {(Object.keys(REQUEST_LABEL) as RequestKind[]).map((k) => (
                <option key={k} value={k}>
                  {REQUEST_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <input className={fieldClass} type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </Field>
            <Field label="Hasta">
              <input className={fieldClass} type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </Field>
          </div>
          <Field label="Nota">
            <textarea className={fieldClass} rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
          {error ? <p className="text-sm text-clay">{error}</p> : null}
          <Button onClick={submit}>Enviar a aprobación</Button>
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

function MonthGrid({
  month,
  items,
  nameOf,
}: {
  month: string;
  items: TimeRequest[];
  nameOf: (id: string) => string;
}) {
  const [y, m] = month.split("-").map(Number);
  const first = parseDay(`${month}-01`);
  const pad = (first.getDay() + 6) % 7;
  const count = new Date(y, m, 0).getDate();
  const cells: Array<number | null> = [...Array(pad).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const iso = `${month}-${String(day).padStart(2, "0")}`;
          const hits = items.filter((r) => r.start <= iso && iso <= r.end);
          return (
            <div key={iso} className="min-h-16 rounded-md border border-line bg-surface p-1">
              <p className="num text-xs">{day}</p>
              {hits.slice(0, 2).map((h) => (
                <p key={h.id} className={`truncate text-xs ${h.status === "aprobada" ? "text-moss" : "text-clay"}`}>
                  {nameOf(h.employeeId)}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
