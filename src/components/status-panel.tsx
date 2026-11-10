import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { useHr } from "@/lib/hr/store";
import { overallLevel, pendingCount, type StatusCheck, type StatusLevel } from "@/lib/hr/status";

const LEVEL_LABEL: Record<StatusLevel, string> = {
  ok: "Listo",
  warn: "Revisar",
  danger: "Importante",
};

const LEVEL_BADGE: Record<StatusLevel, "moss" | "line" | "clay"> = {
  ok: "moss",
  warn: "line",
  danger: "clay",
};

const LEVEL_DOT: Record<StatusLevel, string> = {
  ok: "bg-moss",
  warn: "bg-clay",
  danger: "bg-ink",
};

/**
 * Panel "Puesta en marcha" (superadmin). Reúne el estado de configuración en
 * palabras simples: qué está listo, qué falta y por qué importa. No muestra
 * ningún valor secreto, solo si está definido.
 */
export function StatusPanel() {
  const viewerMode = useHr((s) => s.viewer.mode);
  const getSystemStatus = useHr((s) => s.getSystemStatus);
  const [checks, setChecks] = useState<StatusCheck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setError(null);
    const res = await getSystemStatus();
    if (res.ok && res.checks) setChecks(res.checks);
    else setError(res.error ?? "No se pudo leer el estado.");
  };

  useEffect(() => {
    if (viewerMode === "superadmin") void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerMode]);

  if (viewerMode !== "superadmin") return null;

  const level = checks ? overallLevel(checks) : "warn";
  const pending = checks ? pendingCount(checks) : 0;

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${LEVEL_DOT[level]}`} aria-hidden />
          <div>
            <h2 className="text-xl text-ink">Puesta en marcha</h2>
            <p className="mt-1 text-sm text-muted">
              {checks === null
                ? "Revisando la configuración…"
                : pending === 0
                  ? "Todo configurado: la app está lista para usarse con datos reales."
                  : `Hay ${pending} ${pending === 1 ? "punto" : "puntos"} por revisar antes del uso diario.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={LEVEL_BADGE[level]}>{LEVEL_LABEL[level]}</Badge>
          <Button tone="line" onClick={() => setOpen((v) => !v)}>
            {open ? "Ocultar detalle" : "Ver detalle"}
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}

      {open && checks ? (
        <ul className="mt-4 space-y-3">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-md border border-line bg-surface-2 p-3">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${LEVEL_DOT[c.level]}`} aria-hidden />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{c.title}</p>
                  <Badge tone={LEVEL_BADGE[c.level]}>{LEVEL_LABEL[c.level]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{c.detail}</p>
                {c.fix ? <p className="mt-1 text-sm text-clay">Cómo resolverlo: {c.fix}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
