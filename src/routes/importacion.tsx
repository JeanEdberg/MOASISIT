import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Download, FileCode2, FileSpreadsheet, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Badge, Button, Card, Modal, PageHeader, SectionHeading } from "@/components/ui";
import { currentPeriod } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import {
  buildExampleLine,
  buildFieldGuideCsv,
  DESTINATION_HINT,
  IMPORT_DESTINATIONS,
  importStructuresByDestination,
  resolveFileNames,
  type ImportDestination,
  type ImportFile,
  type ImportStructure,
} from "@/lib/hr/sunat-imports";

export const Route = createFileRoute("/importacion")({ component: ImportPage });

const DESTINATION_TONE: Record<ImportDestination, "clay" | "moss" | "info"> = {
  "T-Registro": "clay",
  PLAME: "moss",
  Derechohabientes: "info",
};

function ImportPage() {
  const company = useHr((s) => s.company);
  const [tab, setTab] = useState<ImportDestination>("T-Registro");
  const [open, setOpen] = useState<{ structure: ImportStructure; file: ImportFile } | null>(null);

  const period = currentPeriod();
  const parts = { ruc: company.ruc, period };
  const list = useMemo(() => importStructuresByDestination(tab), [tab]);

  const downloadText = (name: string, text: string) => {
    const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell>
      <PageHeader
        kicker="SUNAT"
        title="Importación"
        lede="Plantillas de importación del Anexo 3 de SUNAT para T-Registro y la Planilla Mensual (PLAME). Cada tarjeta trae el nombre exacto del archivo, dónde se sube y todos los campos con su tipo, longitud y códigos. Sirve de guía para llenar tus archivos; la descarga es una hoja de ayuda, no el archivo para subir."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {IMPORT_DESTINATIONS.map((d) => (
          <Button key={d} tone={tab === d ? "primary" : "line"} onClick={() => setTab(d)}>
            {d}
          </Button>
        ))}
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-clay" aria-hidden />
        <p>{DESTINATION_HINT[tab]}</p>
      </div>

      <SectionHeading
        icon={ClipboardList}
        title={`${list.length} plantilla${list.length === 1 ? "" : "s"} de ${tab}`}
        description="Abre una plantilla para ver el detalle de campos y descargar la guía de llenado."
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={DESTINATION_TONE[s.destination]}>{s.id}</Badge>
                  <span className="text-xs text-muted">Estructura {s.code}</span>
                </div>
                <h3 className="mt-2 font-display text-lg leading-tight text-ink">{s.title}</h3>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{s.purpose}</p>

            <ul className="mt-3 space-y-1">
              {resolveFileNames(s, parts).map((name, i) => (
                <li key={name} className="flex items-center gap-2 font-mono text-xs text-ink">
                  <FileCode2 className="size-3.5 shrink-0 text-clay" aria-hidden />
                  <span className="truncate" title={name}>
                    {name}
                  </span>
                  {s.files[i]?.purpose ? (
                    <span className="truncate font-sans text-muted" title={s.files[i]?.purpose}>
                      · {s.files[i]?.purpose}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 pt-1">
              {s.files.map((f, i) => (
                <Button
                  key={f.fileName}
                  tone="line"
                  className="min-h-9 px-3 text-xs"
                  onClick={() => setOpen({ structure: s, file: f })}
                >
                  {s.files.length > 1 ? `Ver campos (${i + 1})` : "Ver campos"}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(open)}
        title={open ? `${open.structure.id} · ${open.structure.title}` : "Plantilla"}
        onClose={() => setOpen(null)}
        wide
      >
        {open ? <StructureDetail structure={open.structure} file={open.file} parts={parts} onDownload={downloadText} /> : null}
      </Modal>
    </Shell>
  );
}

function StructureDetail({
  structure,
  file,
  parts,
  onDownload,
}: {
  structure: ImportStructure;
  file: ImportFile;
  parts: { ruc: string; period: string };
  onDownload: (name: string, text: string) => void;
}) {
  const fileName = resolveFileNames(structure, parts)[structure.files.indexOf(file)] ?? file.fileName;
  const example = buildExampleLine(file);

  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(example);
      toast.success("Orden de campos copiado");
    } catch {
      toast.error("No se pudo copiar; selecciona el texto manualmente");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-line bg-surface-2 px-3 py-2">
        <p className="text-xs text-muted">Nombre del archivo</p>
        <p className="font-mono text-sm text-ink">{fileName}</p>
        <p className="mt-2 text-xs text-muted">Destino: {structure.destination}</p>
      </div>

      <p className="text-sm text-muted">{structure.purpose}</p>

      <div className="flex flex-wrap gap-2">
        <Button
          tone="line"
          onClick={() => onDownload(`${structure.id}-guia-campos.csv`, buildFieldGuideCsv(structure, file))}
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          Descargar guía de campos (CSV)
        </Button>
        <Button tone="line" onClick={copyExample}>
          <ClipboardList className="size-4" aria-hidden />
          Copiar orden de campos
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Long.</th>
              <th className="px-3 py-2">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {file.fields.map((f) => (
              <tr key={f.n} className="border-t border-line align-top">
                <td className="px-3 py-2 font-mono text-xs text-muted">{f.n}</td>
                <td className="px-3 py-2 text-ink">{f.name}</td>
                <td className="px-3 py-2 text-muted">{f.type}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted">{f.length ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{f.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-line bg-surface-2 px-3 py-2">
        <p className="text-xs text-muted">Orden de los campos (ejemplo)</p>
        <p className="mt-1 break-words font-mono text-xs text-ink">{example}</p>
      </div>

      {structure.notes?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted">
          {structure.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-muted">
        <Download className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        El archivo que sube a SUNAT lleva solo los datos, sin fila de encabezado. Esta guía es una ayuda de digitación.
      </p>
    </div>
  );
}
