import { Field, fieldClass } from "@/components/ui";
import {
  CONTRACT_LABEL,
  HEALTH_INSURANCE_LABEL,
  PENSION_LABEL,
  REGIME_LABEL,
  WORK_MODE_LABEL,
} from "@/lib/hr/format";
import type {
  Area,
  Company,
  ContractType,
  Employee,
  HealthInsurance,
  Pension,
  Regime,
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.hireDate)) return "La fecha de ingreso no es válida.";
  if (d.contract === "plazo_fijo" && !d.endDate) return "Indica la fecha de fin para el contrato a plazo fijo.";
  if (d.endDate && d.endDate < d.hireDate) return "La fecha de fin no puede ser anterior al ingreso.";
  if (d.healthInsurance === "eps" && !d.epsInsurerId) return "Elige la EPS del colaborador.";
  const esAfp = d.pension !== "onp" && d.pension !== "ninguno";
  if (esAfp && !(d.cuspp ?? "").trim()) return "Indica el CUSPP del colaborador (lo entrega su AFP).";
  return null;
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

  const activeCompany = companies?.find((c) => c.id === value.companyId);
  const insurers = activeCompany?.insurers ?? [];
  const epsOptions = insurers.filter((i) => i.kind === "eps" && i.active);
  const sctrOptions = insurers.filter((i) => i.kind === "sctr" && i.active);
  const vidaOptions = insurers.filter((i) => i.kind === "vida_ley" && i.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-semibold text-gray-800">
          {isEditing ? `Editando Colaborador: ${value.names} ${value.paternal}` : "Registrar Nuevo Colaborador"}
        </h3>
        <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
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
        <Field label="Sueldo mensual (S/)">
          <input
            className={fieldClass}
            inputMode="decimal"
            value={String(value.salary)}
            onChange={(e) => set("salary", Number(e.target.value))}
          />
        </Field>
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
          <Field label="Cobertura de salud">
            <select
              className={fieldClass}
              value={value.healthInsurance}
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
              value={value.epsInsurerId ?? ""}
              disabled={value.healthInsurance !== "eps"}
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
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={value.familyAllowance}
            onChange={(e) => set("familyAllowance", e.target.checked)}
          />
          Asignación familiar (10% de la RMV)
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
