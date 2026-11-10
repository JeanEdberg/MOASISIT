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
    const rows = reporte.map(r => [
      r.documento,
      `"${r.empleado}"`,
      `"${r.cargo}"`,
      r.diasPresente,
      r.tardanzas,
      r.faltas,
      r.horasExtra25,
      r.horasExtra35,
      r.totalHorasExtra
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Consolidado_Asistencia_${periodoActual}_${company.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consolidado Mensual de Asistencia y Tardanzas</h2>
          <p className="text-sm text-slate-500">Periodo evaluado: <span className="font-semibold">{periodoActual}</span> ({company.name})</p>
        </div>
        <button
          onClick={exportarACSV}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>📊</span> Exportar a Excel (CSV)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b">
              <th className="p-3">DNI</th>
              <th className="p-3">Colaborador</th>
              <th className="p-3">Cargo</th>
              <th className="p-3 text-center">Asistencias</th>
              <th className="p-3 text-center">Tardanzas</th>
              <th className="p-3 text-center">Faltas</th>
              <th className="p-3 text-center">H. Extra (25%/35%)</th>
            </tr>
          </thead>
          <tbody>
            {reporte.map((row) => (
              <tr key={row.employeeId} className="border-b hover:bg-slate-50/50">
                <td className="p-3 font-mono text-xs">{row.documento}</td>
                <td className="p-3 font-medium text-slate-900">{row.empleado}</td>
                <td className="p-3 text-slate-600 text-xs">{row.cargo}</td>
                <td className="p-3 text-center font-semibold text-emerald-600">{row.diasPresente}</td>
                <td className="p-3 text-center font-semibold text-amber-600">{row.tardanzas}</td>
                <td className="p-3 text-center font-semibold text-rose-600">{row.faltas}</td>
                <td className="p-3 text-center text-slate-700">{row.totalHorasExtra} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}