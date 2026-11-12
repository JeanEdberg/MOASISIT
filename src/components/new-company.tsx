import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, fieldClass, Modal } from "@/components/ui";
import { readAttachmentFile } from "@/lib/hr/attachment";
import type { NewCompanyInput } from "@/lib/hr/company";
import { COMPANY_REGIME_LABEL } from "@/lib/hr/format";
import { COMPANY_REGIMES, requiresMypeAccreditation } from "@/lib/hr/regime";
import { isValidRuc, normalizeRuc, rucStatusLabel, isRucOperativo, type RucInfo } from "@/lib/hr/ruc";
import { useHr } from "@/lib/hr/store";
import type { CompanyRegime } from "@/lib/hr/types";

const EMPTY: NewCompanyInput = {
  ruc: "",
  name: "",
  shortName: "",
  tradeName: "",
  city: "",
  address: "",
  email: "",
  phone: "",
  regime: "general",
  mypeAccreditationDate: "",
  adminEmail: "",
};

/**
 * Alta de empresa (superadmin). El RUC consulta SUNAT y rellena razón social,
 * dirección y estado; el resto se completa a mano. Al guardar, la empresa queda
 * disponible en el selector superior.
 */
export function NewCompanyButton() {
  const createCompany = useHr((s) => s.createCompany);
  const lookupRuc = useHr((s) => s.lookupRuc);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewCompanyInput>(EMPTY);
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [found, setFound] = useState<RucInfo | null>(null);
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null);

  const set = (patch: Partial<NewCompanyInput>) => setForm((f) => ({ ...f, ...patch }));

  const reset = () => {
    setForm(EMPTY);
    setFound(null);
    setCredentials(null);
  };

  const onLookup = async () => {
    const ruc = normalizeRuc(form.ruc);
    if (!isValidRuc(ruc)) {
      toast.error("Escribe un RUC válido de 11 dígitos.");
      return;
    }
    setLooking(true);
    const res = await lookupRuc(ruc);
    setLooking(false);
    if (!res.ok) {
      setFound(null);
      toast.error(res.error);
      return;
    }
    setFound(res.info);
    set({
      ruc: res.info.ruc,
      name: form.name.trim() ? form.name : res.info.razonSocial,
      tradeName: form.tradeName.trim() ? form.tradeName : res.info.razonSocial,
      address: res.info.direccion || form.address,
      city: form.city.trim() ? form.city : res.info.provincia || res.info.distrito,
    });
    toast.success(isRucOperativo(res.info) ? "RUC encontrado y habilitado" : "RUC encontrado (revisa su estado)");
  };

  const onSave = async () => {
    setSaving(true);
    const res = await createCompany(form);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "No se pudo crear la empresa.");
      return;
    }
    if (res.adminLogin && res.adminPassword) {
      setCredentials({ login: res.adminLogin, password: res.adminPassword });
      toast.success("Empresa creada. Copia la contraseña temporal.");
    } else {
      toast.success("Empresa creada");
      setOpen(false);
      reset();
    }
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        Nueva empresa
      </Button>

      <Modal open={open} title="Nueva empresa" onClose={close} wide>
        {credentials ? (
          <div className="space-y-3">
            <p className="text-sm">
              La empresa se creó y su usuario RR.HH. quedó listo. Entrega estas credenciales <strong>en privado</strong>:
              no se vuelven a mostrar.
            </p>
            <div className="rounded-md border border-line bg-bg p-3 text-sm">
              <div>
                <span className="text-muted">Usuario:</span> <code>{credentials.login}</code>
              </div>
              <div className="mt-1">
                <span className="text-muted">Contraseña temporal:</span> <code>{credentials.password}</code>
              </div>
            </div>
            <p className="text-xs text-muted">Al primer ingreso, el sistema le pedirá cambiarla.</p>
            <div className="flex justify-end">
              <Button onClick={close}>Entendido</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="RUC" hint="Consulta SUNAT y completa los datos. Luego puedes ajustarlos.">
              <div className="flex gap-2">
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="20xxxxxxxxx"
                  value={form.ruc}
                  onChange={(e) => set({ ruc: normalizeRuc(e.target.value) })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onLookup();
                  }}
                />
                <Button tone="line" onClick={onLookup} disabled={looking}>
                  {looking ? "Consultando…" : "Consultar"}
                </Button>
              </div>
            </Field>

            {found ? (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-bg p-3 text-sm">
                <Badge tone={isRucOperativo(found) ? "moss" : "clay"}>{rucStatusLabel(found) || "SIN ESTADO"}</Badge>
                <span className="text-muted">
                  {[found.distrito, found.provincia, found.departamento].filter(Boolean).join(" / ") || "Sin ubicación"}
                </span>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Razón social">
                <input className={fieldClass} value={form.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="Nombre corto" hint="Se usa en el saludo y el menú, ej. INMOA.">
                <input
                  className={fieldClass}
                  maxLength={24}
                  value={form.shortName}
                  onChange={(e) => set({ shortName: e.target.value })}
                />
              </Field>
              <Field label="Nombre comercial">
                <input className={fieldClass} value={form.tradeName} onChange={(e) => set({ tradeName: e.target.value })} />
              </Field>
              <Field label="Ciudad">
                <input className={fieldClass} value={form.city} onChange={(e) => set({ city: e.target.value })} />
              </Field>
              <Field label="Dirección fiscal">
                <input className={fieldClass} value={form.address} onChange={(e) => set({ address: e.target.value })} />
              </Field>
              <Field label="Correo de personas">
                <input className={fieldClass} value={form.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <input className={fieldClass} value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
              <Field label="Correo del usuario RR.HH." hint="Opcional: crea su acceso con contraseña temporal.">
                <input
                  className={fieldClass}
                  value={form.adminEmail}
                  onChange={(e) => set({ adminEmail: e.target.value })}
                />
              </Field>
            </div>

            <div className="rounded-md border border-line bg-bg p-3">
              <h4 className="text-sm font-semibold text-ink">Régimen laboral</h4>
              <p className="mt-0.5 text-xs text-muted">
                SUNAT no informa el régimen laboral; se elige aquí. Los colaboradores lo heredan al registrarse.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Régimen de la empresa">
                  <select
                    className={fieldClass}
                    value={form.regime ?? "general"}
                    onChange={(e) => set({ regime: e.target.value as CompanyRegime })}
                  >
                    {COMPANY_REGIMES.map((r) => (
                      <option key={r} value={r}>
                        {COMPANY_REGIME_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {requiresMypeAccreditation((form.regime ?? "general") as CompanyRegime) ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Fecha de la constancia de acreditación REMYPE">
                    <input
                      className={fieldClass}
                      type="date"
                      value={form.mypeAccreditationDate ?? ""}
                      onChange={(e) => set({ mypeAccreditationDate: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Constancia de acreditación REMYPE"
                    hint="PDF o foto de la constancia. También puedes cargarla luego en Empresa."
                  >
                    <input
                      className={fieldClass}
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const res = await readAttachmentFile(file);
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        set({ mypeAccreditationFile: res.dataUrl });
                        toast.success("Constancia adjuntada");
                      }}
                    />
                  </Field>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <Button tone="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button onClick={onSave} disabled={saving || !form.name.trim() || !form.shortName.trim()}>
                {saving ? "Creando…" : "Crear empresa"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
