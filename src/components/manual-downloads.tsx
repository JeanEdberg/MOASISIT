import { Download } from "lucide-react";
import { useHr } from "@/lib/hr/store";

/** Los PDF viven en public/manuales/ y se sirven como archivos estáticos. */
const MANUALES: { file: string; title: string; detail: string }[] = [
  {
    file: "manual-superadmin",
    title: "Manual del desarrollador",
    detail: "Para el dueño del sistema: empresas, suscripciones y puesta en marcha.",
  },
  {
    file: "manual-rrhh",
    title: "Manual de Recursos Humanos",
    detail: "Personas, planilla, consolidados y documentos.",
  },
  {
    file: "manual-jefatura",
    title: "Manual de Jefatura",
    detail: "Equipo, aprobación de vacaciones y asistencia.",
  },
  {
    file: "manual-colaborador",
    title: "Manual del colaborador",
    detail: "Fichaje, vacaciones y boleta de pago.",
  },
  {
    file: "checklist-configuracion",
    title: "Checklist de puesta en marcha",
    detail: "Una hoja con los pasos previos al uso diario.",
  },
];

/**
 * Botones de descarga de los manuales en PDF. Solo los ve el superadmin
 * (el desarrollador), que es quien reparte los manuales a cada rol.
 */
export function ManualDownloads() {
  const viewerMode = useHr((s) => s.viewer.mode);
  if (viewerMode !== "superadmin") return null;

  return (
    <section className="mt-4 rounded-lg border border-line bg-surface p-4">
      <h2 className="text-xl text-ink">Manuales en PDF</h2>
      <p className="mt-1 text-sm text-muted">
        Descarga el manual que le corresponde a cada persona y el checklist de puesta en marcha.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {MANUALES.map((m) => (
          <div
            key={m.file}
            className="flex flex-col justify-between gap-3 rounded-md border border-line bg-bg p-3"
          >
            <div>
              <p className="text-sm font-medium text-ink">{m.title}</p>
              <p className="mt-1 text-xs text-muted">{m.detail}</p>
            </div>
            <a
              href={`/manuales/${m.file}.pdf`}
              download
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <Download className="size-4" aria-hidden />
              Descargar PDF
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
