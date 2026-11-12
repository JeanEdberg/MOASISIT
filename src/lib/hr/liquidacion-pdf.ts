/**
 * Hoja A4 de la liquidación de beneficios, lista para imprimir o guardar en
 * PDF. Reproduce el modelo de la empresa: cabecera con el logo a la izquierda,
 * secciones numeradas, total en letras y firmas.
 */

import { escHtml, openPrintWindow } from "@/lib/hr/print";
import { shortDate } from "@/lib/hr/format";
import type { LiquidationSheet } from "@/lib/hr/liquidacion-sheet";
import type { Company } from "@/lib/hr/types";

const money = (n: number) => `S/. ${n.toFixed(2)}`;

export function liquidationSheetHtml(sheet: LiquidationSheet, company: Company): string {
  const esc = escHtml;
  const logo = company.logo
    ? `<img src="${company.logo}" alt="" style="height:52px;width:auto;max-width:200px;object-fit:contain;display:block;" />`
    : "";

  const sectionRows = (rows: { label: string; detail: string; amount: number }[]) =>
    rows
      .map(
        (r) => `
        <tr>
          <td>${esc(r.label)}<div class="det">${esc(r.detail)}</div></td>
          <td class="num">${money(r.amount)}</td>
        </tr>`,
      )
      .join("");

  const sections = sheet.sections
    .map((s) => {
      const strong = s.key === "resumen";
      return `
      <table class="sec ${strong ? "strong" : ""}">
        <thead><tr><th colspan="2">${esc(s.title)}</th></tr></thead>
        <tbody>
          ${sectionRows(s.rows)}
          <tr class="sub"><td>${strong ? "TOTAL NETO A PAGAR" : "Subtotal"}</td><td class="num">${money(s.subtotal)}</td></tr>
        </tbody>
      </table>`;
    })
    .join("");

  const reference = sheet.reference.length
    ? `<p class="foot"><strong>Referencia (no se suma):</strong> ${sheet.reference
        .map((r) => `${esc(r.label)} ${money(r.amount)}`)
        .join(" · ")}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Liquidación ${esc(sheet.employeeName)} - ${esc(company.name)}</title>
      <style>
        @page { size: A4 portrait; margin: 14mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 10px; }
        .title { font-size: 15px; font-weight: bold; color: #0f172a; margin: 4px 0 0; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .meta { text-align: right; font-size: 10px; color: #475569; }
        .data { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin: 10px 0 14px; }
        .data div { font-size: 10px; }
        .data span { color: #64748b; }
        table.sec { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        table.sec th { background: #e2efda; color: #1e4620; text-align: left; padding: 5px 6px; font-size: 10px; border-bottom: 1.5px solid #a9c98e; }
        table.sec.strong th { background: #1c4587; color: #ffffff; border-bottom-color: #1c4587; }
        table.sec td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 10px; vertical-align: top; }
        table.sec .det { color: #64748b; font-size: 8.5px; }
        .num { font-family: monospace; text-align: right; white-space: nowrap; }
        tr.sub td { background: #fff2cc; font-weight: bold; }
        table.sec.strong tr.sub td { background: #e2efda; color: #1e4620; font-size: 11px; }
        .letras { margin-top: 10px; padding: 6px 8px; background: #f1f5f9; font-weight: bold; font-size: 10px; }
        .decl { margin-top: 10px; font-size: 9px; color: #475569; text-align: justify; }
        .firmas { margin-top: 34px; display: flex; justify-content: space-around; text-align: center; font-size: 9px; }
        .line { border-top: 1px solid #94a3b8; width: 200px; margin: 0 auto 4px; }
        .foot { margin-top: 12px; font-size: 8px; color: #94a3b8; }
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
          <div>Liquidación de beneficios sociales</div>
          <div style="font-weight:bold;">${sheet.mode === "cese" ? "Cese" : "Simulación"} · ${esc(shortDate(sheet.asOf))}</div>
          <div>${esc(sheet.regimeLabel)}</div>
        </div>
      </div>

      <div class="data">
        <div><span>Colaborador:</span> ${esc(sheet.employeeName)}</div>
        <div><span>DNI:</span> ${esc(sheet.dni)}</div>
        <div><span>Cargo:</span> ${esc(sheet.position)}</div>
        <div><span>Fecha de ingreso:</span> ${esc(shortDate(sheet.hireDate))}</div>
      </div>

      ${sections}

      <div class="letras">${esc(sheet.totalEnLetras)}</div>

      ${reference}

      <p class="decl">
        Con fecha ${esc(shortDate(sheet.asOf))}, el trabajador declara haber recibido el monto total a entera satisfacción,
        sin reclamo pendiente contra ${esc(company.name)}.
      </p>

      <div class="firmas">
        <div><div class="line"></div>${esc(company.name)}<br />EL EMPLEADOR</div>
        <div><div class="line"></div>${esc(sheet.employeeName)}<br />EL TRABAJADOR · DNI ${esc(sheet.dni)}</div>
      </div>

      <p class="foot">
        Base legal: D. Leg. N° 650 (CTS) · Ley N° 27735 (gratificaciones) · Ley N° 29351/30334 (bonificación extraordinaria)
        · D. Leg. N° 713 (vacaciones). Cálculo referencial; la asesoría laboral valida el monto antes del pago.
      </p>
    </body>
    </html>`;
}

/** Abre la hoja de liquidación en una ventana lista para imprimir o guardar en PDF. */
export function exportLiquidationPdf(sheet: LiquidationSheet, company: Company): void {
  openPrintWindow(liquidationSheetHtml(sheet, company));
}
