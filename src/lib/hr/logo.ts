import type { Company } from "@/lib/hr/types";

/** Tipos de imagen aceptados para el logo de la empresa (Word no muestra SVG). */
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

/** Límite del logo en bytes. Se guarda dentro del dataset (jsonb), no en un CDN. */
export const MAX_LOGO_BYTES = 1_000_000;

export type LogoReadResult = { ok: true; dataUrl: string } | { ok: false; error: string };

/** Lee y valida un archivo de logo; devuelve su data URL lista para guardar. */
export function readLogoFile(file: File): Promise<LogoReadResult> {
  if (!ACCEPTED.includes(file.type)) {
    return Promise.resolve({ ok: false, error: "Formato no soportado. Usa PNG o JPG." });
  }
  if (file.size > MAX_LOGO_BYTES) {
    return Promise.resolve({
      ok: false,
      error: `La imagen pesa demasiado (máx. ${(MAX_LOGO_BYTES / 1_000_000).toFixed(0)} MB).`,
    });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ ok: true, dataUrl: String(reader.result ?? "") });
    reader.onerror = () => resolve({ ok: false, error: "No se pudo leer la imagen." });
    reader.readAsDataURL(file);
  });
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * `<img>` del logo para documentos impresos o de Word. Devuelve "" si la empresa
 * no tiene logo, así la cabecera sigue funcionando igual.
 */
export function logoImgHtml(company: Company, height = 46): string {
  if (!company.logo) return "";
  return `<img src="${company.logo}" alt="${escapeAttr(company.name)}" style="height:${height}px;width:auto;max-width:200px;object-fit:contain;display:block;" />`;
}
