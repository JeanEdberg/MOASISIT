import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmployeeForm, validateDraft, type EmployeeDraft } from "@/components/employee-form";
import { Shell } from "@/components/shell";
import { Badge, Button, Empty, fieldClass, Modal, PageHeader } from "@/components/ui";
import { canSeeMoney, isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { parseEmployeeCsv, CSV_SAMPLE } from "@/lib/hr/csv";
import { fullName, HOY, pen, REGIME_LABEL, uid } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { Employee } from "@/lib/hr/types";

export const Route = createFileRoute("/colaboradores")({ component: PeoplePage });

function emptyDraft(companyId: string, areaId: string): EmployeeDraft {
  return {
    companyId,
    names: "",
    paternal: "",
    maternal: "",
    dni: "",
    email: "",
    phone: "",
    birthDate: "1995-01-01",
    address: "",
    hireDate: HOY,
    endDate: null,
    status: "activo",
    areaId,
    position: "",
    managerId: null,
    contract: "indefinido",
    regime: "general",
    salary: 1130,
    familyAllowance: false,
    pension: "onp",
    healthInsurance: "essalud",
    epsInsurerId: null,
    sctrInsurerId: null,
    vidaLeyInsurerId: null,
    workMode: "presencial",
    salaryBank: "BCP",
    salaryAccount: "",
    ctsBank: "BCP",
    ctsAccount: "",
    bank: "BCP",
    account: "",
    children: 0,
    vacationHistory: 0,
  };
}

function PeoplePage() {
  const employees = useHr((s) => s.employees);
  const areas = useHr((s) => s.areas);
  const companies = useHr((s) => s.companies);
  const company = useHr((s) => s.company);
  const viewer = useHr((s) => s.viewer);
  const addEmployee = useHr((s) => s.addEmployee);
  const importPeople = useHr((s) => s.importPeople);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("todas");
  const [status, setStatus] = useState<"todos" | "activo" | "cesado">("activo");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft>(() => emptyDraft(company.id, areas[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [csvMsg, setCsvMsg] = useState<string | null>(null);

  const admin = isCompanyAdmin(viewer.mode);
  const visible = visibleEmployees(employees, viewer);
  const companyAreas = areas.filter((a) => a.companyId === company.id);
  const rows = useMemo(() => {
    return visible.filter((e) => {
      if (status !== "todos" && e.status !== status) return false;
      if (area !== "todas" && e.areaId !== area) return false;
      const blob = `${fullName(e)} ${e.dni} ${e.position} ${e.code}`.toLowerCase();
      return blob.includes(q.trim().toLowerCase());
    });
  }, [visible, status, area, q]);

  const save = () => {
    const err = validateDraft(draft);
    if (err) {
      setError(err);
      return;
    }
    const emp: Employee = {
      ...draft,
      id: uid("e"),
      code: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
    };
    addEmployee(emp);
    setOpen(false);
    toast.success("Colaborador agregado");
  };

  const onCsv = async (file: File) => {
    const text = await file.text();
    const parsed = parseEmployeeCsv(text, areas, employees.length, company.id);
    if (parsed.errors.length && parsed.employees.length === 0) {
      setCsvMsg(parsed.errors.join(" "));
      return;
    }
    importPeople(
      parsed.employees.map((e) => ({ ...e, vacationHistory: 0 })),
      parsed.areas,
    );
    setCsvMsg(
      `Se importaron ${parsed.employees.length} personas${parsed.errors.length ? `. Avisos: ${parsed.errors.join(" ")}` : "."}`,
    );
    toast.success("Importación lista");
  };

  return (
    <Shell>
      <PageHeader
        kicker="Directorio"
        title={viewer.mode === "jefatura" ? "Tu equipo" : "Colaboradores"}
        lede="Ficha laboral, régimen, pensión y sueldo. La vista de jefatura no muestra remuneraciones."
        actions={
          admin ? (
            <>
              <Button tone="line" onClick={() => downloadText("plantilla-colaboradores.csv", CSV_SAMPLE)}>
                Plantilla CSV
              </Button>
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-line bg-surface px-4 text-sm">
                Importar CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onCsv(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <Button
                onClick={() => {
                  setDraft(emptyDraft(company.id, companyAreas[0]?.id ?? ""));
                  setError(null);
                  setOpen(true);
                }}
              >
                Nueva persona
              </Button>
            </>
          ) : null
        }
      />

      {csvMsg ? <p className="mb-4 text-sm text-muted">{csvMsg}</p> : null}

      {admin ? (
        <p className="mb-4 text-sm text-muted">
          ¿Cargas muchos colaboradores? Descarga la <strong>Plantilla CSV</strong>, llena una fila por persona y usa{" "}
          <strong>Importar CSV</strong>. Solo son obligatorias las columnas nombres, paterno, dni, cargo, area, sueldo e
          ingreso; las demás (teléfono, contrato, régimen, pensión, banco, jefe_dni, etc.) son opcionales y, si las
          dejas vacías, la app pone valores por defecto.
        </p>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input className={fieldClass} placeholder="Buscar nombre, DNI o cargo" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={fieldClass} value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="todas">Todas las áreas</option>
          {companyAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="activo">Activos</option>
          <option value="cesado">Cesados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="Sin resultados" lede="Prueba otro filtro o agrega colaboradores de tu empresa." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-max min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Cargo</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Régimen</th>
                {admin ? <th className="px-4 py-3 font-medium">Sueldo</th> : null}
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/colaboradores/$id" params={{ id: e.id }} className="font-medium">
                      {fullName(e)}
                    </Link>
                    <span className="block text-xs text-muted">
                      {e.code} · DNI {e.dni}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.position}</td>
                  <td className="px-4 py-3">{areas.find((a) => a.id === e.areaId)?.name}</td>
                  <td className="px-4 py-3">{REGIME_LABEL[e.regime]}</td>
                  {admin ? (
                    <td className="num px-4 py-3">{canSeeMoney(viewer, e.id) ? pen(e.salary) : "—"}</td>
                  ) : null}
                  <td className="px-4 py-3">
                    <Badge tone={e.status === "activo" ? "moss" : "line"}>{e.status === "activo" ? "Activo" : "Cesado"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Nueva persona" onClose={() => setOpen(false)} wide>
        <EmployeeForm
          value={draft}
          areas={areas}
          managers={employees.filter((e) => e.status === "activo")}
          companies={companies}
          onChange={setDraft}
        />
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>Guardar</Button>
        </div>
      </Modal>
    </Shell>
  );
}

function downloadText(name: string, text: string) {
  // BOM inicial: Excel abre el archivo como UTF-8 y muestra bien los acentos.
  const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
