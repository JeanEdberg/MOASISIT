import * as XLSX from "xlsx";
import type { Company, Employee, Payslip } from "@/lib/hr/types";
import { fullName, PENSION_LABEL, periodLabel } from "@/lib/hr/format";
import { escHtml } from "@/lib/hr/print";

export type PayrollRow = {
  code: string;
  name: string;
  dni: string;
  position: string;
  gross: number;
  discounts: number;
  fifth: number;
  net: number;
  essalud: number;
  eps: number;
  sctr: number;
  sctrSalud: number;
  sctrPension: number;
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
      fifth: p.fifth,
      net: p.net,
      essalud: p.essalud,
      eps: p.eps,
      sctr: p.sctr,
      sctrSalud: p.sctrSalud,
      sctrPension: p.sctrPension,
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
    fifth: sum((r) => r.fifth),
    net: sum((r) => r.net),
    essalud: sum((r) => r.essalud),
    eps: sum((r) => r.eps),
    sctr: sum((r) => r.sctr),
    sctrSalud: sum((r) => r.sctrSalud),
    sctrPension: sum((r) => r.sctrPension),
    vidaLey: sum((r) => r.vidaLey),
    cts: sum((r) => r.cts ?? 0),
  };
}

/** Columnas de aportes del empleador, con el SCTR desglosado (SUNAT). */
const APORTE_HEADERS = ["EsSalud", "EPS", "SCTR Salud", "SCTR Pensión", "Vida Ley"] as const;

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
    "Renta 5ta",
    "Neto",
    ...APORTE_HEADERS,
    ...(showCts ? ["CTS del semestre"] : []),
  ];

  const body = rows.map((r) => [
    r.code,
    r.name,
    r.dni,
    r.position,
    r.gross,
    r.discounts,
    r.fifth,
    r.net,
    r.essalud,
    r.eps,
    r.sctrSalud,
    r.sctrPension,
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
    t.fifth,
    t.net,
    t.essalud,
    t.eps,
    t.sctrSalud,
    t.sctrPension,
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
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
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
    "Renta 5ta",
    "Neto",
    ...APORTE_HEADERS,
    ...(showCts ? ["CTS semestre"] : []),
  ];
  const cols = headCells.length;
  const numericCols = 10 + (showCts ? 1 : 0);

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
        <td class="num">${money(r.fifth)}</td>
        <td class="num strong">${money(r.net)}</td>
        <td class="num">${money(r.essalud)}</td>
        <td class="num">${money(r.eps)}</td>
        <td class="num">${money(r.sctrSalud)}</td>
        <td class="num">${money(r.sctrPension)}</td>
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
            <td class="num">${money(t.fifth)}</td>
            <td class="num">${money(t.net)}</td>
            <td class="num">${money(t.essalud)}</td>
            <td class="num">${money(t.eps)}</td>
            <td class="num">${money(t.sctrSalud)}</td>
            <td class="num">${money(t.sctrPension)}</td>
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

/**
 * Boleta individual de un colaborador, en A4 vertical con el logo de la empresa
 * arriba a la izquierda. Pensada para que la descargue el propio colaborador o
 * la imprima RR.HH.
 */
export function exportPayslipPdf(slip: Payslip, employee: Employee, company: Company): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const esc = escHtml;
  const money = (n: number) => `S/. ${n.toFixed(2)}`;
  const logo = company.logo
    ? `<img src="${company.logo}" alt="" style="height:52px;width:auto;max-width:200px;object-fit:contain;display:block;" />`
    : "";

  const rowsFor = (kind: "ingreso" | "descuento" | "aporte") =>
    slip.lines
      .filter((l) => l.kind === kind)
      .map((l) => `<tr><td>${esc(l.name)}</td><td class="num">${money(l.amount)}</td></tr>`)
      .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Boleta ${esc(periodLabel(slip.period))} - ${esc(fullName(employee))}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 12px; }
        .title { font-size: 15px; font-weight: bold; color: #0f172a; margin: 4px 0 0; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .meta { text-align: right; font-size: 10px; color: #475569; }
        .data { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin: 12px 0; }
        .data div { font-size: 10px; }
        .data span { color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th { background: #f1f5f9; color: #334155; text-align: left; padding: 5px; font-size: 10px; border-bottom: 1.5px solid #cbd5e1; }
        td { padding: 5px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .num { font-family: monospace; text-align: right; }
        .cols { display: flex; gap: 18px; }
        .cols > div { flex: 1; }
        .totals { margin-top: 12px; display: flex; justify-content: flex-end; gap: 24px; border-top: 2px solid #0284c7; padding-top: 8px; }
        .totals div { text-align: right; font-size: 11px; }
        .totals strong { display: block; font-size: 14px; color: #0369a1; }
        .foot { margin-top: 16px; font-size: 9px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logo}
          <h1 class="title">${esc(company.name)}</h1>
          <div class="subtitle">RUC ${esc(company.ruc)} · ${esc(company.address)}, ${esc(company.city)}</div>
        </div>
        <div class="meta">
          <div>Boleta de pago</div>
          <div style="font-weight:bold;font-size:13px;">${esc(periodLabel(slip.period))}</div>
          <div>${esc(employee.code)}</div>
        </div>
      </div>
      <div class="data">
        <div><span>Colaborador:</span> ${esc(fullName(employee))}</div>
        <div><span>DNI:</span> ${esc(employee.dni)}</div>
        <div><span>Cargo:</span> ${esc(employee.position)}</div>
        <div><span>Régimen pensionario:</span> ${esc(PENSION_LABEL[employee.pension])}</div>
      </div>
      <div class="cols">
        <div>
          <table>
            <thead><tr><th>Ingresos</th><th class="num">S/.</th></tr></thead>
            <tbody>${rowsFor("ingreso") || `<tr><td colspan="2">Sin conceptos.</td></tr>`}</tbody>
          </table>
        </div>
        <div>
          <table>
            <thead><tr><th>Descuentos</th><th class="num">S/.</th></tr></thead>
            <tbody>${rowsFor("descuento") || `<tr><td colspan="2">Sin conceptos.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <div class="totals">
        <div>Total ingresos<strong>${money(slip.gross)}</strong></div>
        <div>Total descuentos<strong>${money(slip.discounts)}</strong></div>
        <div>Neto a pagar<strong>${money(slip.net)}</strong></div>
      </div>
      ${
        slip.lines.some((l) => l.kind === "aporte")
          ? `<p class="foot"><strong>Aportes del empleador (no se descuentan del neto):</strong> ${slip.lines
              .filter((l) => l.kind === "aporte")
              .map((l) => `${esc(l.name)} ${money(l.amount)}`)
              .join(" · ")}</p>`
          : ""
      }
      <p class="foot">Estimación de referencia con los parámetros de la empresa. No es una boleta electrónica ni reemplaza el PLAME.</p>
      <script>window.onload=function(){window.print();};</script>
    </body>
    </html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
