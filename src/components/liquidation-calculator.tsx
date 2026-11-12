import { Calculator, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card, Empty, PageHeader, StatCard } from "@/components/ui";
import { isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { fullName, todayIso, pen, shortDate } from "@/lib/hr/format";
import { liquidationSheet, pensionRateOf } from "@/lib/hr/liquidacion-sheet";
import { exportLiquidationPdf } from "@/lib/hr/liquidacion-pdf";
import { useHr } from "@/lib/hr/store";

/**
 * Calculadora de liquidación de beneficios sociales. RR.HH. y el superadmin
 * eligen un colaborador de su empresa por DNI, fijan la fecha de corte y, si
 * quieren, la corren en modo simulación (para alguien todavía activo). El
 * resultado se ve en pantalla y se descarga en una hoja A4 con el logo.
 */
export function LiquidationCalculator() {
  const data = useHr();
  const admin = isCompanyAdmin(data.viewer.mode);
  const people = visibleEmployees(data.employees, data.viewer);
  const [query, setQuery] = useState("");
  const [empId, setEmpId] = useState("");
  const [asOf, setAsOf] = useState(todayIso());
  const [simulate, setSimulate] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((e) => e.dni.includes(q) || fullName(e).toLowerCase().includes(q));
  }, [people, query]);

  const emp = people.find((e) => e.id === empId) ?? null;
  const effectiveAsOf = emp ? (emp.status === "cesado" ? (emp.endDate ?? asOf) : asOf) : asOf;
  const mode: "cese" | "simulacion" = emp?.status === "cesado" && !simulate ? "cese" : "simulacion";

  const sheet = useMemo(
    () => (emp ? liquidationSheet(emp, data.company, data.requests, effectiveAsOf, mode) : null),
    [emp, data.company, data.requests, effectiveAsOf, mode],
  );

  if (!admin) {
    return (
      <Empty
        title="Solo Recursos Humanos"
        lede="La calculadora de liquidación está disponible para RR.HH. y el superadministrador."
      />
    );
  }

  return (
    <>
      <PageHeader
        kicker="Beneficios sociales"
        title="Calculadora de liquidación"
        lede="Elige al colaborador por DNI, fija la fecha de corte y revisa el cálculo (CTS, gratificación con bono y vacaciones truncas). Puedes simularlo para alguien que sigue activo. El resultado se descarga en una hoja A4 con el logo."
        actions={
          sheet ? (
            <Button tone="line" onClick={() => exportLiquidationPdf(sheet, data.company)}>
              <Download className="size-4" /> Descargar PDF
            </Button>
          ) : undefined
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs text-muted">
            Buscar por DNI o nombre
            <span className="mt-1 flex items-center gap-2 rounded-md border border-line bg-bg px-3">
              <Search className="size-4 text-muted" />
              <input
                className="min-h-11 w-full bg-transparent text-sm outline-none"
                value={query}
                placeholder="Ej. 46715154"
                onChange={(e) => setQuery(e.target.value)}
              />
            </span>
          </label>
          <label className="block text-xs text-muted">
            Colaborador
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 text-sm"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
            >
              <option value="">Selecciona…</option>
              {filtered.map((e) => (
                <option key={e.id} value={e.id}>
                  {fullName(e)} · {e.dni}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Fecha de corte
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 text-sm disabled:opacity-60"
              type="date"
              value={effectiveAsOf}
              disabled={emp?.status === "cesado"}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={simulate} onChange={(e) => setSimulate(e.target.checked)} />
            Modo simulación (proyecta el pago aunque siga activo)
          </label>
          {emp?.status === "cesado" ? (
            <span className="text-xs text-muted">Colaborador cesado el {shortDate(emp.endDate ?? "")}.</span>
          ) : null}
        </div>
      </Card>

      {!emp ? (
        <p className="mt-4 text-sm text-muted">
          {people.length === 0
            ? "Todavía no hay colaboradores en tu empresa."
            : "Selecciona un colaborador para calcular su liquidación."}
        </p>
      ) : sheet ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="CTS trunca" value={pen(sheet.sections[0].subtotal)} icon={Calculator} />
            <StatCard label="Gratificación + bono" value={pen(sheet.sections[1].subtotal)} icon={Calculator} />
            <StatCard label="Vacaciones truncas" value={pen(sheet.sections[2].subtotal)} icon={Calculator} />
            <StatCard label="Neto a pagar" value={pen(sheet.total)} icon={Calculator} tone="brand" />
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink">{sheet.employeeName}</p>
                <p className="text-xs text-muted">
                  DNI {sheet.dni} · {sheet.position} · {sheet.regimeLabel}
                </p>
              </div>
              <p className="text-xs text-muted">
                {sheet.mode === "cese" ? "Cese" : "Simulación"} al {shortDate(sheet.asOf)}
              </p>
            </div>

            {sheet.sections.map((section) => (
              <section key={section.key} className="mt-4">
                <h3 className="rounded-md bg-surface-2 px-3 py-2 text-sm font-semibold text-ink">{section.title}</h3>
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {section.rows.map((r) => (
                    <li key={r.code} className="flex flex-wrap items-start justify-between gap-2 py-2 text-sm">
                      <span>
                        {r.label}
                        <span className="block text-xs text-muted">{r.detail}</span>
                      </span>
                      <span className="num font-medium">{pen(r.amount)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">
                    {section.key === "resumen" ? "Total neto a pagar" : "Subtotal"}
                  </span>
                  <span className="num text-lg font-semibold text-ink">{pen(section.subtotal)}</span>
                </div>
              </section>
            ))}

            <p className="mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm font-medium text-ink">{sheet.totalEnLetras}</p>

            {sheet.reference.length > 0 ? (
              <div className="mt-4 rounded-md border border-line bg-bg p-3">
                <p className="text-xs font-medium text-muted">Referencia informativa (no se suma a la liquidación)</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {sheet.reference.map((r) => (
                    <li key={r.code} className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-muted">
                        {r.label} · <span className="text-xs">{r.detail}</span>
                      </span>
                      <span className="text-muted">{pen(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-4 text-xs text-muted">
              Descuento de pensión {pen(sheet.pensionDiscount)} ({pensionRateOf(data.company, emp).toFixed(4)} de la
              remuneración afecta). Cálculo referencial; la asesoría laboral valida el monto antes del pago.
            </p>
          </Card>
        </div>
      ) : null}
    </>
  );
}
