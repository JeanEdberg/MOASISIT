import { Button, Field, fieldClass } from "@/components/ui";
import {
  CONTRACT_LABEL,
  HEALTH_INSURANCE_LABEL,
  PENSION_LABEL,
  REGIME_LABEL,
  WORK_MODE_LABEL,
  todayIso,
} from "@/lib/hr/format";
import { sortedHealthHistory } from "@/lib/hr/health";
import { sortedSalaryHistory } from "@/lib/hr/salary";
import type {
  Area,
  Company,
  ContractType,
  Employee,
  HealthChange,
  HealthInsurance,
  Insurer,
  Pension,
  Regime,
  SalaryChange,
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
        <Field label="Fecha de nacimiento">
          <input className={fieldClass} type="date" value={value.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
        </Field>
        <Field label="Fecha de ingreso">
          <input className={fieldClass} type="date" value={value.hireDate} onChange={(e) => set("hireDate", e.target.value)} />
        </Field>
        <Field label="Cargo">
          <input className={fieldClass} value={value.position} onChange={(e) => set("position", e.target.value)} />
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
        <Field label="Hijos">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={String(value.children)}
            onChange={(e) => {
              const children = Math.max(0, Number(e.target.value) || 0);
              onChange({ ...value, children, familyAllowance: children > 0 });
            }}
          />
        </Field>
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
