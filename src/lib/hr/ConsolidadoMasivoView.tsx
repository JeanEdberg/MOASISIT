import { FileSpreadsheet, FileText, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, fieldClass, SectionHeading } from "@/components/ui";
import { useHr } from "@/lib/hr/store";
import { calcularConsolidadoMasivo } from "@/lib/hr/calc";
import { pen } from "@/lib/hr/format";
import { logoImgHtml } from "@/lib/hr/logo";

type ConsolidadoItem = {
  dni: string;
  name?: string;
  nombre?: string;
  regimen: string;
  fechaIngreso: string;
  ctsBank?: string;
  ctsAccount?: string;
  salaryBank?: string;
  salaryAccount?: string;
  bank?: string;
  account?: string;
  sueldoComputable?: number;
  detalleCalculo?: string;
  totalPagar?: number;
};

export function ConsolidadoMasivoView() {
  const { employees, company, areas } = useHr();
  const [tipoBeneficio, setTipoBeneficio] = useState<"cts-may" | "cts-nov" | "grati-julio" | "grati-navidad">("cts-nov");
  
  // Estados para búsqueda y filtrado por área
  const [busqueda, setBusqueda] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("todas");

  // Selector editable de formato de banco para el TXT
  const bancoPorDefecto = company.id === "inmoa" ? "interbank" : company.id === "7pollitos" ? "bbva" : "bcp";
  const [bancoExportacion, setBancoExportacion] = useState<"bcp" | "interbank" | "bbva">(bancoPorDefecto);

  const anioActual = new Date().getFullYear();

  const consolidadoCrudo = calcularConsolidadoMasivo(employees, company, tipoBeneficio, anioActual);

  // Filtrado dinámico por DNI/Nombre y por Área de la empresa
  const consolidado = consolidadoCrudo.filter((item: any) => {
    const empOriginal = employees.find((e) => e.dni === item.dni);
    const coincideTexto = 
      item.dni.toLowerCase().includes(busqueda.toLowerCase()) || 
      (item.name || item.nombre || "").toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideArea = areaFiltro === "todas" || (empOriginal && empOriginal.areaId === areaFiltro);

    return coincideTexto && coincideArea;
  });

  const totalGeneral = consolidado.reduce((acc, item) => acc + item.totalPagar, 0);

  const esCts = tipoBeneficio.includes("cts");
  const etiquetaBanco = esCts ? "Banco CTS" : "Banco Sueldo";
  const etiquetaCuenta = esCts ? "N° Cuenta CTS" : "N° Cuenta Sueldo";

  const descargarArchivoTxt = (contenido: string, nombreArchivo: string) => {
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarTxtBanco = () => {
    if (consolidado.length === 0) return;

    if (bancoExportacion === "bcp") {
      const lineas = consolidado.map((item: any) => {
        const cta = (esCts ? item.ctsAccount : (item.salaryAccount || item.account)).replace(/-/g, "").trim();
        const montoCentavos = Math.round((item.totalPagar || 0) * 100).toString().padStart(15, "0");
        const nombre = (item.name || item.nombre || "").padEnd(40, " ").slice(0, 40);
        const tipoDoc = item.dni.length === 8 ? "1" : "3";
        const nroDoc = item.dni.padEnd(12, " ");
        return `D${cta.padEnd(20, " ")}S${montoCentavos}${tipoDoc}${nroDoc}${nombre}`;
      });
      descargarArchivoTxt(lineas.join("\r\n"), `BCP_Telecredito_${company.ruc}.txt`);
    } else if (bancoExportacion === "interbank") {
      const lineas = consolidado.map((item: any) => {
        const cta = (esCts ? item.ctsAccount : (item.salaryAccount || item.account)).replace(/-/g, "").trim();
        const monto = (item.totalPagar || 0).toFixed(2);
        const doc = item.dni.padEnd(12, " ");
        const nombre = (item.name || item.nombre || "").padEnd(60, " ");
        return `${doc}|${cta}|${monto}|S|${nombre}`;
      });
      descargarArchivoTxt(lineas.join("\r\n"), `Interbank_Abonos_${company.ruc}.txt`);
    } else if (bancoExportacion === "bbva") {
      const lineas = consolidado.map((item: any) => {
        const cta = (esCts ? item.ctsAccount : (item.salaryAccount || item.account)).replace(/-/g, "").trim();
        const monto = (item.totalPagar || 0).toFixed(2);
        const nombre = (item.name || item.nombre || "").padEnd(40, " ");
        return `P|${cta}|PEN|${monto}|${nombre}|DNI|${item.dni}`;
      });
      descargarArchivoTxt(lineas.join("\r\n"), `BBVA_NetCash_${company.ruc}.txt`);
    }
  };

  const exportarAExcel = () => {
    if (consolidado.length === 0) return;

    const cabeceras = [
      "DNI", "Colaborador", "Régimen", "Fecha Ingreso",
      etiquetaBanco, etiquetaCuenta, "Sueldo + AF (S/.)",
      "Detalle Técnico / Criterio", "Total a Depositar (S/.)"
    ];

    const filas = consolidado.map((item: any) => {
      const bnc = esCts ? (item.ctsBank || "BCP") : (item.salaryBank || item.bank || "BCP");
      const cta = esCts ? (item.ctsAccount || "Sin registrar") : (item.salaryAccount || item.account || "Sin registrar");

      return [
        `"${item.dni}"`, `"${item.name || item.nombre}"`, `"${item.regimen}"`,
        `"${item.fechaIngreso}"`, `"${bnc}"`, `"${cta}"`,
        `"${(item.sueldoComputable || 0).toFixed(2)}"`,
        `"${(item.detalleCalculo || "").replace(/"/g, '""')}"`,
        `"${(item.totalPagar || 0).toFixed(2)}"`
      ];
    });

    const filaTotal = ['', '', '', '', '', '', '', 'TOTAL GENERAL A DESEMBOLSAR', totalGeneral.toFixed(2)];

    const contenidoCsv = [
      cabeceras.join(";"),
      ...filas.map((f) => f.join(";")),
      filaTotal.join(";")
    ].join("\n");

    const blob = new Blob(["\uFEFF" + contenidoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Consolidado_${tipoBeneficio.toUpperCase()}_${company.ruc}_${anioActual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarAPDF = () => {
    if (consolidado.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tituloBeneficio =
      tipoBeneficio === "cts-nov" ? "CTS SEMESTRE NOVIEMBRE (MAYO - OCTUBRE)" :
      tipoBeneficio === "cts-may" ? "CTS SEMESTRE MAYO (NOVIEMBRE - ABRIL)" :
      tipoBeneficio === "grati-julio" ? "GRATIFICACIÓN FIESTAS PATRIAS (JULIO)" :
      "GRATIFICACIÓN DE NAVIDAD (DICIEMBRE)";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Consolidado ${tipoBeneficio.toUpperCase()} - ${company.name}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 5px; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 15px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
          .meta { text-align: right; font-size: 9px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-align: left; padding: 6px; font-size: 9.5px; border-bottom: 1.5px solid #cbd5e1; }
          td { padding: 6px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          .num { font-family: monospace; text-align: right; }
          .mono { font-family: monospace; }
          .total-row { background-color: #f0f9ff; font-weight: bold; }
          .total-row td { border-top: 2px solid #0284c7; color: #0369a1; font-size: 11px; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-around; text-align: center; font-size: 9px; }
          .line { border-top: 1px solid #94a3b8; width: 180px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${logoImgHtml(company)}
            <h1 class="title" style="margin-top:6px;">${company.name}</h1>
            <div class="subtitle">RUC: ${company.ruc} | REPORTE CONSOLIDADO MASIVO DE BENEFICIOS SOCIALES</div>
            <div style="font-weight: bold; margin-top: 4px; color: #0369a1;">${tituloBeneficio} - AÑO ${anioActual}</div>
          </div>
          <div class="meta">
            <div>Fecha de Emisión: ${new Date().toLocaleDateString('es-PE')}</div>
            <div>Sistema: <strong>Moasist HR</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>COLABORADOR</th>
              <th>F. INGRESO</th>
              <th>${etiquetaBanco.toUpperCase()}</th>
              <th>${etiquetaCuenta.toUpperCase()}</th>
              <th>SUELDO + AF</th>
              <th>DETALLE TÉCNICO / CRITERIO</th>
              <th style="text-align: right;">TOTAL A DEPOSITAR</th>
            </tr>
          </thead>
          <tbody>
            ${consolidado.map((item: any) => {
              const bnc = esCts ? (item.ctsBank || "BCP") : (item.salaryBank || item.bank || "BCP");
              const cta = esCts ? (item.ctsAccount || "Sin registrar") : (item.salaryAccount || item.account || "Sin registrar");

              return `
                <tr>
                  <td class="mono">${item.dni}</td>
                  <td><strong>${item.name || item.nombre}</strong></td>
                  <td>${item.fechaIngreso}</td>
                  <td>${bnc}</td>
                  <td class="mono">${cta}</td>
                  <td class="num">S/. ${(item.sueldoComputable || 0).toFixed(2)}</td>
                  <td style="font-size: 8.5px; color: #64748b;">${item.detalleCalculo}</td>
                  <td class="num" style="font-weight: bold; color: #0369a1;">S/. ${(item.totalPagar || 0).toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="7" style="text-align: right;">TOTAL GENERAL A DESEMBOLSAR:</td>
              <td class="num">S/. ${totalGeneral.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div>
            <div class="line"></div>
            <div>Elaborado por: Contabilidad / RRHH</div>
          </div>
          <div>
            <div class="line"></div>
            <div>V°B° Gerencia General</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SectionHeading
        icon={Wallet}
        title="Consolidado masivo de beneficios sociales"
        description={`${company.name} — RUC: ${company.ruc}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={tipoBeneficio}
              onChange={(e) => setTipoBeneficio(e.target.value as typeof tipoBeneficio)}
              className={fieldClass}
              aria-label="Tipo de beneficio"
            >
              <option value="cts-nov">CTS Semestre Noviembre</option>
              <option value="cts-may">CTS Semestre Mayo</option>
              <option value="grati-julio">Gratificación Fiestas Patrias</option>
              <option value="grati-navidad">Gratificación Navidad</option>
            </select>
            <select
              value={bancoExportacion}
              onChange={(e) => setBancoExportacion(e.target.value as typeof bancoExportacion)}
              className={fieldClass}
              aria-label="Banco para el archivo TXT"
            >
              <option value="interbank">TXT: Interbank</option>
              <option value="bcp">TXT: BCP (Telecrédito)</option>
              <option value="bbva">TXT: BBVA</option>
            </select>
            <Button tone="line" onClick={exportarAExcel} disabled={consolidado.length === 0}>
              <FileSpreadsheet className="size-4" /> Excel
            </Button>
            <Button tone="primary" onClick={exportarTxtBanco} disabled={consolidado.length === 0}>
              <Landmark className="size-4" /> TXT banco
            </Button>
            <Button tone="moss" onClick={exportarAPDF} disabled={consolidado.length === 0}>
              <FileText className="size-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por DNI o colaborador…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="w-full sm:w-64">
          <select value={areaFiltro} onChange={(e) => setAreaFiltro(e.target.value)} className={fieldClass} aria-label="Filtrar por área">
            <option value="todas">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-3 py-3 font-medium">DNI</th>
              <th className="px-3 py-3 font-medium">Colaborador</th>
              <th className="px-3 py-3 font-medium">Régimen</th>
              <th className="px-3 py-3 font-medium">F. ingreso</th>
              <th className="px-3 py-3 font-medium">{etiquetaBanco}</th>
              <th className="px-3 py-3 font-medium">{etiquetaCuenta}</th>
              <th className="px-3 py-3 font-medium">Sueldo + AF</th>
              <th className="px-3 py-3 font-medium">Detalle técnico</th>
              <th className="px-3 py-3 text-right font-medium">Total a depositar</th>
            </tr>
          </thead>
          <tbody>
            {consolidado.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted">
                  No se encontraron colaboradores que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              consolidado.map((item: ConsolidadoItem) => {
                const bnc = esCts ? item.ctsBank || "BCP" : item.salaryBank || item.bank || "BCP";
                const cta = esCts ? item.ctsAccount || "Sin registrar" : item.salaryAccount || item.account || "Sin registrar";
                return (
                  <tr key={item.dni} className="border-t border-line">
                    <td className="num px-3 py-3 text-muted">{item.dni}</td>
                    <td className="px-3 py-3 font-medium text-ink">{item.name || item.nombre || "Sin nombre"}</td>
                    <td className="px-3 py-3 text-muted">{item.regimen}</td>
                    <td className="px-3 py-3 text-muted">{item.fechaIngreso}</td>
                    <td className="px-3 py-3">
                      <Badge tone="line">{bnc}</Badge>
                    </td>
                    <td className="num px-3 py-3 text-muted">{cta}</td>
                    <td className="num px-3 py-3 text-ink">S/ {pen(item.sueldoComputable || 0)}</td>
                    <td className="px-3 py-3 text-xs text-muted">{item.detalleCalculo}</td>
                    <td className="num px-3 py-3 text-right font-semibold text-clay">S/ {pen(item.totalPagar || 0)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 p-4">
        <span className="font-medium text-ink">Monto total consolidado a desembolsar (filtrado)</span>
        <span className="num font-display text-2xl text-clay">S/ {pen(totalGeneral)}</span>
      </div>
    </Card>
  );
}