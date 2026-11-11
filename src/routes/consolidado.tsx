import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ConsolidadoMasivoView } from "@/lib/hr/ConsolidadoMasivoView";

export const Route = createFileRoute("/consolidado")({
  component: ConsolidadoPageRoute,
});

function ConsolidadoPageRoute() {
  return (
    <Shell>
      <ConsolidadoMasivoView />
    </Shell>
  );
}
