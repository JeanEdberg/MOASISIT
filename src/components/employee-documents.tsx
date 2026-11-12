import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { isCompanyAdmin, visibleAttachmentKinds } from "@/lib/hr/access";
import { ATTACHMENT_LABEL, isPdfDataUrl, missingAttachments, readAttachmentFile } from "@/lib/hr/attachment";
import { CESSATION_REASONS, ceaseEmployee, cessationsOf, rehireEmployee } from "@/lib/hr/cessation";
import { todayIso, pen, periodLabel, currentPeriod, shortDate } from "@/lib/hr/format";
import { liquidationOf } from "@/lib/hr/liquidacion";
import { addPayslipFile, isValidPeriod, payslipFilesOf, removePayslipFile } from "@/lib/hr/payslip-files";
import type { AttachmentKind, Company, Employee, TimeRequest, Viewer } from "@/lib/hr/types";

/**
 * Documentos del colaborador: T-Registro de alta/baja, contrato firmado y
 * liquidación. RR.HH. ve y edita el legajo completo; cada persona ve, de sí
 * misma, su T-Registro de alta y su contrato (solo lectura, con descarga). El
 * cese y la liquidación quedan reservados a RR.HH.
 */

const ADMIN_ORDER: AttachmentKind[] = ["tRegistroAlta", "contrato", "tRegistroBaja", "liquidacion"];

function FileRow({
  kind,
  emp,
  editable,
  onChange,
}: {
  kind: AttachmentKind;
  emp: Employee;
  editable: boolean;
  onChange: (kind: AttachmentKind, value: { name: string; dataUrl: string; date: string } | undefined) => void;
}) {
  const current = emp.attachments?.[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const res = await readAttachmentFile(file);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onChange(kind, { name: file.name, dataUrl: res.dataUrl, date: todayIso() });
    toast.success(`${ATTACHMENT_LABEL[kind]} adjuntado`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-bg p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{ATTACHMENT_LABEL[kind]}</p>
        <p className="truncate text-xs text-muted">
          {current ? `${current.name} · ${shortDate(current.date)}` : "Sin cargar"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {current ? (
          <>
            <a
              className="min-h-9 inline-flex items-center rounded-md border border-line bg-surface px-3 text-sm font-medium"
              href={current.dataUrl}
              target="_blank"
              rel="noreferrer"
            >
              {isPdfDataUrl(current.dataUrl) ? "Ver PDF" : "Ver"}
            </a>
            <a
              className="min-h-9 inline-flex items-center rounded-md border border-line bg-surface px-3 text-sm font-medium"
              href={current.dataUrl}
              download={current.name}
            >
              Descargar
            </a>
          </>
        ) : null}
        {editable ? (
          <>
            <Button tone="line" disabled={busy} onClick={() => inputRef.current?.click()}>
              {current ? "Reemplazar" : "Subir"}
            </Button>
            {current ? (
              <Button tone="ghost" onClick={() => onChange(kind, undefined)}>
                Quitar
              </Button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void pick(file);
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function EmployeeDocuments({
  emp,
  company,
  requests,
  viewer,
  editable,
  onPatch,
}: {
  emp: Employee;
  company: Company;
  requests: TimeRequest[];
  viewer: Viewer;
  editable: boolean;
  onPatch: (patch: Partial<Employee>) => void;
}) {
  const [reason, setReason] = useState<string>(CESSATION_REASONS[0]);
  const [rehireDate, setRehireDate] = useState<string>(todayIso());
  const admin = isCompanyAdmin(viewer.mode);
  const isSelf = viewer.employeeId === emp.id;
  const allowed = visibleAttachmentKinds(viewer, emp);
  const order = admin ? ADMIN_ORDER : ADMIN_ORDER.filter((k) => allowed.includes(k));
  const missing = admin ? missingAttachments(emp) : [];
  const cessations = cessationsOf(emp);
  const showLiquidation = admin && emp.status === "cesado";
  const liquidation = showLiquidation ? liquidationOf(emp, company, requests) : null;

  const setAttachment = (kind: AttachmentKind, value: { name: string; dataUrl: string; date: string } | undefined) => {
    const next = { ...(emp.attachments ?? {}) };
    if (value) next[kind] = value;
    else delete next[kind];
    onPatch({ attachments: next });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">{isSelf && !admin ? "Mis documentos" : "Documentos"}</h2>
        <p className="mt-1 text-sm text-muted">
          {admin
            ? "Adjunta el T-Registro de alta (SUNAT), el contrato firmado y, al cese, el T-Registro de baja y la liquidación."
            : "Tu T-Registro de alta y tu contrato. Puedes verlos o descargarlos cuando los necesites. Tus boletas están en “Mi boleta”."}
        </p>
        {admin && missing.length > 0 ? (
          <p className="mt-3 rounded-md border border-clay/40 bg-clay/5 p-3 text-sm text-clay">
            Documentación pendiente: {missing.map((k) => ATTACHMENT_LABEL[k]).join(", ")}.
          </p>
        ) : null}
        {admin && missing.length === 0 ? (
          <p className="mt-3 rounded-md border border-moss/40 bg-moss/5 p-3 text-sm text-moss">
            Documentación completa.
          </p>
        ) : null}
        <div className="mt-3 space-y-2">
          {order.map((kind) => (
            <FileRow key={kind} kind={kind} emp={emp} editable={editable} onChange={setAttachment} />
          ))}
        </div>
      </section>

      {admin || isSelf ? <PayslipFilesSection emp={emp} editable={editable} onPatch={onPatch} /> : null}

      {admin ? (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-2xl">Cese y reincorporación</h2>
          <p className="mt-1 text-sm text-muted">
            Al cesar, se bloquea su acceso y el cese queda en el histórico. Al reincorporar, se abre un periodo nuevo sin
            borrar el anterior.
          </p>

          {cessations.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {cessations.map((c, i) => (
                <li key={`${c.endDate}-${i}`} className="flex flex-wrap justify-between gap-2 rounded-md border border-line bg-bg p-2">
                  <span>
                    Cese {shortDate(c.endDate)} · {c.reason}
                  </span>
                  <span className="text-muted">Registrado {shortDate(c.registeredAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Sin ceses registrados.</p>
          )}

          {editable ? (
            emp.status === "activo" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-muted">
                  Motivo del cese
                  <select
                    className="mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {CESSATION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <Button
                    tone="danger"
                    onClick={() => {
                      if (!confirm(`¿Registrar el cese de ${emp.names} ${emp.paternal}? Se bloqueará su acceso.`)) return;
                      onPatch(ceaseEmployee(emp, { reason }));
                      toast.success("Cese registrado. El acceso quedó bloqueado.");
                    }}
                  >
                    Registrar cese
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-muted">
                  Nueva fecha de ingreso
                  <input
                    className="mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 text-sm"
                    type="date"
                    value={rehireDate}
                    onChange={(e) => setRehireDate(e.target.value)}
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    tone="primary"
                    onClick={() => {
                      onPatch(rehireEmployee(emp, { hireDate: rehireDate }));
                      toast.success("Colaborador reincorporado. Se abrió un periodo nuevo.");
                    }}
                  >
                    Reincorporar
                  </Button>
                </div>
              </div>
            )
          ) : null}
        </section>
      ) : null}

      {liquidation ? (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-2xl">Liquidación de beneficios</h2>
          <p className="mt-1 text-sm text-muted">
            Cálculo referencial al cese del {shortDate(liquidation.asOf)}: CTS trunca, gratificación trunca con su
            bonificación, y vacaciones truncas y no gozadas. La asesoría laboral valida el monto antes del pago.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {liquidation.items.map((it) => (
              <li
                key={it.code}
                className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-line bg-bg p-2"
              >
                <span>
                  <span className="font-medium text-ink">{it.label}</span>
                  <span className="block text-xs text-muted">{it.detail}</span>
                </span>
                <span className="font-medium text-ink">{pen(it.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="font-medium text-ink">Total a liquidar</span>
            <span className="text-lg font-semibold text-ink">{pen(liquidation.total)}</span>
          </div>
          {liquidation.reference.length > 0 ? (
            <div className="mt-4 rounded-md border border-line bg-bg p-3">
              <p className="text-xs font-medium text-muted">Referencia informativa (no se suma a la liquidación)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {liquidation.reference.map((it) => (
                  <li key={it.code} className="flex flex-wrap items-start justify-between gap-2">
                    <span className="text-muted">
                      {it.label} · <span className="text-xs">{it.detail}</span>
                    </span>
                    <span className="text-muted">{pen(it.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/**
 * Boletas anteriores cargadas por RR.HH. Permite subir el PDF o la imagen de
 * cada mes (uno por periodo), verlas, descargarlas y quitarlas. Sirve para
 * conservar el histórico de meses trabajados antes de usar la app.
 */
function PayslipFilesSection({
  emp,
  editable,
  onPatch,
}: {
  emp: Employee;
  editable: boolean;
  onPatch: (patch: Partial<Employee>) => void;
}) {
  const files = payslipFilesOf(emp);
  const inputRef = useRef<HTMLInputElement>(null);
  const [period, setPeriod] = useState(currentPeriod());
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!isValidPeriod(period)) {
      toast.error("Elige un mes válido (formato AAAA-MM).");
      return;
    }
    setBusy(true);
    const res = await readAttachmentFile(file);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onPatch({ payslipFiles: addPayslipFile(emp.payslipFiles, { period, name: file.name, dataUrl: res.dataUrl }) });
    toast.success(`Boleta de ${periodLabel(period)} guardada`);
  };

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <h2 className="text-2xl">Boletas anteriores</h2>
      <p className="mt-1 text-sm text-muted">
        Sube el PDF o la foto de la boleta de un mes anterior (por ejemplo, de antes de usar la app). Se guarda una por
        mes: si subes otra del mismo mes, reemplaza a la anterior.
      </p>

      {editable ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block text-xs text-muted">
            Mes de la boleta
            <input
              className="mt-1 min-h-11 rounded-md border border-line bg-bg px-3 text-sm"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <Button tone="line" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Leyendo…" : "Subir boleta"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              void pick(file);
            }}
          />
        </div>
      ) : null}

      <ul className="mt-3 space-y-2">
        {files.length === 0 ? <li className="text-sm text-muted">Sin boletas subidas.</li> : null}
        {files.map((f) => (
          <li
            key={f.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-bg p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{periodLabel(f.period)}</p>
              <p className="truncate text-xs text-muted">
                {f.name} · subida {shortDate(f.uploadedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                className="min-h-9 inline-flex items-center rounded-md border border-line bg-surface px-3 text-sm font-medium"
                href={f.dataUrl}
                target="_blank"
                rel="noreferrer"
              >
                {isPdfDataUrl(f.dataUrl) ? "Ver PDF" : "Ver"}
              </a>
              <a
                className="min-h-9 inline-flex items-center rounded-md border border-line bg-surface px-3 text-sm font-medium"
                href={f.dataUrl}
                download={f.name}
              >
                Descargar
              </a>
              {editable ? (
                <Button
                  tone="ghost"
                  onClick={() => {
                    onPatch({ payslipFiles: removePayslipFile(emp.payslipFiles, { id: f.id }) });
                    toast.success("Boleta quitada");
                  }}
                >
                  Quitar
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

