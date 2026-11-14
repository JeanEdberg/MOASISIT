import { useMemo, useState } from "react";
import { Button, Field, fieldClass } from "@/components/ui";
import {
  CONTRACT_LABEL,
  HEALTH_INSURANCE_LABEL,
  PENSION_LABEL,
  REGIME_LABEL,
  WORK_MODE_LABEL,
  todayIso,
} from "@/lib/hr/format";
import { emptyDependent, withDependents } from "@/lib/hr/dependents";
import { sortedHealthHistory } from "@/lib/hr/health";
import { occupationName, searchOccupations } from "@/lib/hr/occupations";
import { sortedSalaryHistory } from "@/lib/hr/salary";
import { EDUCATION_LEVELS, NATIONALITIES, SEX_OPTIONS, DEPENDENT_OPTIONS } from "@/lib/hr/sunat-tables";
import type {
  Area,
  Company,
  ContractType,
  Dependent,
  Employee,
  HealthChange,
  HealthInsurance,
  Insurer,
  Pension,
  Regime,
  SalaryChange,
  Sex,
  WorkMode,
} from "@/lib/hr/types";

export type EmployeeDraft = Omit<Employee, "id" | "code" | "vacationHistory"> & {
  vacationHistory: number;
};

export function draftFromEmployee(e: Employee): EmployeeDraft {
  const { id: _id, code: _code, ...rest } = e;
  return rest;
}

export function validateDraft(d: EmployeeDraft): string | null {
  if (!d.names.trim() || !d.paternal.trim()) return "Indica nombres y apellido paterno.";
  if (!/^\d{8}$/.test(d.dni)) return "El DNI debe tener 8 dígitos.";
  if (!d.position.trim()) return "Indica el cargo.";
  if (!d.areaId) return "Elige un área.";
  if (!Number.isFinite(d.salary) || d.salary < 0) return "El sueldo no es válido.";
  for (const c of d.salaryHistory ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.from)) return "Hay un cambio de sueldo sin fecha válida.";
    if (!Number.isFinite(c.salary) || c.salary < 0) return "Hay un cambio de sueldo con monto inválido.";
  }
  for (const c of d.healthHistory ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.from)) return "Hay un cambio de cobertura sin fecha válida.";
    if (c.healthInsurance === "eps" && !c.epsInsurerId) return "Elige la EPS de un cambio de cobertura.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.hireDate)) return "La fecha de ingreso no es válida.";
  if (d.contract === "plazo_fijo" && !d.endDate) return "Indica la fecha de fin para el contrato a plazo fijo.";
  if (d.endDate && d.endDate < d.hireDate) return "La fecha de fin no puede ser anterior al ingreso.";
  if (d.healthInsurance === "eps" && !d.epsInsurerId) return "Elige la EPS del colaborador.";
  const esAfp = d.pension !== "onp" && d.pension !== "ninguno";
  if (esAfp && !(d.cuspp ?? "").trim()) return "Indica el CUSPP del colaborador (lo entrega su AFP).";
  return null;
}

/**
 * Editor del histórico de remuneraciones: sueldo de ingreso y cada cambio de
 * sueldo con su fecha. El sueldo vigente (campo "Sueldo mensual") es el último
 * cambio del histórico. Los períodos pasados se calculan con el monto que regía.
 */
function SalaryHistoryEditor({
  value,
  onChange,
}: {
  value: EmployeeDraft;
  onChange: (next: EmployeeDraft) => void;
}) {
  const history = sortedSalaryHistory(value);
  const setHistory = (next: SalaryChange[]) => onChange({ ...value, salaryHistory: next });

  const addChange = () => {
    const last = history[history.length - 1];
    const from = todayIso();
    setHistory([...history, { from, salary: last?.salary ?? value.salary }]);
  };
  const update = (index: number, patch: Partial<SalaryChange>) =>
    setHistory(history.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const remove = (index: number) => setHistory(history.filter((_, i) => i !== index));

  return (
    <div className="sm:col-span-2 rounded-md border border-line bg-surface-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">Histórico de remuneraciones</p>
          <p className="mt-0.5 text-xs text-muted">
            Registra el sueldo de ingreso y cada aumento con su fecha. Las boletas y beneficios de períodos
            anteriores se calculan con el sueldo que regía en esa fecha.
          </p>
        </div>
        <Button tone="line" onClick={addChange}>
          + Cambio de remuneración
        </Button>
      </div>
      {history.length === 0 ? (
        <p className="mt-3 text-xs text-muted">
          Aún no hay cambios. El sueldo de arriba se usará como sueldo de ingreso desde {value.hireDate}.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((c, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <input
                className={`${fieldClass} min-h-9 max-w-[11rem]`}
                type="date"
                value={c.from}
                onChange={(e) => update(i, { from: e.target.value })}
              />
              <input
                className={`${fieldClass} min-h-9 max-w-[8rem]`}
                inputMode="decimal"
                value={String(c.salary)}
                onChange={(e) => update(i, { salary: Number(e.target.value) || 0 })}
              />
              <input
                className={`${fieldClass} min-h-9 flex-1`}
                placeholder="Motivo (opcional)"
                value={c.note ?? ""}
                onChange={(e) => update(i, { note: e.target.value || undefined })}
              />
              <Button tone="ghost" className="min-h-9 px-2" onClick={() => remove(i)} aria-label="Quitar cambio">
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Editor del histórico de cobertura de salud: cobertura de ingreso y cada cambio
 * (EsSalud ↔ EPS) con su fecha. La cobertura vigente (el selector "Cobertura de
 * salud" de arriba) es el último cambio del histórico. Las gratificaciones usan
 * la cobertura que regía al cierre de su semestre (9% EsSalud / 6.75% EPS).
 */
function HealthHistoryEditor({
  value,
  epsOptions,
  onChange,
}: {
  value: EmployeeDraft;
  epsOptions: Insurer[];
  onChange: (next: EmployeeDraft) => void;
}) {
  const history = sortedHealthHistory(value);
  const setHistory = (next: HealthChange[]) => onChange({ ...value, healthHistory: next });

  const addChange = () => {
    const last = history[history.length - 1];
    setHistory([
      ...history,
      {
        from: todayIso(),
        healthInsurance: last?.healthInsurance ?? value.healthInsurance,
        epsInsurerId: last?.epsInsurerId ?? value.epsInsurerId ?? epsOptions[0]?.id ?? null,
      },
    ]);
  };
  const update = (index: number, patch: Partial<HealthChange>) =>
    setHistory(history.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const remove = (index: number) => setHistory(history.filter((_, i) => i !== index));

  return (
    <div className="sm:col-span-2 rounded-md border border-line bg-surface-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">Histórico de cobertura de salud</p>
          <p className="mt-0.5 text-xs text-muted">
            Registra la cobertura de ingreso y cada cambio (EsSalud ↔ EPS) con su fecha. Las gratificaciones de
            períodos anteriores usan la cobertura que regía en su fecha (9% EsSalud / 6.75% EPS).
          </p>
        </div>
        <Button tone="line" onClick={addChange}>
          + Cambio de cobertura
        </Button>
      </div>
      {history.length === 0 ? (
        <p className="mt-3 text-xs text-muted">
          Aún no hay cambios. La cobertura de arriba se usará desde {value.hireDate}.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((c, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <input
                className={`${fieldClass} min-h-9 max-w-[11rem]`}
                type="date"
                value={c.from}
                onChange={(e) => update(i, { from: e.target.value })}
              />
              <select
                className={`${fieldClass} min-h-9 max-w-[9rem]`}
                value={c.healthInsurance}
                onChange={(e) => {
                  const healthInsurance = e.target.value as HealthInsurance;
                  update(i, {
                    healthInsurance,
                    epsInsurerId:
                      healthInsurance === "eps" ? c.epsInsurerId ?? epsOptions[0]?.id ?? null : null,
                  });
                }}
              >
                {(Object.keys(HEALTH_INSURANCE_LABEL) as HealthInsurance[]).map((k) => (
                  <option key={k} value={k}>
                    {HEALTH_INSURANCE_LABEL[k]}
                  </option>
                ))}
              </select>
              <select
                className={`${fieldClass} min-h-9 max-w-[11rem]`}
                value={c.epsInsurerId ?? ""}
                disabled={c.healthInsurance !== "eps"}
                onChange={(e) => update(i, { epsInsurerId: e.target.value || null })}
              >
                <option value="">Sin EPS</option>
                {epsOptions.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.name}
                  </option>
                ))}
              </select>
              <input
                className={`${fieldClass} min-h-9 flex-1`}
                placeholder="Motivo (opcional)"
                value={c.note ?? ""}
                onChange={(e) => update(i, { note: e.target.value || undefined })}
              />
              <Button tone="ghost" className="min-h-9 px-2" onClick={() => remove(i)} aria-label="Quitar cambio">
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


/**
 * Editor de hijos y familiares a cargo (derechohabientes). Reemplaza la casilla
 * numérica de hijos por una pregunta Sí/No y, si la respuesta es Sí, una ficha
 * por cada familiar con los datos que exige el T-Registro (estructura 13).
 * La cantidad de hijos y la asignación familiar se derivan de aquí.
 */
function OccupationPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (code: string | undefined) => void;
}) {
  const selected = occupationName(value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const results = useMemo(() => searchOccupations(query, 50), [query]);
  const active = Math.min(highlight, Math.max(results.length - 1, 0));

  const choose = (code: string) => {
    onChange(code);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active].code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {value ? (
        <div className="flex items-start justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2">
          <p className="text-sm text-ink">
            <span className="font-medium">{value}</span>
            {selected ? <span className="text-muted"> · {selected}</span> : null}
          </p>
          <Button
            tone="ghost"
            className="min-h-8 shrink-0 px-2 text-xs"
            onClick={() => {
              onChange(undefined);
              setQuery("");
              setOpen(true);
            }}
            aria-label="Cambiar ocupación"
          >
            Cambiar
          </Button>
        </div>
      ) : (
        <input
          className={fieldClass}
          value={query}
          placeholder="Busca por nombre o código (ej. chofer, 411001)"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      )}
      {!value && open ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Sin coincidencias.</li>
          ) : (
            results.map((o, i) => (
              <li key={o.code}>
                <button
                  type="button"
                  className={`flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2 ${
                    i === active ? "bg-surface-2" : ""
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o.code);
                  }}
                >
                  <span className="font-mono text-xs text-muted">{o.code}</span>
                  <span className="text-ink">{o.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function DependentsEditor({
  value,
  onChange,
}: {
  value: EmployeeDraft;
  onChange: (next: EmployeeDraft) => void;
}) {
  const dependents = value.dependents ?? [];
  const hasDependents = dependents.length > 0;

  const setDependents = (next: Dependent[]) => {
    const base = { ...value, dependents: next };
    const withFlags = withDependents(base as Employee);
    onChange({ ...value, dependents: next, children: withFlags.children, familyAllowance: withFlags.familyAllowance });
  };

  const add = () =>
    setDependents([
      ...dependents,
      emptyDependent(`dep-${Date.now()}-${dependents.length}`),
    ]);
  const update = (index: number, patch: Partial<Dependent>) =>
    setDependents(dependents.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  const remove = (index: number) => setDependents(dependents.filter((_, i) => i !== index));

  return (
    <div className="sm:col-span-2 rounded-md border border-line bg-surface-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">Hijos y familiares a cargo</p>
          <p className="mt-0.5 text-xs text-muted">
            Se declaran en el T-Registro (derechohabientes). Los hijos dan derecho a la asignación familiar.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">¿Tiene hijos o familiares a cargo?</span>
          <select
            className={`${fieldClass} min-h-9 max-w-[6rem]`}
            value={hasDependents ? "si" : "no"}
            onChange={(e) => {
              if (e.target.value === "si") {
                if (!hasDependents) add();
              } else {
                setDependents([]);
              }
            }}
          >
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </label>
      </div>

      {hasDependents ? (
        <ul className="mt-3 space-y-3">
          {dependents.map((d, i) => (
            <li key={d.id} className="rounded-md border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-ink">Familiar {i + 1}</p>
                <Button tone="ghost" className="min-h-8 px-2 text-xs" onClick={() => remove(i)} aria-label="Quitar familiar">
                  Quitar
                </Button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Field label="Vínculo">
                  <select
                    className={`${fieldClass} min-h-9`}
                    value={d.kind}
                    onChange={(e) => update(i, { kind: e.target.value as Dependent["kind"] })}
                  >
                    {DEPENDENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sexo">
                  <select
                    className={`${fieldClass} min-h-9`}
                    value={d.sex}
                    onChange={(e) => update(i, { sex: e.target.value as Sex })}
                  >
                    {SEX_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Nombres">
                  <input
                    className={`${fieldClass} min-h-9`}
                    value={d.names}
                    onChange={(e) => update(i, { names: e.target.value })}
                  />
                </Field>
                <Field label="Apellido paterno">
                  <input
                    className={`${fieldClass} min-h-9`}
                    value={d.paternal}
                    onChange={(e) => update(i, { paternal: e.target.value })}
                  />
                </Field>
                <Field label="Apellido materno">
                  <input
                    className={`${fieldClass} min-h-9`}
                    value={d.maternal}
                    onChange={(e) => update(i, { maternal: e.target.value })}
                  />
                </Field>
                <Field label="DNI">
                  <input
                    className={`${fieldClass} min-h-9`}
                    inputMode="numeric"
                    value={d.dni}
                    onChange={(e) => update(i, { dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                  />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input
                    className={`${fieldClass} min-h-9`}
                    type="date"
                    value={d.birthDate}
                    onChange={(e) => update(i, { birthDate: e.target.value })}
                  />
                </Field>
                <Field
                  label="Doc. que acredita el vínculo"
                  hint="Tabla 27. Obligatorio para concubina(o) e hijo incapacitado."
                >
                  <input
                    className={`${fieldClass} min-h-9`}
                    value={d.bondNumber ?? ""}
                    onChange={(e) => update(i, { bondNumber: e.target.value })}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Selecciona «Sí» para agregar los datos de cada hijo o familiar (T-Registro, estructura 13).
        </p>
      )}

      {hasDependents ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">
            {value.children} hijo{value.children === 1 ? "" : "s"} · Asignación familiar:{" "}
            <strong className="text-ink">{value.familyAllowance ? "Sí" : "No"}</strong>
          </p>
          <Button tone="line" className="min-h-9 px-3 text-xs" onClick={add}>
            + Agregar otro familiar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function EmployeeForm({
  value,
  areas,
  managers,
  companies,
  isEditing = false,
  onChange,
}: {
  value: EmployeeDraft;
  areas: Area[];
  managers: Employee[];
  /** Empresas donde el superadmin puede ubicar al colaborador. Vacío = solo lectura. */
  companies?: Company[];
  isEditing?: boolean;
  onChange: (next: EmployeeDraft) => void;
}) {
  const set = <K extends keyof EmployeeDraft>(key: K, v: EmployeeDraft[K]) => onChange({ ...value, [key]: v });

  const history = sortedSalaryHistory(value);
  const healthHistory = sortedHealthHistory(value);
  const activeCompany = companies?.find((c) => c.id === value.companyId);
  const insurers = activeCompany?.insurers ?? [];
  const epsOptions = insurers.filter((i) => i.kind === "eps" && i.active);
  const sctrOptions = insurers.filter((i) => i.kind === "sctr" && i.active);
  const vidaOptions = insurers.filter((i) => i.kind === "vida_ley" && i.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-2">
        <h3 className="text-base font-semibold text-ink">
          {isEditing ? `Editando Colaborador: ${value.names} ${value.paternal}` : "Registrar Nuevo Colaborador"}
        </h3>
        <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-medium text-clay">
          Moasist HR Core
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {companies && companies.length > 1 ? (
          <Field label="Empresa" hint="Filtra lo que verá este colaborador.">
            <select className={fieldClass} value={value.companyId} onChange={(e) => set("companyId", e.target.value)}>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Nombres">
          <input className={fieldClass} value={value.names} onChange={(e) => set("names", e.target.value)} />
        </Field>
        <Field label="Apellido paterno">
          <input className={fieldClass} value={value.paternal} onChange={(e) => set("paternal", e.target.value)} />
        </Field>
        <Field label="Apellido materno">
          <input className={fieldClass} value={value.maternal} onChange={(e) => set("maternal", e.target.value)} />
        </Field>
        <Field label="DNI">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={value.dni}
            disabled={isEditing}
            placeholder="8 dígitos"
            onChange={(e) => set("dni", e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
        </Field>
        <Field label="Correo">
          <input className={fieldClass} type="email" value={value.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Celular">
          <input className={fieldClass} value={value.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Domicilio" hint="Aparece en el contrato de trabajo.">
          <input
            className={fieldClass}
            value={value.address}
            placeholder="Ej. Av. León Velarde 450, Tambopata"
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        <Field label="Ubigeo" hint="6 dígitos del domicilio (tabla 28). Lo exige el T-Registro.">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={value.ubigeo ?? ""}
            placeholder="Ej. 170101"
            onChange={(e) => set("ubigeo", e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </Field>
        <Field label="Fecha de nacimiento">
          <input className={fieldClass} type="date" value={value.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
        </Field>
        <Field label="Sexo" hint="Lo exige el T-Registro (estructura 4).">
          <select
            className={fieldClass}
            value={value.sex ?? ""}
            onChange={(e) => set("sex", (e.target.value || undefined) as Sex | undefined)}
          >
            <option value="">Sin especificar</option>
            {SEX_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nacionalidad" hint="Tabla 4 del Anexo 2. Por defecto, Perú.">
          <select
            className={fieldClass}
            value={value.nationality ?? "9589"}
            onChange={(e) => set("nationality", e.target.value)}
          >
            {NATIONALITIES.map((n) => (
              <option key={n.code} value={n.code}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de ingreso">
          <input className={fieldClass} type="date" value={value.hireDate} onChange={(e) => set("hireDate", e.target.value)} />
        </Field>
        <Field label="Cargo">
          <input className={fieldClass} value={value.position} onChange={(e) => set("position", e.target.value)} />
        </Field>
        <Field label="Situación educativa" hint="Tabla 9. La usa el T-Registro (estructuras 5 y 29).">
          <select
            className={fieldClass}
            value={value.educationLevel ?? ""}
            onChange={(e) => set("educationLevel", e.target.value || undefined)}
          >
            <option value="">Sin especificar</option>
            {EDUCATION_LEVELS.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Ocupación"
          hint="Tabla 30 de SUNAT (sector privado). Busca por nombre o código; la app guarda el código de 6 dígitos."
        >
          <OccupationPicker value={value.occupation} onChange={(code) => set("occupation", code)} />
        </Field>
        <Field label="Área">
          <select className={fieldClass} value={value.areaId} onChange={(e) => set("areaId", e.target.value)}>
            <option value="">Selecciona un área...</option>
            {areas
              .filter((a) => !companies || !value.companyId || a.companyId === value.companyId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Jefatura">
          <select
            className={fieldClass}
            value={value.managerId ?? ""}
            onChange={(e) => set("managerId", e.target.value || null)}
          >
            <option value="">Sin jefatura</option>
            {managers
              .filter((m) => !companies || !value.companyId || m.companyId === value.companyId)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.names} {m.paternal}
                </option>
              ))}
          </select>
        </Field>
        <Field
          label="Sueldo mensual (S/)"
          hint={
            history.length > 0 ? "Es el último cambio del histórico (edítalo abajo)." : "Sueldo de ingreso."
          }
        >
          <input
            className={fieldClass}
            inputMode="decimal"
            value={String(history.at(-1)?.salary ?? value.salary)}
            disabled={history.length > 0}
            onChange={(e) => set("salary", Number(e.target.value))}
          />
        </Field>
        <SalaryHistoryEditor value={value} onChange={onChange} />
        <Field label="Contrato">
          <select className={fieldClass} value={value.contract} onChange={(e) => set("contract", e.target.value as ContractType)}>
            {(Object.keys(CONTRACT_LABEL) as ContractType[]).map((k) => (
              <option key={k} value={k}>
                {CONTRACT_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Régimen laboral">
          <select
            className={fieldClass}
            value={value.regime}
            onChange={(e) => {
              const regime = e.target.value as Regime;
              onChange({
                ...value,
                regime,
                pension: regime === "practicante" ? "ninguno" : value.pension,
                contract: regime === "practicante" ? "practicas" : value.contract,
                fifthCategory: regime === "general" ? value.fifthCategory : false,
              });
            }}
          >
            {(Object.keys(REGIME_LABEL) as Regime[]).map((k) => (
              <option key={k} value={k}>
                {REGIME_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pensión">
          <select
            className={fieldClass}
            value={value.pension}
            onChange={(e) => {
              const pension = e.target.value as Pension;
              const sinAfp = pension === "onp" || pension === "ninguno";
              onChange({ ...value, pension, cuspp: sinAfp ? "" : value.cuspp });
            }}
          >
            {(Object.keys(PENSION_LABEL) as Pension[]).map((k) => (
              <option key={k} value={k}>
                {PENSION_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="CUSPP"
          hint="Código de la AFP (ej. 660661RCANU6). Obligatorio para declarar en AFPnet."
        >
          <input
            className={fieldClass}
            value={value.cuspp ?? ""}
            placeholder="Ej. 660661RCANU6"
            disabled={value.pension === "onp" || value.pension === "ninguno"}
            onChange={(e) => set("cuspp", e.target.value.toUpperCase().trim())}
          />
        </Field>
        <Field label="Modalidad de trabajo" hint="Define cómo se valida la asistencia.">
          <select className={fieldClass} value={value.workMode} onChange={(e) => set("workMode", e.target.value as WorkMode)}>
            {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((k) => (
              <option key={k} value={k}>
                {WORK_MODE_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <DependentsEditor value={value} onChange={onChange} />
      </div>

      <div className="rounded-lg border border-line bg-surface-2 p-3">
        <h4 className="text-sm font-semibold text-ink">Seguridad social y seguros</h4>
        <p className="mt-0.5 text-xs text-muted">
          Define la cobertura de salud, el SCTR y el Seguro de Vida Ley. Las tasas se configuran por aseguradora en Empresa.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            label="Cobertura de salud"
            hint={healthHistory.length > 0 ? "Es el último cambio del histórico (edítalo abajo)." : undefined}
          >
            <select
              className={fieldClass}
              value={healthHistory.at(-1)?.healthInsurance ?? value.healthInsurance}
              disabled={healthHistory.length > 0}
              onChange={(e) => {
                const healthInsurance = e.target.value as HealthInsurance;
                onChange({
                  ...value,
                  healthInsurance,
                  epsInsurerId: healthInsurance === "eps" ? value.epsInsurerId ?? epsOptions[0]?.id ?? null : null,
                });
              }}
            >
              {(Object.keys(HEALTH_INSURANCE_LABEL) as HealthInsurance[]).map((k) => (
                <option key={k} value={k}>
                  {HEALTH_INSURANCE_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="EPS" hint="Solo si la cobertura es EPS.">
            <select
              className={fieldClass}
              value={(healthHistory.at(-1)?.epsInsurerId ?? value.epsInsurerId) ?? ""}
              disabled={(healthHistory.at(-1)?.healthInsurance ?? value.healthInsurance) !== "eps"}
              onChange={(e) => set("epsInsurerId", e.target.value || null)}
            >
              <option value="">Sin EPS</option>
              {epsOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} · {i.rate ?? 0}%
                </option>
              ))}
            </select>
          </Field>
          <Field label="SCTR" hint="Seguro Complementario de Trabajo de Riesgo.">
            <select
              className={fieldClass}
              value={value.sctrInsurerId ?? ""}
              onChange={(e) => set("sctrInsurerId", e.target.value || null)}
            >
              <option value="">Sin SCTR</option>
              {sctrOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} · {(i.pensionRate ?? 0) + (i.healthRate ?? 0)}%
                </option>
              ))}
            </select>
          </Field>
          <Field label="Seguro de Vida Ley">
            <select
              className={fieldClass}
              value={value.vidaLeyInsurerId ?? ""}
              onChange={(e) => set("vidaLeyInsurerId", e.target.value || null)}
            >
              <option value="">Sin Vida Ley</option>
              {vidaOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} · {i.rate ?? 0}%
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 grid gap-3">
          <HealthHistoryEditor value={value} epsOptions={epsOptions} onChange={onChange} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Banco (sueldo)">
          <input className={fieldClass} value={value.salaryBank} onChange={(e) => set("salaryBank", e.target.value)} />
        </Field>
        <Field label="Cuenta (sueldo)">
          <input className={fieldClass} value={value.salaryAccount} onChange={(e) => set("salaryAccount", e.target.value)} />
        </Field>
        <Field label="Banco (CTS)">
          <input className={fieldClass} value={value.ctsBank} onChange={(e) => set("ctsBank", e.target.value)} />
        </Field>
        <Field label="Cuenta (CTS)">
          <input className={fieldClass} value={value.ctsAccount} onChange={(e) => set("ctsAccount", e.target.value)} />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            className="size-4 rounded border-line-strong text-clay focus:ring-2 focus:ring-clay"
            checked={value.familyAllowance}
            onChange={(e) => set("familyAllowance", e.target.checked)}
          />
          Asignación familiar (10% de la RMV)
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            className="size-4 rounded border-line-strong text-clay focus:ring-2 focus:ring-clay"
            checked={value.fifthCategory}
            onChange={(e) => set("fifthCategory", e.target.checked)}
          />
          Afecto a renta de quinta categoría (se retiene según su sueldo proyectado)
        </label>
        <Field label="Vacaciones ya gozadas" hint="Sirve al migrar el saldo histórico.">
          <input
            className={fieldClass}
            inputMode="decimal"
            value={String(value.vacationHistory)}
            onChange={(e) => set("vacationHistory", Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Fin de contrato" hint="Vacío si no tiene fecha de cese.">
          <input
            className={fieldClass}
            type="date"
            value={value.endDate ?? ""}
            onChange={(e) => set("endDate", e.target.value || null)}
          />
        </Field>
      </div>
    </div>
  );
}
