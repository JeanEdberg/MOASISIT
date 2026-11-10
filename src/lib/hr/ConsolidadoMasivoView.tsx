import React, { useState } from "react";
import { useHr } from "@/lib/hr/store";
import { calcularConsolidadoMasivo } from "@/lib/hr/calc";
import { logoImgHtml } from "@/lib/hr/logo";

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
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consolidado Masivo de Beneficios Sociales</h2>
          <p className="text-sm text-slate-500">{company.name} — RUC: {company.ruc}</p>
        </div>

        {/* Barra de Acciones y Exportaciones */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tipoBeneficio}
            onChange={(e) => setTipoBeneficio(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-700"
          >
            <option value="cts-nov">CTS Semestre Noviembre</option>
            <option value="cts-may">CTS Semestre Mayo</option>
            <option value="grati-julio">Gratificación Fiestas Patrias</option>
            <option value="grati-navidad">Gratificación Navidad</option>
          </select>

          <select
            value={bancoExportacion}
            onChange={(e) => setBancoExportacion(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm bg-sky-50 font-semibold text-sky-800 border-sky-200"
          >
            <option value="interbank">Banco TXT: Interbank</option>
            <option value="bcp">Banco TXT: BCP (Telecrédito)</option>
            <option value="bbva">Banco TXT: BBVA</option>
          </select>

          <button onClick={exportarAExcel} disabled={consolidado.length === 0} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm">Excel</button>
          <button onClick={exportarTxtBanco} disabled={consolidado.length === 0} className="px-3 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm">TXT Banco</button>
          <button onClick={exportarAPDF} disabled={consolidado.length === 0} className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm">PDF</button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por DNI o Colaborador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={areaFiltro}
            onChange={(e) => setAreaFiltro(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="todas">Todas las Áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b">
              <th className="p-3 font-semibold">DNI</th>
              <th className="p-3 font-semibold">Colaborador</th>
              <th className="p-3 font-semibold">Régimen</th>
              <th className="p-3 font-semibold">F. Ingreso</th>
              <th className="p-3 font-semibold">{etiquetaBanco}</th>
              <th className="p-3 font-semibold">{etiquetaCuenta}</th>
              <th className="p-3 font-semibold">Sueldo + AF (S/.)</th>
              <th className="p-3 font-semibold">Detalle Técnico</th>
              <th className="p-3 font-semibold text-right">Total a Depositar (S/.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {consolidado.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400">
                  No se encontraron colaboradores que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              consolidado.map((item: any) => {
                const bnc = esCts ? (item.ctsBank || "BCP") : (item.salaryBank || item.bank || "BCP");
                const cta = esCts ? (item.ctsAccount || "Sin registrar") : (item.salaryAccount || item.account || "Sin registrar");

                return (
                  <tr key={item.dni} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-600">{item.dni}</td>
                    <td className="p-3 font-medium text-slate-900">{item.name || item.nombre || "Sin Nombre"}</td>
                    <td className="p-3 text-slate-600">{item.regimen}</td>
                    <td className="p-3 text-slate-600">{item.fechaIngreso}</td>
                    <td className="p-3 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-xs border border-slate-200">{bnc}</span>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-700">{cta}</td>
                    <td className="p-3 font-mono text-slate-800">S/. {(item.sueldoComputable || 0).toFixed(2)}</td>
                    <td className="p-3 text-xs text-slate-500">{item.detalleCalculo}</td>
                    <td className="p-3 font-mono font-bold text-sky-700 text-right">
                      S/. {(item.totalPagar || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-sky-50 p-4 rounded-lg border border-sky-100">
        <span className="font-semibold text-sky-900">Monto Total Consolidado a Desembolsar (Filtrado):</span>
        <span className="font-mono text-xl font-bold text-sky-800">
          S/. {totalGeneral.toFixed(2)}
        </span>
      </div>
    </div>
  );
}