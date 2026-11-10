import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, fieldClass, Modal } from "@/components/ui";
import { HOY, pen, shortDate } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import {
  followingChargeDate,
  lastDayOfMonth,
  prorateFirstCharge,
  subscriptionAlert,
  subscriptionOf,
} from "@/lib/hr/subscription";
import type { Company } from "@/lib/hr/types";

const LEVEL_BADGE = { ok: "moss", warn: "line", danger: "clay" } as const;

/**
 * Panel de suscripciones (solo superadmin). Muestra cada empresa con su plan
 * mensual, la alerta de vencimiento y el prorrateo del primer cobro. Los montos
 * y las fechas son editables aquí; el cálculo lo hace la app.
 */
export function SubscriptionPanel() {
  const viewerMode = useHr((s) => s.viewer.mode);
  const companies = useHr((s) => s.companies);
  const [open, setOpen] = useState(false);

  if (viewerMode !== "superadmin") return null;

  const alerts = companies.map((c) => subscriptionAlert(subscriptionOf(c), HOY));
  const overdue = alerts.filter((a) => a.level === "danger").length;
  const soon = alerts.filter((a) => a.level === "warn" && a.daysLeft >= 0).length;

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Suscripciones</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Plan mensual de cada empresa, fecha de cobro y vencimiento. La app calcula el prorrateo del
            primer mes y avisa cuando toca cobrar. Solo el desarrollador ve y edita esta sección.
          </p>
        </div>
        <Button tone="line" onClick={() => setOpen((v) => !v)}>
          {open ? "Ocultar" : "Administrar"}
        </Button>
      </div>

      {overdue > 0 || soon > 0 ? (
        <p className="mt-3 text-sm">
          {overdue > 0 ? <Badge tone="clay">{overdue} vencida{overdue === 1 ? "" : "s"}</Badge> : null}{" "}
          {soon > 0 ? <Badge tone="line">{soon} por vencer</Badge> : null}
        </p>
      ) : null}

      {open ? (
        <div className="mt-4 space-y-4">
          {companies.map((c) => (
            <CompanySubscription key={c.id} company={c} canRemove={companies.length > 1} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CompanySubscription({ company, canRemove }: { company: Company; canRemove: boolean }) {
  const updateCompanySubscription = useHr((s) => s.updateCompanySubscription);
  const removeCompany = useHr((s) => s.removeCompany);
  const sub = subscriptionOf(company);
  const alert = subscriptionAlert(sub, HOY);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const setNum = (key: "monthlyPrice", raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) updateCompanySubscription(company.id, { [key]: Math.max(0, n) });
  };
  const setBillingDay = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      updateCompanySubscription(company.id, { billingDay: null });
      return;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n)) updateCompanySubscription(company.id, { billingDay: Math.min(31, Math.max(1, Math.round(n))) });
  };

  const proration = sub.startDate ? prorateFirstCharge(sub.monthlyPrice, sub.startDate, sub.billingDay) : null;
  const nextCharge = sub.paidUntil ?? sub.startDate;

  return (
    <article className="rounded-lg border border-line bg-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-ink">{company.shortName}</h3>
          <Badge tone={sub.status === "cancelada" ? "line" : "moss"}>
            {sub.status === "cancelada" ? "Cancelada" : "Activa"}
          </Badge>
        </div>
        <Badge tone={LEVEL_BADGE[alert.level]}>{alert.title}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted">{alert.detail}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Precio mensual (S/)">
          <input
            className={fieldClass}
            inputMode="decimal"
            value={String(sub.monthlyPrice)}
            onChange={(e) => setNum("monthlyPrice", e.target.value)}
          />
        </Field>
        <Field label="Día de cobro" hint="Vacío = último día del mes.">
          <input
            className={fieldClass}
            inputMode="numeric"
            placeholder="Último día"
            value={sub.billingDay == null ? "" : String(sub.billingDay)}
            onChange={(e) => setBillingDay(e.target.value)}
          />
        </Field>
        <Field label="Fecha de alta">
          <input
            className={fieldClass}
            type="date"
            value={sub.startDate ?? ""}
            onChange={(e) => updateCompanySubscription(company.id, { startDate: e.target.value || null })}
          />
        </Field>
        <Field label="Pagado hasta (vence)">
          <input
            className={fieldClass}
            type="date"
            value={sub.paidUntil ?? ""}
            onChange={(e) => updateCompanySubscription(company.id, { paidUntil: e.target.value || null })}
          />
        </Field>
      </div>

      <div className="mt-3 rounded-md border border-line bg-surface p-3 text-sm">
        {proration ? (
          <p>
            Primer cobro:{" "}
            <span className="num font-medium">{pen(proration.amount)}</span>{" "}
            {proration.prorated ? (
              <>
                (prorrateado por {proration.daysCharged} de {proration.daysInMonth} días, hasta el{" "}
                {shortDate(proration.chargeDate)})
              </>
            ) : (
              <>por el mes completo (hasta el {shortDate(proration.chargeDate)})</>
            )}
            . Luego, <span className="num font-medium">{pen(proration.monthly)}</span> cada mes
            {sub.billingDay == null ? " el último día del mes" : ` el día ${sub.billingDay}`}.
          </p>
        ) : (
          <p className="text-muted">Define la fecha de alta para calcular el primer cobro prorrateado.</p>
        )}
        {nextCharge ? (
          <p className="mt-1 text-muted">
            Vence el {shortDate(nextCharge)}.{" "}
            {sub.billingDay == null ? `(corte: ${shortDate(lastDayOfMonth(nextCharge))})` : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          tone="moss"
          disabled={sub.status === "cancelada"}
          onClick={() => {
            const base = sub.paidUntil ?? sub.startDate ?? HOY;
            const next = followingChargeDate(base, sub.billingDay);
            updateCompanySubscription(company.id, { paidUntil: next });
            toast.success(`Cobro registrado. Vence el ${shortDate(next)}.`);
          }}
        >
          Registrar cobro del mes
        </Button>
        <Button
          tone="line"
          onClick={() =>
            updateCompanySubscription(company.id, {
              status: sub.status === "cancelada" ? "activa" : "cancelada",
            })
          }
        >
          {sub.status === "cancelada" ? "Reactivar suscripción" : "Cancelar suscripción"}
        </Button>
        {canRemove ? (
          <Button tone="danger" onClick={() => setConfirmRemove(true)}>
            Eliminar empresa
          </Button>
        ) : null}
      </div>

      <Modal
        open={confirmRemove}
        title={`Eliminar ${company.shortName}`}
        onClose={() => setConfirmRemove(false)}
      >
        <p className="text-sm">
          Se elimina <strong>{company.name}</strong> con sus colaboradores, solicitudes, asistencias y documentos.
          También se borran las cuentas de acceso de esa empresa (nadie podrá iniciar sesión con ellas).
          Esta acción no se puede deshacer.
        </p>
        <p className="mt-3 text-sm text-muted">
          Si solo quieres dejar de cobrarla pero conservar los datos, usa <strong>Cancelar suscripción</strong>.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => setConfirmRemove(false)}>
            Cancelar
          </Button>
          <Button
            tone="danger"
            onClick={() => {
              removeCompany(company.id);
              setConfirmRemove(false);
              toast.success(`${company.shortName} eliminada`);
            }}
          >
            Sí, eliminar
          </Button>
        </div>
      </Modal>
    </article>
  );
}
