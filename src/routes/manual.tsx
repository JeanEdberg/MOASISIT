import { createFileRoute } from "@tanstack/react-router";
import { ManualDownloads } from "@/components/manual-downloads";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";

export const Route = createFileRoute("/manual")({ component: ManualPage });

const SECCIONES: { title: string; body: string }[] = [
  {
    title: "Personas",
    body: "Registra a tu equipo con el formulario o importa un CSV. Cada ficha guarda datos personales, régimen laboral, pensión, modalidad de trabajo y cuentas bancarias para sueldo y CTS.",
  },
  {
    title: "Asistencia",
    body: "El fichaje valida la ubicación según la modalidad del colaborador: presencial e híbrido exigen estar dentro de la geocerca de la oficina central, mientras que campo, virtual e itinerante registran sin geocerca estricta. Sin conexión, las marcas se guardan localmente y se sincronizan al volver la red.",
  },
  {
    title: "Vacaciones",
    body: "El saldo se calcula por régimen: 30 días al año en régimen general, 15 en pequeña empresa, microempresa y prácticas. Las solicitudes las aprueba la jefatura o Personas.",
  },
  {
    title: "Planilla y consolidados",
    body: "Calcula boletas con ONP o AFP, asignación familiar, quinta categoría, ESSALUD y CTS. La retención de quinta categoría se calcula sola cuando marcas al colaborador como afecto: proyecta su sueldo del año, resta la deducción fija y aplica la escala progresiva. El consolidado masivo reúne beneficios sociales por empresa para el depósito bancario.",
  },
  {
    title: "Renta de quinta categoría",
    body: "La deducción fija (7 UIT de referencia) y los tramos de la escala se editan en Empresa → Renta de quinta categoría. Ajusta la UIT en Parámetros de planilla cuando cambie la norma: el cálculo de cada boleta usa esos valores.",
  },
  {
    title: "Organización y empresa",
    body: "Define áreas y jerarquías por jefatura, y ajusta la razón social, el RUC y los parámetros de planilla desde Configuración.",
  },
];

function ManualPage() {
  return (
    <Shell>
      <PageHeader
        kicker="Guía"
        title="Manual de uso"
        lede="Un repaso rápido de los módulos de Moasist para operar la asistencia, las personas y la planilla."
      />
      <div className="space-y-3">
        {SECCIONES.map((s) => (
          <section key={s.title} className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-2xl">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </section>
        ))}
      </div>
      <ManualDownloads />
    </Shell>
  );
}
