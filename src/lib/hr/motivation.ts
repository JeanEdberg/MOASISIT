import { todayIso } from "@/lib/hr/format";

/**
 * Frases cortas para saludar la jornada. Se elige una por día de forma
 * determinista (mismo mensaje para toda la empresa ese día), así no cambia
 * entre recargas ni depende del azar.
 */
const MESSAGES = [
  "Tu puntualidad de hoy construye la confianza de mañana.",
  "Cada marcación a tiempo es un compromiso cumplido.",
  "Hoy es una buena oportunidad para dar lo mejor de ti.",
  "El orden en tus horarios también ordena tus resultados.",
  "Un día bien empezado rinde el doble. ¡Buen trabajo!",
  "La constancia, día a día, es lo que te hace imparable.",
  "Gracias por llegar con energía. Tu equipo lo nota.",
  "Los grandes logros empiezan marcando el primer minuto.",
  "Tu esfuerzo diario es la base de los buenos resultados.",
  "Empezar a tiempo es la primera victoria del día.",
  "Hazlo con ganas y el día te responderá con creces.",
  "La disciplina de hoy es tu tranquilidad de mañana.",
  "Recuerda: pequeños hábitos, grandes resultados.",
  "Hoy cuenta. Empieza con actitud y termina con orgullo.",
  "Tu compromiso inspira a quienes trabajan contigo.",
  "Un buen día se construye minuto a minuto.",
  "Llegar puntual es respetar tu tiempo y el de los demás.",
  "Confía en tu proceso: vas por buen camino.",
  "Dale a este día tu mejor versión.",
  "Cada jornada es una nueva página. ¡Escríbela bien!",
  "La energía que pones hoy se nota en los resultados.",
  "Ser puntual y constante es un hábito que se nota.",
];

/** Índice del día dentro del año (0 = 1 de enero), en hora local. */
function dayOfYear(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const start = new Date(y, 0, 1);
  const current = new Date(y, (m ?? 1) - 1, d ?? 1);
  return Math.round((current.getTime() - start.getTime()) / 86_400_000);
}

/** Mensaje motivacional del día (mismo para toda la empresa). */
export function dailyMessage(date: string = todayIso()): string {
  const idx = ((dayOfYear(date) % MESSAGES.length) + MESSAGES.length) % MESSAGES.length;
  return MESSAGES[idx]!;
}
