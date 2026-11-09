import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { ConsolidadoAsistenciaView } from "@/lib/hr/ConsolidadoAsistenciaView";

export const Route = createFileRoute("/consolidado-asistencia")({
  component: ConsolidadoAsistenciaPage,
});

function ConsolidadoAsistenciaPage() {
  return (
    <Shell>
      <PageHeader
        kicker="Reportes Gerenciales"
        title="Consolidado de Asistencia y Tardanzas"
        lede="Resumen mensual de asistencia, tardanzas y horas extra de todo el personal para el cálculo de haberes."
      />
      
      <div className="mt-6">
        <ConsolidadoAsistenciaView />
      </div>
    </Shell>
  );
}