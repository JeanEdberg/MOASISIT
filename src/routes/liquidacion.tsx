import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { LiquidationCalculator } from "@/components/liquidation-calculator";

export const Route = createFileRoute("/liquidacion")({ component: LiquidacionPage });

function LiquidacionPage() {
  return (
    <Shell>
      <LiquidationCalculator />
    </Shell>
  );
}
