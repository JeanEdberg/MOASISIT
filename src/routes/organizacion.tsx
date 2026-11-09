import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { fullName, initials, ageTone } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { Employee } from "@/lib/hr/types";

export const Route = createFileRoute("/organizacion")({ component: OrgPage });

const TONES = {
  clay: "bg-clay text-clay-ink",
  moss: "bg-moss text-moss-ink",
  ink: "bg-ink text-clay-ink",
};

function OrgPage() {
  const employees = useHr((s) => s.employees);
  const areas = useHr((s) => s.areas);
  const [tab, setTab] = useState<"arbol" | "areas">("arbol");
  const active = employees.filter((e) => e.status === "activo");
  const roots = active.filter((e) => !e.managerId || !active.some((x) => x.id === e.managerId));

  return (
    <Shell>
      <PageHeader
        kicker="Estructura"
        title="Organización"
        lede="Jerarquía por jefatura y distribución por área. Los sueldos no se muestran en esta vista."
      />
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setTab("arbol")} className={`min-h-11 rounded-md px-3 text-sm ${tab === "arbol" ? "bg-ink text-clay-ink" : "bg-surface text-muted"}`}>
          Jerarquía
        </button>
        <button type="button" onClick={() => setTab("areas")} className={`min-h-11 rounded-md px-3 text-sm ${tab === "areas" ? "bg-ink text-clay-ink" : "bg-surface text-muted"}`}>
          Áreas
        </button>
      </div>
      {tab === "arbol" ? (
        <div className="space-y-4">
          {roots.map((r) => (
            <Tree key={r.id} node={r} all={active} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {areas.map((a) => {
            const members = active.filter((e) => e.areaId === a.id);
            return (
              <section key={a.id} className="rounded-lg border border-line bg-surface p-4">
                <h2 className="text-2xl">{a.name}</h2>
                <p className="text-sm text-muted">{members.length} personas</p>
                <ul className="mt-3 space-y-2">
                  {members.map((m) => (
                    <li key={m.id}>
                      <PersonChip emp={m} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function Tree({ node, all }: { node: Employee; all: Employee[] }) {
  const kids = all.filter((e) => e.managerId === node.id);
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <PersonChip emp={node} />
      {kids.length ? (
        <div className="mt-3 grid gap-3 border-l border-line pl-4 sm:grid-cols-2">
          {kids.map((k) => (
            <Tree key={k.id} node={k} all={all} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PersonChip({ emp }: { emp: Employee }) {
  return (
    <Link to="/colaboradores/$id" params={{ id: emp.id }} className="flex items-center gap-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-md text-sm ${TONES[ageTone(emp.id)]}`}>{initials(emp)}</span>
      <span>
        <span className="block text-sm font-medium">{fullName(emp)}</span>
        <span className="block text-xs text-muted">{emp.position}</span>
      </span>
    </Link>
  );
}
