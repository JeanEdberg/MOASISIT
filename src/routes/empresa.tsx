import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { NewCompanyButton } from "@/components/new-company";
import { StatusPanel } from "@/components/status-panel";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass, Modal, PageHeader } from "@/components/ui";
import { INSURER_KIND_LABEL, uid } from "@/lib/hr/format";
import { fifthCategoryParamsOf } from "@/lib/hr/fifth";
import { readLogoFile } from "@/lib/hr/logo";
import { useHr } from "@/lib/hr/store";
import type { AfpFund, Company, FifthCategoryBand, Insurer, InsurerKind } from "@/lib/hr/types";

export const Route = createFileRoute("/empresa")({ component: CompanyPage });

const INSURER_KINDS: InsurerKind[] = ["eps", "sctr", "vida_ley"];

const FUNDS: { id: AfpFund; label: string }[] = [
  { id: "habitat", label: "AFP Habitat" },
  { id: "integra", label: "AFP Integra" },
  { id: "prima", label: "Prima AFP" },
  { id: "profuturo", label: "Profuturo" },
];

const PALETTES = [
  { name: "Arcilla", brand: "#c4512c", accent: "#1f4d40" },
  { name: "Océano", brand: "#0f4c81", accent: "#c4512c" },
  { name: "Bosque", brand: "#1f4d40", accent: "#a16207" },
  { name: "Noche", brand: "#1e1a16", accent: "#c4512c" },
  { name: "Cobalto", brand: "#243e73", accent: "#0f766e" },
];

function hexOr(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#c4512c";
}

function CompanyPage() {
  const company = useHr((s) => s.company);
  const viewerMode = useHr((s) => s.viewer.mode);
  const areas = useHr((s) => s.areas);
  const employees = useHr((s) => s.employees);
  const updateCompany = useHr((s) => s.updateCompany);
  const addArea = useHr((s) => s.addArea);
  const renameArea = useHr((s) => s.renameArea);
  const clearDemoPeople = useHr((s) => s.clearDemoPeople);
  const resetDemo = useHr((s) => s.resetDemo);
  const [areaName, setAreaName] = useState("");
  const [confirm, setConfirm] = useState<"clear" | "reset" | null>(null);

  const setNum = (key: keyof Company, raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) updateCompany({ [key]: n });
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const res = await readLogoFile(file);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    updateCompany({ logo: res.dataUrl });
    toast.success("Logo actualizado");
  };

  const insurers = company.insurers ?? [];
  const patchInsurer = (id: string, patch: Partial<Insurer>) =>
    updateCompany({ insurers: insurers.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const addInsurer = () =>
    updateCompany({
      insurers: [
        ...insurers,
        { id: uid("ins"), name: "Nueva aseguradora", kind: "eps", rate: 0, active: true },
      ],
    });
  const removeInsurer = (id: string) => updateCompany({ insurers: insurers.filter((i) => i.id !== id) });

  return (
    <Shell>
      <PageHeader
        kicker="Tu empresa"
        title="Configuración"
        lede="Cambia la razón social, el RUC y los parámetros de planilla. Los valores iniciales siguen la referencia 2026: RMV, UIT y comisiones AFP por flujo."
        actions={viewerMode === "superadmin" ? <NewCompanyButton /> : undefined}
      />

      <StatusPanel />

      <div className="mt-4">
        <SubscriptionPanel />
      </div>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">Identidad</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Razón social">
            <input className={fieldClass} value={company.name} onChange={(e) => updateCompany({ name: e.target.value })} />
          </Field>
          <Field label="Nombre comercial">
            <input className={fieldClass} value={company.tradeName} onChange={(e) => updateCompany({ tradeName: e.target.value })} />
          </Field>
          <Field label="RUC">
            <input className={fieldClass} value={company.ruc} onChange={(e) => updateCompany({ ruc: e.target.value })} />
          </Field>
          <Field label="Ciudad">
            <input className={fieldClass} value={company.city} onChange={(e) => updateCompany({ city: e.target.value })} />
          </Field>
          <Field label="Dirección">
            <input className={fieldClass} value={company.address} onChange={(e) => updateCompany({ address: e.target.value })} />
          </Field>
          <Field label="Correo de personas">
            <input className={fieldClass} value={company.email} onChange={(e) => updateCompany({ email: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">Marca y colores</h2>
        <p className="mt-1 text-sm text-muted">
          El nombre y los colores se ven en el menú, los botones y las boletas. El cambio queda guardado en este navegador.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              className="min-h-11 rounded-md border border-line bg-bg px-3 text-sm"
              onClick={() => updateCompany({ brandColor: p.brand, accentColor: p.accent })}
            >
              <span className="mr-2 inline-block size-3 rounded-sm" style={{ background: p.brand }} />
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Nombre del producto">
            <input
              className={fieldClass}
              value={company.brandName}
              maxLength={24}
              onChange={(e) => updateCompany({ brandName: e.target.value })}
            />
          </Field>
          <Field label="Nombre corto" hint="Se usa en el saludo de bienvenida, ej. INMOA.">
            <input
              className={fieldClass}
              value={company.shortName}
              maxLength={24}
              onChange={(e) => updateCompany({ shortName: e.target.value })}
            />
          </Field>
          <Field label="Inicial del isotipo" hint="Una o dos letras.">
            <input
              className={fieldClass}
              value={company.brandMark}
              maxLength={2}
              onChange={(e) => updateCompany({ brandMark: e.target.value })}
            />
          </Field>
          <Field label="Color principal">
            <input
              className="h-11 w-full cursor-pointer rounded-md border border-line bg-surface"
              type="color"
              value={hexOr(company.brandColor)}
              onChange={(e) => updateCompany({ brandColor: e.target.value })}
            />
          </Field>
          <Field label="Color de acento">
            <input
              className="h-11 w-full cursor-pointer rounded-md border border-line bg-surface"
              type="color"
              value={hexOr(company.accentColor)}
              onChange={(e) => updateCompany({ accentColor: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-sm font-medium">Logo de la empresa</p>
          <p className="mt-1 text-xs text-muted">
            Se muestra arriba a la izquierda en las boletas de pago, el consolidado y los contratos. PNG o JPG, horizontal y con fondo transparente o blanco.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="grid h-16 min-w-40 place-items-center rounded-md border border-dashed border-line bg-bg px-3">
              {company.logo ? (
                <img src={company.logo} alt={`Logo de ${company.name}`} className="max-h-14 w-auto object-contain" />
              ) : (
                <span className="text-xs text-muted">Sin logo</span>
              )}
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-line bg-surface px-3 text-sm font-medium">
              Subir logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onLogoChange}
              />
            </label>
            {company.logo ? (
              <Button tone="ghost" onClick={() => updateCompany({ logo: undefined })}>
                Quitar logo
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">Parámetros de planilla</h2>
        <p className="mt-1 text-sm text-muted">Ajusta estas tasas cuando cambie la norma. El cálculo es referencial y no presenta el PLAME.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="RMV (S/)">
            <input className={fieldClass} value={String(company.rmv)} onChange={(e) => setNum("rmv", e.target.value)} />
          </Field>
          <Field label="UIT (S/)">
            <input className={fieldClass} value={String(company.uit)} onChange={(e) => setNum("uit", e.target.value)} />
          </Field>
          <Field label="Tope AFP (S/)">
            <input className={fieldClass} value={String(company.topeAfp)} onChange={(e) => setNum("topeAfp", e.target.value)} />
          </Field>
          <Pct label="EsSalud %" value={company.essalud} onChange={(n) => updateCompany({ essalud: n })} />
          <Pct label="ONP %" value={company.onp} onChange={(n) => updateCompany({ onp: n })} />
          <Pct label="Aporte AFP %" value={company.afpAporte} onChange={(n) => updateCompany({ afpAporte: n })} />
          <Pct label="Prima de seguro %" value={company.afpSeguro} onChange={(n) => updateCompany({ afpSeguro: n })} />
          {FUNDS.map((f) => (
            <Pct
              key={f.id}
              label={`Comisión flujo ${f.label} %`}
              value={company.afpComision[f.id]}
              onChange={(n) => updateCompany({ afpComision: { ...company.afpComision, [f.id]: n } })}
            />
          ))}
        </div>
      </section>

      <FifthCategorySection company={company} updateCompany={updateCompany} />

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl">Aseguradoras y seguros</h2>
            <p className="mt-1 text-sm text-muted">
              Registra las aseguradoras vigentes con sus tasas. Las tasas varían por proveedor y año: mantenlas editables.
              El SCTR usa prima de pensión + salud; la EPS y el Seguro de Vida Ley usan una tasa total.
            </p>
          </div>
          <Button tone="line" onClick={addInsurer}>
            Agregar aseguradora
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {insurers.length === 0 ? (
            <p className="text-sm text-muted">Sin aseguradoras registradas.</p>
          ) : null}
          {insurers.map((ins) => (
            <div key={ins.id} className="grid items-end gap-3 rounded-lg border border-line bg-bg p-3 sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto_auto]">
              <Field label="Nombre">
                <input className={fieldClass} value={ins.name} onChange={(e) => patchInsurer(ins.id, { name: e.target.value })} />
              </Field>
              <Field label="Tipo">
                <select
                  className={fieldClass}
                  value={ins.kind}
                  onChange={(e) => patchInsurer(ins.id, { kind: e.target.value as InsurerKind })}
                >
                  {INSURER_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {INSURER_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </Field>
              {ins.kind === "sctr" ? (
                <>
                  <PctRaw label="Pensión %" value={ins.pensionRate ?? 0} onChange={(n) => patchInsurer(ins.id, { pensionRate: n })} />
                  <PctRaw label="Salud %" value={ins.healthRate ?? 0} onChange={(n) => patchInsurer(ins.id, { healthRate: n })} />
                </>
              ) : (
                <PctRaw label="Tasa total %" value={ins.rate ?? 0} onChange={(n) => patchInsurer(ins.id, { rate: n })} />
              )}
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-line-strong text-clay focus:ring-2 focus:ring-clay"
                  checked={ins.active}
                  onChange={(e) => patchInsurer(ins.id, { active: e.target.checked })}
                />
                Vigente
              </label>
              <Button tone="ghost" onClick={() => removeInsurer(ins.id)}>
                Quitar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">Áreas</h2>
        <ul className="mt-3 space-y-2">
          {areas.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <input
                className={fieldClass}
                value={a.name}
                onChange={(e) => renameArea(a.id, e.target.value)}
                aria-label={`Área ${a.name}`}
              />
              <span className="shrink-0 text-xs text-muted">
                {employees.filter((e) => e.areaId === a.id && e.status === "activo").length}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input className={fieldClass} placeholder="Nueva área" value={areaName} onChange={(e) => setAreaName(e.target.value)} />
          <Button
            tone="line"
            onClick={() => {
              if (!areaName.trim()) return;
              addArea(areaName);
              setAreaName("");
              toast.success("Área creada");
            }}
          >
            Agregar
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <h2 className="text-2xl">Datos de ejemplo</h2>
        <p className="mt-1 text-sm text-muted">
          Andes & Cacao es una empresa ficticia para recorrer el producto. Puedes quitar a esas personas y conservar el nombre de tu empresa, o volver a cargar la demostración completa.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button tone="line" onClick={() => setConfirm("clear")}>
            Quitar personas de ejemplo
          </Button>
          <Button tone="danger" onClick={() => setConfirm("reset")}>
            Restablecer demostración
          </Button>
        </div>
      </section>

      <Modal open={confirm !== null} title={confirm === "reset" ? "Restablecer demostración" : "Quitar personas de ejemplo"} onClose={() => setConfirm(null)}>
        <p className="text-sm">
          {confirm === "reset"
            ? "Se vuelve a cargar Andes & Cacao, con sus colaboradores, marcas y la planilla de octubre cerrada. Lo que hayas cambiado se pierde en este navegador."
            : "Se eliminan los colaboradores de ejemplo (de todas tus empresas), junto con sus solicitudes, asistencias y boletas. La razón social, tus empresas y los parámetros se quedan."}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => setConfirm(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (confirm === "reset") resetDemo();
              else clearDemoPeople();
              setConfirm(null);
              toast.success(confirm === "reset" ? "Demostración restaurada" : "Personas de ejemplo retiradas");
            }}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}

function Pct({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const shown = String(Math.round(value * 10000) / 100);
  return (
    <Field label={label}>
      <input
        className={fieldClass}
        value={shown}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n / 100);
        }}
      />
    </Field>
  );
}

/** Igual que `Pct`, pero para valores ya expresados en porcentaje (ej. 2.25). */
function PctRaw({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={label}>
      <input
        className={fieldClass}
        inputMode="decimal"
        value={String(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
      />
    </Field>
  );
}

/**
 * Parámetros editables de la retención de quinta categoría: la deducción fija
 * (en UIT) y los tramos de la escala progresiva. Se guardan por empresa para
 * poder ajustarlos cuando cambie la norma (p. ej. si la UIT o los tramos varían
 * el próximo año).
 */
function FifthCategorySection({
  company,
  updateCompany,
}: {
  company: Company;
  updateCompany: (patch: Partial<Company>) => void;
}) {
  const params = fifthCategoryParamsOf(company);
  const uit = company.uit;

  const setDeduction = (n: number) => updateCompany({ fifthCategory: { ...params, deductionUit: n } });
  const setBand = (index: number, patch: Partial<FifthCategoryBand>) =>
    updateCompany({
      fifthCategory: {
        ...params,
        bands: params.bands.map((b, i) => (i === index ? { ...b, ...patch } : b)),
      },
    });
  const addBand = () => updateCompany({ fifthCategory: { ...params, bands: [...params.bands, { span: null, rate: 0 }] } });
  const removeBand = (index: number) =>
    updateCompany({ fifthCategory: { ...params, bands: params.bands.filter((_, i) => i !== index) } });

  return (
    <section className="mt-4 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Renta de quinta categoría</h2>
          <p className="mt-1 text-sm text-muted">
            Deducción fija y escala progresiva para retener la renta de quinta categoría. La UIT vigente es S/{" "}
            {uit.toLocaleString("es-PE")}; ajústala arriba en «Parámetros de planilla» si cambia. Los tramos se expresan
            en UIT.
          </p>
        </div>
        <Button tone="line" onClick={addBand}>
          Agregar tramo
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Field label="Deducción fija (UIT)" hint={`Equivale a S/ ${(params.deductionUit * uit).toLocaleString("es-PE")} al año.`}>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={String(params.deductionUit)}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 0) setDeduction(n);
            }}
          />
        </Field>
      </div>
      <div className="mt-3 space-y-2">
        {params.bands.map((band, i) => (
          <div key={i} className="grid items-end gap-3 rounded-lg border border-line bg-bg p-3 sm:grid-cols-[1fr_1fr_auto]">
            <Field
              label="Tramo (UIT)"
              hint={band.span == null ? "Sin tope: aplica al exceso." : `Hasta ${band.span} UIT por tramo`}
            >
              <input
                className={fieldClass}
                inputMode="decimal"
                placeholder="Sin tope"
                value={band.span == null ? "" : String(band.span)}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const n = Number(raw);
                  setBand(i, { span: raw === "" || !Number.isFinite(n) ? null : n });
                }}
              />
            </Field>
            <Field label="Tasa (%)">
              <input
                className={fieldClass}
                inputMode="decimal"
                value={String(Math.round(band.rate * 10000) / 100)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setBand(i, { rate: n / 100 });
                }}
              />
            </Field>
            <Button tone="ghost" onClick={() => removeBand(i)}>
              Quitar
            </Button>
          </div>
        ))}
        {params.bands.length === 0 ? <p className="text-sm text-muted">Sin tramos: no se retendrá quinta categoría.</p> : null}
      </div>
    </section>
  );
}
