import { buildContract } from "@/lib/hr/contract";
import type { Company, Employee } from "@/lib/hr/types";

/**
 * Vista del modelo de contrato. Muestra el documento completo (partes,
 * cláusulas y firma) tal como lo generaría la empresa. El texto es un modelo
 * editable: al pie se recuerda que debe validarlo la asesoría laboral.
 */
export function ContractView({ employee, company }: { employee: Employee; company: Company }) {
  const contract = buildContract(company, employee);
  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <header className="border-b border-line pb-4 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">{company.name}</p>
        <h3 className="mt-1 font-display text-xl">{contract.title}</h3>
      </header>

      <p className="mt-4 text-justify text-sm leading-relaxed">{contract.preamble}</p>

      <div className="mt-4 space-y-3">
        {contract.clauses.map((clause) => (
          <section key={clause.heading}>
            <h4 className="text-sm font-semibold text-ink">{clause.heading}</h4>
            <p className="mt-1 whitespace-pre-line text-justify text-sm leading-relaxed text-muted">{clause.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="border-t border-ink pt-2 text-center text-sm">
          <p className="font-medium">{contract.signatures.employer}</p>
          <p className="text-xs text-muted">Representante legal</p>
        </div>
        <div className="border-t border-ink pt-2 text-center text-sm">
          <p className="font-medium">{contract.signatures.worker}</p>
          <p className="text-xs text-muted">DNI {employee.dni}</p>
        </div>
      </div>

      <p className="mt-6 rounded-md bg-surface-2 p-3 text-xs text-muted">{contract.disclaimer}</p>
    </article>
  );
}
