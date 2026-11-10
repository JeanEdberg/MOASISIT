import * as XLSX from "xlsx";
import type { Company, Employee, Payslip } from "@/lib/hr/types";
import { fullName, periodLabel } from "@/lib/hr/format";

export type PayrollRow = {
  code: string;
  name: string;
  dni: string;
  position: string;
  gross: number;
  discounts: number;
  net: number;
  essalud: number;
  eps: number;
  sctr: number;
  vidaLey: number;
  cts: number | null;
};

export function buildPayrollRows(
  slips: Payslip[],
  employees: Employee[],
): PayrollRow[] {
  return slips.map((p) => {
    const e = employees.find((x) => x.id === p.employeeId);
    return {
      code: e?.code ?? "",
      name: e ? fullName(e) : "—",
      dni: e?.dni ?? "",
      position: e?.position ?? "",
      gross: p.gross,
      discounts: p.discounts,
      net: p.net,
      essalud: p.essalud,
      eps: p.eps,
      sctr: p.sctr,
      vidaLey: p.vidaLey,
      cts: p.cts,
    };
  });
}

function totals(rows: PayrollRow[]) {
  const sum = (fn: (r: PayrollRow) => number) => rows.reduce((s, r) => s + fn(r), 0);
  return {
    gross: sum((r) => r.gross),
    discounts: sum((r) => r.discounts),
    net: sum((r) => r.net),
    essalud: sum((r) => r.essalud),
    eps: sum((r) => r.eps),
    sctr: sum((r) => r.sctr),
    vidaLey: sum((r) => r.vidaLey),
    cts: sum((r) => r.cts ?? 0),
  };
}

/** Genera y descarga un libro Excel (.xlsx) con la planilla del periodo. */
export function exportPayrollExcel(rows: PayrollRow[], company: Company, period: string): void {
  const showCts = period.endsWith("-05") || period.endsWith("-11");
  const t = totals(rows);

  const header = [
    "Código",
    "Colaborador",
    "DNI",
    "Cargo",
    "Ingresos",
    "Descuentos",
    "Neto",
    "EsSalud",
    "EPS",
    "SCTR",
    "Vida Ley",
    ...(showCts ? ["CTS del semestre"] : []),
  ];

  const body = rows.map((r) => [
    r.code,
    r.name,
    r.dni,
    r.position,
    r.gross,
    r.discounts,
    r.net,
    r.essalud,
    r.eps,
    r.sctr,
    r.vidaLey,
    ...(showCts ? [r.cts ?? 0] : []),
  ]);

  const totalRow = [
    "",
    "TOTAL GENERAL",
    "",
    "",
    t.gross,
    t.discounts,
    t.net,
    t.essalud,
    t.eps,
    t.sctr,
    t.vidaLey,
    ...(showCts ? [t.cts] : []),
  ];

  const aoa = [
    [`${company.name} — Planilla ${periodLabel(period)}`],
    [`RUC ${company.ruc} · ${company.city} · Emitido ${new Date().toLocaleDateString("es-PE")}`],
    [],
    header,
    ...body,
    [],
    totalRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 10 },
    { wch: 32 },
    { wch: 10 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    ...(showCts ? [{ wch: 14 }] : []),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Planilla");
  XLSX.writeFile(wb, `planilla-${company.ruc}-${period}.xlsx`);
}

/** Abre la planilla en una ventana lista para imprimir / guardar como PDF. */
export function exportPayrollPdf(rows: PayrollRow[], company: Company, period: string): void {
  const showCts = period.endsWith("-05") || period.endsWith("-11");
  const t = totals(rows);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Los datos vienen de fichas editables: escápalos antes de inyectarlos al HTML.
  const esc = (v: unknown) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

  const money = (n: number) => `S/. ${n.toFixed(2)}`;
  const headCells = [
    "Código",
    "Colaborador",
    "DNI",
    "Cargo",
    "Ingresos",
    "Descuentos",
    "Neto",
    "EsSalud",
    "EPS",
    "SCTR",
    "Vida Ley",
    ...(showCts ? ["CTS semestre"] : []),
  ];
  const cols = headCells.length;
  const numericCols = 7 + (showCts ? 1 : 0);

  const bodyRows = rows
    .map(
      (r) => `
      <tr>
        <td class="mono">${esc(r.code)}</td>
        <td>${esc(r.name)}</td>
        <td class="mono">${esc(r.dni)}</td>
        <td>${esc(r.position)}</td>
        <td class="num">${money(r.gross)}</td>
        <td class="num">${money(r.discounts)}</td>
        <td class="num strong">${money(r.net)}</td>
        <td class="num">${money(r.essalud)}</td>
        <td class="num">${money(r.eps)}</td>
        <td class="num">${money(r.sctr)}</td>
        <td class="num">${money(r.vidaLey)}</td>
        ${showCts ? `<td class="num">${money(r.cts ?? 0)}</td>` : ""}
      </tr>`,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Planilla ${periodLabel(period)} - ${company.name}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 5px; }
        .header { border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 15px; font-weight: bold; color: #0f172a; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .meta { text-align: right; font-size: 9px; color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-align: left; padding: 5px; font-size: 9px; border-bottom: 1.5px solid #cbd5e1; }
        td { padding: 5px; border-bottom: 1px solid #e2e8f0; }
        .num { font-family: monospace; text-align: right; }
        .mono { font-family: monospace; }
        .strong { font-weight: bold; color: #0369a1; }
        .total-row { background-color: #f0f9ff; font-weight: bold; }
        .total-row td { border-top: 2px solid #0284c7; color: #0369a1; }
        .signatures { margin-top: 40px; display: flex; justify-content: space-around; text-align: center; font-size: 9px; }
        .line { border-top: 1px solid #94a3b8; width: 180px; margin-bottom: 4px; }
        .foot { margin-top: 10px; font-size: 8px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">${esc(company.name)}</h1>
          <div class="subtitle">RUC: ${esc(company.ruc)} | PLANILLA DE REMUNERACIONES</div>
          <div style="font-weight: bold; margin-top: 4px; color: #0369a1;">${periodLabel(period)}</div>
        </div>
        <div class="meta">
          <div>Fecha de Emisión: ${new Date().toLocaleDateString("es-PE")}</div>
          <div>Sistema: <strong>Moasist HR</strong></div>
          <div>${rows.length} colaborador(es)</div>
        </div>
      </div>
      <table>
        <thead><tr>${headCells.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${bodyRows}
          <tr class="total-row">
            <td colspan="${cols - numericCols}" style="text-align:right;">TOTAL GENERAL:</td>
            <td class="num">${money(t.gross)}</td>
            <td class="num">${money(t.discounts)}</td>
            <td class="num">${money(t.net)}</td>
            <td class="num">${money(t.essalud)}</td>
            <td class="num">${money(t.eps)}</td>
            <td class="num">${money(t.sctr)}</td>
            <td class="num">${money(t.vidaLey)}</td>
            ${showCts ? `<td class="num">${money(t.cts)}</td>` : ""}
          </tr>
        </tbody>
      </table>
      <div class="signatures">
        <div><div class="line"></div><div>Elaborado por: Contabilidad / RR.HH.</div></div>
        <div><div class="line"></div><div>V°B° Gerencia General</div></div>
      </div>
      <p class="foot">Estimación referencial con los parámetros de la empresa. No reemplaza el PLAME.</p>
      <script>
        window.onload = function () {
          window.print();
          setTimeout(function () { window.close(); }, 500);
        };
      </script>
    </body>
    </html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
