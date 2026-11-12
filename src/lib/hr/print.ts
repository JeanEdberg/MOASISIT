/**
 * Impresión en A4 de documentos del legajo (boleta, liquidación). Abre una
 * ventana con el HTML armado y dispara el diálogo de impresión, donde el usuario
 * puede guardar como PDF. Los datos vienen de fichas editables: se escapan antes
 * de inyectarlos al HTML.
 */

/** Escapa texto para insertarlo en HTML (evita inyección desde campos editables). */
export function escHtml(v: unknown): string {
  return String(v).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/** Abre una ventana con el HTML y lanza la impresión (guardar como PDF). */
export function openPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/** Hoja A4 vertical con la cabecera de la empresa (logo a la izquierda). */
export const A4_HEADER_STYLE = `
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 12px; }
  .company { display: flex; align-items: center; gap: 10px; }
  .title { font-size: 15px; font-weight: bold; color: #0f172a; margin: 0; }
  .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
  .meta { text-align: right; font-size: 10px; color: #475569; }
  table { width: 100%; border-collapse: collapse; }
  .foot { margin-top: 14px; font-size: 9px; color: #64748b; }
`;
