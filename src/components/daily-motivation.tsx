import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui";
import { useHr } from "@/lib/hr/store";
import { dailyVerse } from "@/lib/hr/verses";

/**
 * Versículo bíblico del día. Se elige de forma determinista según la persona y
 * la fecha, así que no cambia entre recargas y cada quien ve uno distinto.
 */
export function DailyMotivation({ className, seed }: { className?: string; seed?: string }) {
  const viewer = useHr((s) => s.viewer);
  const verse = dailyVerse(seed ?? viewer.employeeId ?? viewer.mode);
  return (
    <Card className={`border-clay/30 bg-clay/5 p-4 ${className ?? ""}`} as="div">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-clay/10 text-clay" aria-hidden>
          <BookOpen className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-clay">Versículo del día</p>
          <p className="mt-0.5 text-sm font-medium italic text-ink">“{verse.text}”</p>
          <p className="mt-1 text-xs text-muted">{verse.ref}</p>
        </div>
      </div>
    </Card>
  );
}
