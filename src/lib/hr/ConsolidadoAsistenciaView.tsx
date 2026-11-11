import { FileSpreadsheet } from "lucide-react";
import { Badge, Button, Card, SectionHeading } from "@/components/ui";
import { useHr } from "@/lib/hr/store";
import { visibleEmployees } from "./access";
import { currentPeriod } from "./format";
import { generarConsolidadoMensual } from "./reporteAsistencia";

export function ConsolidadoAsistenciaView() {
  const { employees, attendance, company, viewer } = useHr();
  const periodoActual = currentPeriod();

  const visibles = visibleEmployees(employees, viewer);
  const reporte = generarConsolidadoMensual(visibles, attendance, periodoActual);

  const exportarACSV = () => {
    const headers = ["DNI", "Colaborador", "Cargo", "Días Presente", "Tardanzas", "Faltas", "Horas Extra 25%", "Horas Extra 35%", "Total H.E."];
    const rows = reporte.map((r) => [
      r.documento,
      `"${r.empleado}"`,
      `"${r.cargo}"`,
      r.diasPresente,
      r.tardanzas,
      r.faltas,
      r.horasExtra25,
      r.horasExtra35,
      r.totalHorasExtra,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Consolidado_Asistencia_${periodoActual}_${company.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SectionHeading
        icon={FileSpreadsheet}
        title="Consolidado mensual de asistencia y tardanzas"
        description={`Periodo evaluado: ${periodoActual} · ${company.name}`}
        actions={
          <Button tone="primary" onClick={exportarACSV} disabled={reporte.length === 0}>
            <FileSpreadsheet className="size-4" /> Exportar a Excel (CSV)
          </Button>
        }
      />

      {reporte.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          No hay marcaciones en este periodo.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">DNI</th>
                <th className="px-3 py-3 font-medium">Colaborador</th>
                <th className="px-3 py-3 font-medium">Cargo</th>
                <th className="px-3 py-3 text-center font-medium">Asistencias</th>
                <th className="px-3 py-3 text-center font-medium">Tardanzas</th>
                <th className="px-3 py-3 text-center font-medium">Faltas</th>
                <th className="px-3 py-3 text-center font-medium">H. extra (25% / 35%)</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map((row) => (
                <tr key={row.employeeId} className="border-t border-line">
                  <td className="num px-3 py-3 text-muted">{row.documento}</td>
                  <td className="px-3 py-3 font-medium text-ink">{row.empleado}</td>
                  <td className="px-3 py-3 text-muted">{row.cargo}</td>
                  <td className="px-3 py-3 text-center">
                    <Badge tone="ok">{row.diasPresente}</Badge>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge tone="warn">{row.tardanzas}</Badge>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge tone={row.faltas ? "danger" : "line"}>{row.faltas}</Badge>
                  </td>
                  <td className="num px-3 py-3 text-center text-ink">{row.totalHorasExtra} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}