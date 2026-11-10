import { pen, periodLabel, fullName, PENSION_LABEL } from "@/lib/hr/format";
import type { Company, Employee, Payslip } from "@/lib/hr/types";

export function BoletaView({
  slip,
  employee,
  company,
}: {
  slip: Payslip;
  employee: Employee;
  company: Company;
}) {
  const ingresos = slip.lines.filter((l) => l.kind === "ingreso");
  const descuentos = slip.lines.filter((l) => l.kind === "descuento");
  const aportes = slip.lines.filter((l) => l.kind === "aporte");
  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          {company.logo ? (
            <img
              src={company.logo}
              alt={`Logo de ${company.name}`}
              className="mb-2 h-12 w-auto max-w-48 object-contain"
            />
          ) : null}
          <p className="font-display text-2xl leading-none">{company.brandName || "Moasist"}</p>
          <p className="mt-2 text-sm font-medium">{company.name}</p>
          <p className="text-xs text-muted">RUC {company.ruc}</p>
          <p className="text-xs text-muted">
            {company.address}, {company.city}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-muted">Boleta de pago</p>
          <p className="font-display text-xl">{periodLabel(slip.period)}</p>
          <p className="text-xs text-muted">{employee.code}</p>
        </div>
      </header>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Colaborador</dt>
          <dd className="font-medium">{fullName(employee)}</dd>
        </div>
        <div>
          <dt className="text-muted">DNI</dt>
          <dd className="num">{employee.dni}</dd>
        </div>
        <div>
          <dt className="text-muted">Cargo</dt>
          <dd>{employee.position}</dd>
        </div>
        <div>
          <dt className="text-muted">Régimen pensionario</dt>
          <dd>{PENSION_LABEL[employee.pension]}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <LineTable title="Ingresos" rows={ingresos.map((l) => [l.name, pen(l.amount)])} />
        <LineTable title="Descuentos" rows={descuentos.map((l) => [l.name, pen(l.amount)])} />
      </div>
      <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-3">
        <Sum label="Total ingresos" value={pen(slip.gross)} />
        <Sum label="Total descuentos" value={pen(slip.discounts)} />
        <Sum label="Neto a pagar" value={pen(slip.net)} strong />
      </div>
      {aportes.length ? (
        <div className="mt-4 rounded-md bg-surface-2 px-3 py-3 text-sm">
          <p className="text-muted">Aportes del empleador, no se descuentan del neto</p>
          {aportes.map((l) => (
            <p key={l.code} className="mt-1 flex justify-between gap-3">
              <span>{l.name}</span>
              <span className="num">{pen(l.amount)}</span>
            </p>
          ))}
          {slip.cappedPension ? (
            <p className="mt-2 text-xs text-muted">La base AFP se topó en {pen(company.topeAfp)}.</p>
          ) : null}
        </div>
      ) : null}
      {slip.cts !== null ? (
        <p className="mt-4 text-sm">
          CTS del semestre a depositar: <span className="num font-medium">{pen(slip.cts)}</span>
          <span className="text-muted"> · no forma parte del neto de esta boleta.</span>
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted">
        Estimación de referencia con los parámetros de la empresa. No es una boleta electrónica ni reemplaza el PLAME.
      </p>
    </article>
  );
}

function LineTable({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section>
      <h3 className="text-lg">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Sin conceptos.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {rows.map(([name, amount]) => (
            <li key={name} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{name}</span>
              <span className="num">{amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Sum({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <p>
      <span className="block text-muted">{label}</span>
      <span className={strong ? "num font-display text-2xl" : "num font-medium"}>{value}</span>
    </p>
  );
}
