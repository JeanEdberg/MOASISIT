import { buildContract, contractFileName, contractToHtml } from "@/lib/hr/contract";
import { Button } from "@/components/ui";
import type { Company, Employee } from "@/lib/hr/types";

/**
 * Vista del modelo de contrato: encabezado, cláusulas, cierre y firmas, tal
 * como lo generaría la empresa. Al pie recuerda que debe validarlo la asesoría
 * laboral.
 */
export function ContractView({ employee, company }: { employee: Employee; company: Company }) {
  const contract = buildContract(company, employee);

  function downloadWord() {
    const blob = new Blob([contractToHtml(company, employee)], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contractFileName(employee)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <div className="mb-3 flex justify-end">
        <Button tone="line" onClick={downloadWord}>
          Descargar Word
        </Button>
      </div>
      <header className="border-b border-line pb-4 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">{company.name}</p>
        <h3 className="mt-1 font-display text-lg leading-snug">{contract.title}</h3>
      </header>

      <p className="mt-4 whitespace-pre-line text-justify text-sm leading-relaxed">{contract.preamble}</p>

      <div className="mt-4 space-y-3">
        {contract.clauses.map((clause) => (
          <p key={clause.heading} className="text-justify text-sm leading-relaxed">
            <span className="font-semibold text-ink">{clause.heading} </span>
            {clause.body}
          </p>
        ))}
      </div>

      <p className="mt-4 text-justify text-sm leading-relaxed">{contract.closing}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="border-t border-ink pt-2 text-center text-xs">
          <p className="font-medium">{contract.signatures.employer}</p>
          <p className="text-muted">EL EMPLEADOR · RUC {contract.signatures.employerRuc}</p>
        </div>
        <div className="border-t border-ink pt-2 text-center text-xs">
          <p className="font-medium">{contract.signatures.worker}</p>
          <p className="text-muted">EL TRABAJADOR · DNI {contract.signatures.workerDni}</p>
        </div>
      </div>

      <p className="mt-6 rounded-md bg-surface-2 p-3 text-xs text-muted">{contract.disclaimer}</p>
    </article>
  );
}
