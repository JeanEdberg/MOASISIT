import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui";
import { dailyMessage } from "@/lib/hr/motivation";

/**
 * Saludo motivacional del día. Mismo texto para toda la empresa ese día, así no
 * cambia entre recargas ni depende del azar.
 */
export function DailyMotivation({ className }: { className?: string }) {
  return (
    <Card className={`border-clay/30 bg-clay/5 p-4 ${className ?? ""}`} as="div">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-clay/10 text-clay" aria-hidden>
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-clay">Mensaje del día</p>
          <p className="text-sm font-medium text-ink">{dailyMessage()}</p>
        </div>
      </div>
    </Card>
  );
}
