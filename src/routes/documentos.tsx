import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BoletaView } from "@/components/boleta";
import { Shell } from "@/components/shell";
import { Badge, Button, Modal, PageHeader } from "@/components/ui";
import { canSeeMoney, visibleEmployees } from "@/lib/hr/access";
import { payslipFor } from "@/lib/hr/calc";
import {
  CONTRACT_LABEL,
  DOC_LABEL,
  fullName,
  pen,
  PENSION_LABEL,
  shortDate,
} from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { DocItem } from "@/lib/hr/types";

export const Route = createFileRoute("/documentos")({ component: DocsPage });

function DocsPage() {
  const data = useHr();
  const signDocument = useHr((s) => s.signDocument);
  const people = visibleEmployees(data.employees, data.viewer);
  const [open, setOpen] = useState<DocItem | null>(null);
  const docs = data.documents.filter((d) => {
    if (!d.employeeId) return true;
    if (!people.some((e) => e.id === d.employeeId)) return false;
    if ((d.kind === "boleta" || d.kind === "contrato") && !canSeeMoney(data.viewer, d.employeeId)) return false;
    return true;
  });
  const emp = data.employees.find((e) => e.id === open?.employeeId);
  const slip = open?.kind === "boleta" && open.period && open.employeeId ? payslipFor(data, open.employeeId, open.period) : null;

  return (
    <Shell>
      <PageHeader
        kicker="Legajo"
        title="Documentos"
        lede="Contratos, boletas y políticas en un solo lugar. Marcar como firmado es un registro interno: no es la firma electrónica del Ministerio de Trabajo."
      />
      <ul className="space-y-2">
        {docs.map((d) => {
          const who = data.employees.find((e) => e.id === d.employeeId);
          return (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
              <button type="button" className="min-h-11 text-left" onClick={() => setOpen(d)}>
                <span className="block text-sm font-medium">{d.title}</span>
                <span className="text-xs text-muted">
                  {DOC_LABEL[d.kind]}
                  {who ? ` · ${fullName(who)}` : " · Toda la empresa"} · {shortDate(d.date)}
                </span>
              </button>
              <Badge tone={d.status === "pendiente" ? "clay" : d.status === "firmado" ? "moss" : "line"}>
                {d.status === "pendiente" ? "Pendiente" : d.status === "firmado" ? "Firmado" : "Vigente"}
              </Badge>
            </li>
          );
        })}
      </ul>

      <Modal open={Boolean(open)} title={open?.title ?? "Documento"} onClose={() => setOpen(null)} wide>
        {open?.kind === "boleta" && slip && emp ? <BoletaView slip={slip} employee={emp} company={data.company} /> : null}
        {open?.kind === "boleta" && !slip ? <p className="text-sm text-muted">No hay cálculo para ese periodo.</p> : null}
        {open && open.kind !== "boleta" ? <DocBody doc={open} /> : null}
        {open?.status === "pendiente" ? (
          <Button
            className="mt-4"
            onClick={() => {
              signDocument(open.id);
              setOpen({ ...open, status: "firmado" });
              toast.success("Quedó marcado como firmado");
            }}
          >
            Marcar como firmado
          </Button>
        ) : null}
      </Modal>
    </Shell>
  );
}

function DocBody({ doc }: { doc: DocItem }) {
  const data = useHr();
  const emp = data.employees.find((e) => e.id === doc.employeeId);
  const company = data.company;
  if (doc.kind === "politica") {
    return (
      <div className="space-y-3 text-sm">
        <p>
          {company.name} ordena el tiempo de trabajo, los descansos y la documentación laboral de su personal en Moasist.
        </p>
        {doc.id.includes("vac") ? (
          <p>
            El personal del régimen general gana 30 días calendario de vacaciones por año de servicios, a razón de 2.5 días por mes. Pequeña empresa, microempresa y prácticas usan 15 días al año. La solicitud la aprueba la jefatura o Personas.
          </p>
        ) : null}
        {doc.id.includes("asi") ? (
          <p>
            La jornada de referencia es de lunes a viernes. La falta injustificada descuenta un treintavo de la remuneración. Las dos primeras horas extra del día se pagan con un recargo de 25% y las siguientes con 35%.
          </p>
        ) : null}
        {doc.id.includes("reg") || doc.title.toLowerCase().includes("reglamento") ? (
          <p>
            El ingreso, la subordinación y el cese se registran en la ficha. Este texto es un modelo de trabajo para la empresa y debe revisarlo su asesoría laboral antes de usarlo como reglamento oficial.
          </p>
        ) : null}
      </div>
    );
  }
  if (!emp) return <p className="text-sm text-muted">Sin colaborador asociado.</p>;
  if (doc.kind === "certificado") {
    return (
      <p className="text-sm">
        {company.name}, identificada con RUC {company.ruc}, certifica que {fullName(emp)} laboró como {emp.position} desde el {shortDate(emp.hireDate)}
        {emp.endDate ? ` hasta el ${shortDate(emp.endDate)}` : ""}.
      </p>
    );
  }
  return (
    <div className="space-y-3 text-sm">
      <p>
        {company.name} (RUC {company.ruc}), con domicilio en {company.address}, {company.city}, y {fullName(emp)}, identificado con DNI {emp.dni}, celebran un {CONTRACT_LABEL[emp.contract].toLowerCase()} para el cargo de {emp.position}.
      </p>
      <p>
        La remuneración mensual de referencia es {pen(emp.salary)}
        {emp.familyAllowance ? ", más asignación familiar," : ""} bajo {PENSION_LABEL[emp.pension]}. Fecha de inicio: {shortDate(emp.hireDate)}.
      </p>
      <p className="text-muted">Modelo editable. No sustituye un contrato suscrito ni un convenio de prácticas registrado.</p>
    </div>
  );
}
