/**
 * Monto en letras para los documentos de liquidación ("SON: ... CON 00/100 SOLES").
 * Módulo puro, sin React. Sigue el formato del modelo de la empresa.
 */

const UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DECENAS = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const ESPECIALES: Record<number, string> = {
  11: "ONCE",
  12: "DOCE",
  13: "TRECE",
  14: "CATORCE",
  15: "QUINCE",
  16: "DIECISEIS",
  17: "DIECISIETE",
  18: "DIECIOCHO",
  19: "DIECINUEVE",
  21: "VEINTIUNO",
  22: "VEINTIDOS",
  23: "VEINTITRES",
  24: "VEINTICUATRO",
  25: "VEINTICINCO",
  26: "VEINTISEIS",
  27: "VEINTISIETE",
  28: "VEINTIOCHO",
  29: "VEINTINUEVE",
};
const CENTENAS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

function convertirUnidades(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  if (n < 10) return UNIDADES[n];
  if (ESPECIALES[n]) return ESPECIALES[n];
  if (n < 30) return `VEINTI${UNIDADES[n - 20]}`;
  if (n < 100) {
    const u = n % 10;
    const d = Math.floor(n / 10);
    return DECENAS[d] + (u > 0 ? ` Y ${UNIDADES[u]}` : "");
  }
  if (n < 1000) {
    const resto = n % 100;
    const c = Math.floor(n / 100);
    return CENTENAS[c] + (resto > 0 ? ` ${convertirUnidades(resto)}` : "");
  }
  if (n < 1_000_000) {
    const miles = Math.floor(n / 1000);
    const restoMiles = n % 1000;
    const strMiles = miles === 1 ? "MIL" : `${convertirUnidades(miles)} MIL`;
    return strMiles + (restoMiles > 0 ? ` ${convertirUnidades(restoMiles)}` : "");
  }
  return String(n);
}

/** Convierte un monto a letras: 3393.17 → "SON: TRES MIL TRESCIENTOS NOVENTA Y TRES CON 17/100 SOLES". */
export function numeroALetras(monto: number): string {
  if (!Number.isFinite(monto)) return "";
  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const strCentavos = `${centavos < 10 ? "0" : ""}${centavos}/100 SOLES`;
  if (entero === 0) return `SON: CERO CON ${strCentavos}`;
  return `SON: ${convertirUnidades(entero).trim()} CON ${strCentavos}`;
}
