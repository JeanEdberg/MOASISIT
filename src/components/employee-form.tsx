import { Field, fieldClass } from "@/components/ui";
import { CONTRACT_LABEL, PENSION_LABEL, REGIME_LABEL } from "@/lib/hr/format";
import type { Area, ContractType, Employee, Pension, Regime } from "@/lib/hr/types";

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
  return null;
}

export function EmployeeForm({
  value,
  areas,
  managers,
  isEditing = false,
  onChange,
}: {
  value: EmployeeDraft;
  areas: Area[];
  managers: Employee[];
  isEditing?: boolean;
  onChange: (next: EmployeeDraft) => void;
}) {
  const set = <K extends keyof EmployeeDraft>(key: K, v: EmployeeDraft[K]) => onChange({ ...value, [key]: v });
  
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
            {areas.map((a) => (
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
            {managers.map((m) => (
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
          <select className={fieldClass} value={value.pension} onChange={(e) => set("pension", e.target.value as Pension)}>
            {(Object.keys(PENSION_LABEL) as Pension[]).map((k) => (
              <option key={k} value={k}>
                {PENSION_LABEL[k]}
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
        <Field label="Banco">
          <input className={fieldClass} value={value.bank} onChange={(e) => set("bank", e.target.value)} />
        </Field>
        <Field label="Cuenta">
          <input className={fieldClass} value={value.account} onChange={(e) => set("account", e.target.value)} />
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
