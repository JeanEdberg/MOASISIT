import type { Employee, AttendanceKind } from "./types";

export interface GeoLocation {
  lat: number;
  lon: number;
}

// Coordenadas oficiales de la Oficina Central (Tambopata, Puerto Maldonado)
const OFICINA_CENTRAL: GeoLocation = { lat: -12.5933, lon: -69.1891 };
const RADIO_TOLERANCIA_METROS = 150; // 150 metros de radio permitido

/**
 * Calcula la distancia en metros entre dos puntos geográficos usando la fórmula Haversine.
 */
export function calcularDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ResultadoValidacionAsistencia {
  aprobado: boolean;
  kind: AttendanceKind;
  mensaje: string;
  distanciaMetros?: number;
}

/**
 * Valida el fichaje de asistencia según la modalidad laboral (workMode) del colaborador.
 */
export function validarYRegistrarAsistencia(
  employee: Employee,
  ubicacionActual?: GeoLocation
): ResultadoValidacionAsistencia {
  
  // 1. Si es Itinerante (Gerencia: Jean y Ericka): Bypass geográfico con registro GPS de auditoría
  if (employee.workMode === "itinerante") {
    return {
      aprobado: true,
      kind: "remoto",
      mensaje: "Marcación registrada en Modo Itinerante / Viajero (Bypass geográfico autorizado)."
    };
  }

  // 2. Si es Virtual / Remoto (Lima, Talara, Cusco): Válido sin geocerca física
  if (employee.workMode === "virtual") {
    return {
      aprobado: true,
      kind: "remoto",
      mensaje: "Marcación remota aprobada correctamente."
    };
  }

  // 3. Si es Campo (Galponeros): Permite registro flexible / offline en zonas de Madre de Dios
  if (employee.workMode === "campo") {
    return {
      aprobado: true,
      kind: "presente",
      mensaje: "Marcación de campo / galpón registrada (Sincronización local)."
    };
  }

  // 4. Si es Presencial o Híbrido: Valida estrictamente la geocerca de la oficina central
  if (!ubicacionActual) {
    return {
      aprobado: false,
      kind: "falta",
      mensaje: "Se requiere activar el GPS de tu dispositivo para validar tu ubicación en oficina central."
    };
  }

  const distancia = Math.round(
    calcularDistanciaMetros(ubicacionActual.lat, ubicacionActual.lon, OFICINA_CENTRAL.lat, OFICINA_CENTRAL.lon)
  );

  if (distancia <= RADIO_TOLERANCIA_METROS) {
    return {
      aprobado: true,
      kind: "presente",
      mensaje: `Asistencia presencial validada con éxito (A ${distancia}m de la oficina central).`,
      distanciaMetros: distancia
    };
  } else {
    return {
      aprobado: false,
      kind: "falta",
      mensaje: `Fuera de rango geográfico. Estás a ${distancia}m de la oficina central (Radio permitido: ${RADIO_TOLERANCIA_METROS}m).`,
      distanciaMetros: distancia
    };
  }
}