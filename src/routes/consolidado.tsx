import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ConsolidadoMasivoView } from "@/lib/hr/ConsolidadoMasivoView";

export const Route = createFileRoute("/consolidado")({
  component: ConsolidadoPageRoute,
});

function ConsolidadoPageRoute() {
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Módulo Consolidado Masivo</h1>
          <p className="text-sm text-slate-500">
            Cálculo automatizado y simultáneo de CTS y Gratificaciones legales para todo el personal de la empresa bajo normativa peruana.
          </p>
        </div>
        <ConsolidadoMasivoView />
      </div>
    </Shell>
  );
}
