import { Coins, HandCoins, Sparkles, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Empty, Field, Modal, PageHeader, StatCard, fieldClass } from "@/components/ui";
import { canSeeMoney, isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import {
  additionalTotals,
  calcAdditionals,
  entryFor,
} from "@/lib/hr/additionals";
import { currentPeriod, fullName, pen, periodLabel, uid } from "@/lib/hr/format";
import { companyPeriods } from "@/lib/hr/subscription";
import { useHr } from "@/lib/hr/store";
import type { Employee } from "@/lib/hr/types";

/**
 * Pestaña "Adicionales": conceptos que se pagan APARTE de la planilla.
 *
 * Las horas extra, las tardanzas y el trabajo en domingo/feriado se leen de las
 * marcaciones de asistencia (el colaborador solo marca; la app reconoce el
 * domingo/feriado y calcula las horas). Las comisiones y bonos se escriben a
 * mano; si se dejan vacíos valen S/ 0.00.
 */
export function AdditionalsView() {
  const data = useHr();
  const upsertAdditional = useHr((s) => s.upsertAdditional);
  const [period, setPeriod] = useState(currentPeriod());
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ commission: "", bonus: "" });

  const people = visibleEmployees(data.employees, data.viewer).filter((e) =>
    canSeeMoney(data.viewer, e.id),
  );
  const periods = companyPeriods(data.company, 6);

  const rows = useMemo(
    () => calcAdditionals(people, period, data.attendance, data.additionals),
    [people, period, data.attendance, data.additionals],
  );
  const totals = useMemo(() => additionalTotals(rows), [rows]);

  const abrir = (emp: Employee) => {
    const entry = entryFor(data.additionals, emp.id, period);
    setForm({
      commission: entry?.commission ? String(entry.commission) : "",
      bonus: entry?.bonus ? String(entry.bonus) : "",
    });
    setEditing(emp.id);
  };

  const guardar = () => {
    if (!editing) return;
    upsertAdditional({
      id: entryFor(data.additionals, editing, period)?.id ?? uid("ad"),
      employeeId: editing,
      companyId: data.company.id,
      period,
      commission: Number(form.commission) || 0,
      bonus: Number(form.bonus) || 0,
    });
    toast.success("Adicionales guardados");
    setEditing(null);
  };

  const editEmp = people.find((e) => e.id === editing);
  const editingRow = rows.find((r) => r.employeeId === editing);

  return (
    <>
      <PageHeader
        kicker="Pagos aparte"
        title="Adicionales"
        lede="Horas extra, tardanzas, feriados y domingos, comisiones y bonos. Se pagan aparte de la planilla y no afectan AFP/ONP, quinta categoría, EsSalud, CTS ni gratificación."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`min-h-11 shrink-0 rounded-md px-3 text-sm ${period === p ? "bg-ink text-clay-ink" : "bg-surface text-muted"}`}
          >
            {periodLabel(p)}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Horas extra" value={pen(totals.extraPay)} hint="25% y 35%" icon={TrendingUp} />
        <StatCard label="Feriados y domingos" value={pen(totals.holidayPay)} hint="recargo 100%" icon={Sparkles} tone="info" />
        <StatCard label="Comisiones y bonos" value={pen(totals.commission + totals.bonus)} hint="registro manual" icon={Coins} />
        <StatCard label="Neto adicionales" value={pen(totals.total)} hint={`menos tardanzas ${pen(totals.lateDiscount)}`} icon={HandCoins} tone="brand" />
      </div>

      {rows.length === 0 ? (
        <Empty title="Sin colaboradores en tu vista" lede="No hay personas con acceso a montos para este periodo." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">H. extra</th>
                <th className="px-4 py-3 font-medium">Tardanzas</th>
                <th className="px-4 py-3 font-medium">Feriados/domingos</th>
                <th className="px-4 py-3 font-medium">Comisión</th>
                <th className="px-4 py-3 font-medium">Bono</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const e = data.employees.find((x) => x.id === r.employeeId);
                return (
                  <tr key={r.employeeId} className="border-t border-line">
                    <td className="px-4 py-3">
                      <span className="font-medium">{e ? fullName(e) : "—"}</span>
                      <span className="block text-xs text-muted">{e?.position}</span>
                    </td>
                    <td className="num px-4 py-3">
                      {pen(r.extraPay)}
                      <span className="block text-xs text-muted">
                        {r.extra25Hours + r.extra35Hours > 0 ? `${r.extra25Hours + r.extra35Hours} h` : "—"}
                      </span>
                    </td>
                    <td className="num px-4 py-3 text-clay">
                      {r.lateDiscount > 0 ? `- ${pen(r.lateDiscount)}` : "—"}
                      {r.lateMinutes > 0 ? <span className="block text-xs text-muted">{r.lateMinutes} min</span> : null}
                    </td>
                    <td className="num px-4 py-3">
                      {pen(r.holidayPay)}
                      {r.restDays.length ? (
                        <span className="block text-xs text-muted">{r.restDays.length} día(s)</span>
                      ) : null}
                    </td>
                    <td className="num px-4 py-3">{pen(r.commission)}</td>
                    <td className="num px-4 py-3">{pen(r.bonus)}</td>
                    <td className="num px-4 py-3 font-medium">{pen(r.total)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="min-h-11 text-sm text-clay"
                        disabled={!isCompanyAdmin(data.viewer.mode)}
                        onClick={() => abrir(e!)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={Boolean(editEmp)} title={editEmp ? `Adicionales · ${fullName(editEmp)}` : ""} onClose={() => setEditing(null)}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{periodLabel(period)}</p>
          {editingRow && editingRow.restDays.length > 0 ? (
            <div className="rounded-md bg-surface p-3 text-sm">
              <p className="mb-1 font-medium">Domingos y feriados trabajados</p>
              <ul className="space-y-1 text-muted">
                {editingRow.restDays.map((d) => (
                  <li key={d.date} className="flex justify-between">
                    <span>
                      {d.date} · {d.label} ({d.hours} h)
                    </span>
                    <span className="num">{pen(d.pay)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Field label="Comisión (S/)">
            <input
              className={fieldClass}
              inputMode="decimal"
              placeholder="0.00"
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
            />
          </Field>
          <Field label="Bono (S/)">
            <input
              className={fieldClass}
              inputMode="decimal"
              placeholder="0.00"
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            />
          </Field>
          <p className="text-xs text-muted">
            Si dejas los campos vacíos, se consideran S/ 0.00. Las horas extra, tardanzas y feriados/domingos se
            calculan solos desde la asistencia.
          </p>
          <div className="flex justify-end gap-2">
            <Button tone="line" onClick={() => setEditing(null)}>
              <X className="mr-1 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={guardar}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
