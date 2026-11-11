import type { AttachmentKind, Employee, EmployeeAttachments } from "@/lib/hr/types";

/**
 * Lectura de documentos adjuntos (resoluciones, contratos, T-Registros) como
 * data URL para guardarlos dentro del dataset (jsonb). Módulo de navegador:
 * usa FileReader. Se separa del logo porque aquí también se acepta PDF.
 */

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Límite por archivo. Los adjuntos viven en el dataset (jsonb), no en un CDN. */
export const MAX_ATTACHMENT_BYTES = 3_000_000;

export type AttachmentReadResult = { ok: true; dataUrl: string } | { ok: false; error: string };

export function readAttachmentFile(file: File): Promise<AttachmentReadResult> {
  if (!ACCEPTED.includes(file.type)) {
    return Promise.resolve({ ok: false, error: "Formato no soportado. Usa PDF, PNG o JPG." });
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return Promise.resolve({
      ok: false,
      error: `El archivo pesa demasiado (máx. ${(MAX_ATTACHMENT_BYTES / 1_000_000).toFixed(0)} MB).`,
    });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ ok: true, dataUrl: String(reader.result ?? "") });
    reader.onerror = () => resolve({ ok: false, error: "No se pudo leer el archivo." });
    reader.readAsDataURL(file);
  });
}

/** ¿El data URL corresponde a un PDF (para mostrarlo embebido en un iframe)? */
export function isPdfDataUrl(dataUrl: string | undefined): boolean {
  return Boolean(dataUrl?.startsWith("data:application/pdf"));
}

export const ATTACHMENT_LABEL: Record<AttachmentKind, string> = {
  tRegistroAlta: "T-Registro de alta (SUNAT)",
  tRegistroBaja: "T-Registro de baja (SUNAT)",
  contrato: "Contrato firmado",
  liquidacion: "Liquidación de beneficios",
};

/** Adjuntos de un colaborador, normalizados a un objeto (nunca undefined). */
export function attachmentsOf(emp: Pick<Employee, "attachments">): EmployeeAttachments {
  return emp.attachments ?? {};
}

/**
 * Nombres de los adjuntos obligatorios que faltan en un colaborador activo.
 * Sirve para el aviso "documentación incompleta" de la ficha.
 */
export function missingAttachments(emp: Pick<Employee, "status" | "attachments">): AttachmentKind[] {
  const have = attachmentsOf(emp);
  const missing: AttachmentKind[] = [];
  if (!have.tRegistroAlta) missing.push("tRegistroAlta");
  if (!have.contrato) missing.push("contrato");
  if (emp.status === "cesado" && !have.tRegistroBaja) missing.push("tRegistroBaja");
  return missing;
}
