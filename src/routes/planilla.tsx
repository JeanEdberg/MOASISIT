import { createFileRoute } from "@tanstack/react-router";
import { Banknote, CalendarRange, CircleDollarSign, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BoletaView } from "@/components/boleta";
import { Shell } from "@/components/shell";
import { Button, Card, Empty, Modal, PageHeader, StatCard } from "@/components/ui";
import { canSeeMoney, isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { buildAfpnetRows, exportAfpnetExcel, exportAfpnetTxt } from "@/lib/hr/afpnet";
import { payslipsFor } from "@/lib/hr/calc";
import { currentPeriod, fullName, todayIso, pen, periodLabel, uid } from "@/lib/hr/format";
import { companyPeriods } from "@/lib/hr/subscription";
import { buildPayrollRows, exportPayrollExcel, exportPayrollPdf } from "@/lib/hr/payroll-export";
import { useHr } from "@/lib/hr/store";

export const Route = createFileRoute("/planilla")({ component: PayrollPage });

function PayrollPage() {
  const data = useHr();
  const closePeriod = useHr((s) => s.closePeriod);
  const reopenPeriod = useHr((s) => s.reopenPeriod);
  const addDocument = useHr((s) => s.addDocument);
  const [period, setPeriod] = useState(currentPeriod());
  const [openId, setOpenId] = useState<string | null>(null);
  const people = visibleEmployees(data.employees, data.viewer);
  const periods = companyPeriods(data.company, 6);
  const slips = useMemo(() => {
    return payslipsFor(data, period).filter(
      (p) => people.some((e) => e.id === p.employeeId) && canSeeMoney(data.viewer, p.employeeId),
    );
  }, [data, period, people]);
  const closed = Boolean(data.snapshots[period]);
  const neto = slips.reduce((s, p) => s + p.net, 0);
  const bruto = slips.reduce((s, p) => s + p.gross, 0);
  const desc = slips.reduce((s, p) => s + p.discounts, 0);
  const ess = slips.reduce((s, p) => s + p.essalud, 0);
  const cts = slips.reduce((s, p) => s + (p.cts ?? 0), 0);
  const showCts = period.endsWith("-05") || period.endsWith("-11");
  const selected = slips.find((p) => p.employeeId === openId);
  const selectedEmp = data.employees.find((e) => e.id === openId);

  const exportCsv = () => {
    const header = ["codigo", "nombre", "dni", "ingresos", "descuentos", "renta_5ta", "neto", "essalud", "cts"];
    const lines = slips.map((p) => {
      const e = data.employees.find((x) => x.id === p.employeeId);
      return [e?.code ?? "", e ? fullName(e) : "", e?.dni ?? "", p.gross, p.discounts, p.fifth, p.net, p.essalud, p.cts ?? ""];
    });
    const csv = [header, ...lines].map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planilla-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    exportPayrollExcel(buildPayrollRows(slips, data.employees), data.company, period);
    toast.success("Planilla exportada a Excel");
  };

  const exportPdf = () => {
    exportPayrollPdf(buildPayrollRows(slips, data.employees), data.company, period);
  };

  const afpnet = () => buildAfpnetRows(slips, data.employees, period);

  /** Exporta AFPnet en el formato pedido, avisando si faltan CUSPP. */
  const exportAfpnet = (format: "excel" | "txt") => {
    const { rows, sinCuspp } = afpnet();
    const etiqueta = format === "excel" ? "AFPnet" : "AFPnet TXT";
    if (rows.length === 0) {
      toast.error(
        sinCuspp.length
          ? `Faltan los CUSPP de ${sinCuspp.length} afiliado(s) a AFP. Complétalos en su ficha para poder declarar.`
          : "No hay afiliados a AFP en este periodo.",
      );
      return;
    }
    if (format === "excel") exportAfpnetExcel(rows, data.company, period);
    else exportAfpnetTxt(rows, data.company, period);
    const plural = rows.length === 1 ? "" : "s";
    toast.success(
      sinCuspp.length
        ? `${etiqueta} exportado (${rows.length}). Quedaron fuera ${sinCuspp.length} sin CUSPP.`
        : `${etiqueta} exportado (${rows.length} afiliado${plural})`,
    );
  };

  const publishSlips = () => {
    let n = 0;
    for (const p of slips) {
      const exists = data.documents.some((d) => d.kind === "boleta" && d.employeeId === p.employeeId && d.period === period);
      if (exists) continue;
      addDocument({
        id: uid("d"),
        employeeId: p.employeeId,
        companyId: data.company.id,
        title: `Boleta ${periodLabel(period)}`,
        kind: "boleta",
        date: todayIso(),
        status: "pendiente",
        period,
      });
      n += 1;
    }
    toast.success(n ? `${n} boletas quedaron en Documentos` : "Esas boletas ya estaban publicadas");
  };

  return (
    <Shell>
      <PageHeader
        kicker="Remuneraciones"
        title={data.viewer.mode === "colaborador" ? "Mi boleta" : "Planilla"}
        lede="Sueldo, asignación familiar, AFP u ONP, quinta categoría y EsSalud. En julio y diciembre se suma la gratificación; en mayo y noviembre, la CTS del semestre."
        actions={
          isCompanyAdmin(data.viewer.mode) ? (
            <>
              <Button tone="line" onClick={exportExcel}>
                Exportar Excel
              </Button>
              <Button tone="line" onClick={exportPdf}>
                Exportar PDF
              </Button>
              <Button tone="line" onClick={exportCsv}>
                Exportar CSV
              </Button>
              <Button tone="line" onClick={() => exportAfpnet("excel")}>
                AFPnet (Excel)
              </Button>
              <Button tone="line" onClick={() => exportAfpnet("txt")}>
                AFPnet (TXT)
              </Button>
              <Button tone="line" onClick={publishSlips}>
                Publicar boletas
              </Button>
              {closed ? (
                <Button tone="danger" onClick={() => reopenPeriod(period)}>
                  Reabrir mes
                </Button>
              ) : (
                <Button onClick={() => { closePeriod(period); toast.success("Planilla cerrada"); }}>
                  Cerrar mes
                </Button>
              )}
            </>
          ) : null
        }
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
            {data.snapshots[p] ? " · cerrado" : ""}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos" value={pen(bruto)} hint={periodLabel(period)} icon={Banknote} />
        <StatCard label="Descuentos" value={pen(desc)} hint="AFP/ONP, 5ta y otros" icon={CircleDollarSign} tone="warn" />
        <StatCard label="Neto a pagar" value={pen(neto)} hint={`${slips.length} boleta(s)`} icon={Wallet} tone="brand" />
        <StatCard
          label={showCts ? "CTS del semestre" : "EsSalud empleador"}
          value={pen(showCts ? cts : ess)}
          hint={showCts ? "semestre may–oct" : "aporte del empleador"}
          icon={CalendarRange}
          tone="ok"
        />
      </div>

      {slips.length === 0 ? (
        <Empty title="Sin boletas en este periodo" lede="Nadie de tu vista tiene devengue en el mes elegido." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Ingresos</th>
                <th className="px-4 py-3 font-medium">Descuentos</th>
                <th className="px-4 py-3 font-medium">Renta 5ta</th>
                <th className="px-4 py-3 font-medium">Neto</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {slips.map((p) => {
                const e = data.employees.find((x) => x.id === p.employeeId);
                return (
                  <tr key={p.employeeId} className="border-t border-line">
                    <td className="px-4 py-3">
                      <span className="font-medium">{e ? fullName(e) : "—"}</span>
                      <span className="block text-xs text-muted">{e?.position}</span>
                    </td>
                    <td className="num px-4 py-3">{pen(p.gross)}</td>
                    <td className="num px-4 py-3">{pen(p.discounts)}</td>
                    <td className="num px-4 py-3">{pen(p.fifth)}</td>
                    <td className="num px-4 py-3 font-medium">{pen(p.net)}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="min-h-11 text-sm text-clay" onClick={() => setOpenId(p.employeeId)}>
                        Ver boleta
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={Boolean(selected && selectedEmp)} title="Boleta de pago" onClose={() => setOpenId(null)} wide>
        {selected && selectedEmp ? (
          <BoletaView slip={selected} employee={selectedEmp} company={data.company} printable />
        ) : null}
      </Modal>
    </Shell>
  );
}
