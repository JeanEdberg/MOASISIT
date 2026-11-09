import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass, Modal, PageHeader } from "@/components/ui";
import { useHr } from "@/lib/hr/store";
import type { AfpFund, Company } from "@/lib/hr/types";

export const Route = createFileRoute("/empresa")({ component: CompanyPage });

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

  return (
    <Shell>
      <PageHeader
        kicker="Tu empresa"
        title="Configuración"
        lede="Cambia la razón social, el RUC y los parámetros de planilla. Los valores iniciales siguen la referencia 2026: RMV S/ 1,130, UIT S/ 5,350 y comisiones AFP por flujo."
      />

      <section className="rounded-lg border border-line bg-surface p-4">
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
            : "Se eliminan los colaboradores @andescacao.pe, sus solicitudes y boletas. La razón social y los parámetros se quedan."}
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
