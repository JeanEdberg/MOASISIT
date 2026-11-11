import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  GaugeCircle,
  Landmark,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/shell";
import { AlertBanner, Badge, Button, Card, ProgressBar, SectionHeading, StatCard } from "@/components/ui";
import { canSeeMoney, visibleEmployees } from "@/lib/hr/access";
import { ctsSemester, payslipsFor, vacationBalance, vacationPending } from "@/lib/hr/calc";
import {
  attendanceSummary,
  benefitsProjection,
  birthdaysInMonth,
  contractsExpiring,
  payrollTotals,
  vacationSummary,
} from "@/lib/hr/dashboard";
import {
  CONTRACT_LABEL,
  currentPeriod,
  fmtDays,
  fullName,
  greeting,
  HOY,
  MONTHS,
  pen,
  periodLabel,
  REGIME_LABEL,
  REQUEST_LABEL,
  shortDate,
  WORK_MODE_LABEL,
} from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import type { GlobalSummary } from "@/lib/hr/api";
import { useOfflineSync } from "@/lib/hr/useOfflineSync";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const mode = useHr((s) => s.viewer.mode);
  if (mode === "colaborador") return <ColaboradorDashboard />;
  if (mode === "jefatura") return <JefaturaDashboard />;
  return <AdminDashboard superadmin={mode === "superadmin"} />;
}

/* ─────────────────────────── Sincronización offline ─────────────────────────── */

function SyncBanner() {
  const { sincronizando, pendientesCount, sincronizarPendientes } = useOfflineSync();
  if (pendientesCount === 0) return null;
  return (
    <AlertBanner
      tone="warn"
      icon={AlertTriangle}
      className="mb-4"
      actions={
        <Button tone="line" onClick={sincronizarPendientes} disabled={sincronizando || !navigator.onLine}>
          {sincronizando ? "Sincronizando…" : "Sincronizar ahora"}
        </Button>
      }
    >
      Tienes <strong className="text-warn">{pendientesCount}</strong> marcación(es) guardadas sin conexión en este dispositivo.
    </AlertBanner>
  );
}

/* ─────────────────────────────── Superadmin / RR.HH. ─────────────────────────────── */

function AdminDashboard({ superadmin }: { superadmin: boolean }) {
  const data = useHr();
  const period = currentPeriod();
  const people = visibleEmployees(data.employees, data.viewer);
  const active = people.filter((e) => e.status === "activo");
  const me = data.employees.find((e) => e.id === data.viewer.employeeId);

  const slips = useMemo(
    () => payslipsFor(data, period).filter((p) => people.some((e) => e.id === p.employeeId)),
    [data, period, people],
  );
  const totals = useMemo(() => payrollTotals(slips), [slips]);
  const attendance = useMemo(() => attendanceSummary(data.attendance, period), [data.attendance, period]);
  const vac = useMemo(() => vacationSummary(active, data.requests, data.company), [active, data.requests, data.company]);
  const ending = useMemo(() => contractsExpiring(active, 120), [active]);
  const pending = data.requests.filter((r) => r.status === "pendiente" && people.some((e) => e.id === r.employeeId));
  const birthdays = useMemo(() => birthdaysInMonth(active, 11), [active]);
  const cts = active.reduce((s, e) => s + (ctsSemester(e, data.company, 2026, "nov") ?? 0), 0);

  const [global, setGlobal] = useState<GlobalSummary | null>(null);
  useEffect(() => {
    if (!superadmin) return;
    void useHr
      .getState()
      .getGlobalSummary()
      .then(setGlobal);
  }, [superadmin]);

  const chart = data.areas
    .map((a) => ({ name: a.name, n: active.filter((e) => e.areaId === a.id).length }))
    .filter((x) => x.n > 0);

  const hello = greeting(data.viewer.mode, data.company, me ? me.names : null);
  const attendanceRate = active.length
    ? Math.round(((attendance.presente + attendance.remoto) / Math.max(1, attendance.total)) * 100)
    : 0;

  return (
    <Shell>
      <SyncBanner />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-clay">
            {superadmin ? "Consolidado global" : "Gestión de personal"} · {periodLabel(period)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold text-ink">{hello}</h1>
            {me ? <Badge tone="ink">MODALIDAD: {me.workMode.toUpperCase()}</Badge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/asistencia"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ok px-4 text-sm font-semibold text-white transition-colors hover:bg-ok/90"
          >
            <Clock className="size-4" /> Fichar asistencia
          </Link>
          {superadmin ? (
            <Link
              to="/consolidado-asistencia"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-clay-ink transition-colors hover:bg-ink/90"
            >
              <GaugeCircle className="size-4" /> Consolidado mensual
            </Link>
          ) : null}
        </div>
      </div>

      {active.length === 0 ? (
        <EmptyTeam />
      ) : (
        <>
          <AlertsSection superadmin={superadmin} global={global} ending={ending.length} pending={pending.length} />

          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Personas activas"
              value={String(active.length)}
              hint={superadmin ? "en la empresa en curso" : "en tu empresa"}
              icon={Users}
              tone="brand"
            />
            <StatCard label="Neto a pagar" value={pen(totals.net)} hint={`${totals.count} boletas · ${periodLabel(period)}`} icon={Banknote} />
            <StatCard label="Renta 5ta del mes" value={pen(totals.fifth)} hint="retención de quinta categoría" icon={CircleDollarSign} />
            <StatCard
              label={superadmin ? "CTS noviembre" : "Solicitudes por revisar"}
              value={superadmin ? pen(cts) : String(pending.length)}
              hint={superadmin ? "provisión del semestre may–oct" : "vacaciones, permisos y descansos"}
              icon={superadmin ? Landmark : FileText}
            />
          </section>

          <section className="mt-4">
            <Card className="p-4">
              <SectionHeading
                icon={Clock}
                title="Asistencia del periodo"
                description={`Marcaciones registradas en ${periodLabel(period)}. Las faltas descuentan un treintavo; las dos primeras horas extra van al 25%.`}
                actions={
                  <Badge tone={attendanceRate >= 90 ? "ok" : attendanceRate >= 75 ? "warn" : "danger"}>{attendanceRate}% asistencia</Badge>
                }
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniStat icon={UserCheck} tone="ok" label="A tiempo / presente" value={String(attendance.presente)} />
                <MiniStat icon={Clock} tone="warn" label="Tardanzas" value={String(attendance.tardanza)} />
                <MiniStat icon={UserX} tone="danger" label="Faltas" value={String(attendance.falta)} />
                <MiniStat icon={TrendingUp} tone="info" label="Horas extra" value={`${attendance.extraHours} h`} />
              </div>
              <ProgressBar
                className="mt-4"
                label="Asistencia efectiva del periodo"
                value={attendance.presente + attendance.remoto}
                max={Math.max(1, attendance.total)}
                tone={attendanceRate >= 90 ? "ok" : attendanceRate >= 75 ? "warn" : "danger"}
              />
            </Card>
          </section>

          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <Card className="h-full p-4">
                <SectionHeading
                  icon={superadmin ? GaugeCircle : TrendingUp}
                  title={superadmin ? "Consolidado por empresa" : "Headcount por área"}
                  description={superadmin ? "Trabajadores activos y masa salarial del mes por cada empresa gestionada." : undefined}
                />
                {superadmin && global ? (
                  <ul className="mt-4 space-y-3">
                    {global.companies.map((c) => (
                      <li key={c.companyId} className="rounded-md border border-line p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full" style={{ background: c.brandColor }} aria-hidden />
                            <p className="text-sm font-medium text-ink">{c.tradeName || c.name}</p>
                          </div>
                          <Badge tone="line">{c.active} activos</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted">
                            Masa salarial: <span className="num font-medium text-ink">{pen(c.gross)}</span>
                          </span>
                          <span className="text-muted">
                            Neto: <span className="num font-medium text-ink">{pen(c.net)}</span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : chart.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">Todavía no hay áreas con personal.</p>
                ) : (
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart}>
                        <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis allowDecimals={false} width={24} tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)" }} />
                        <Bar dataKey="n" fill="var(--color-clay)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </section>

            <section className="lg:col-span-2">
              <Card className="h-full p-4">
                <SectionHeading icon={CalendarDays} title="Por aprobar" actions={<Badge tone={pending.length ? "warn" : "ok"}>{pending.length}</Badge>} />
                {pending.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No hay solicitudes abiertas en esta vista.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line">
                    {pending.slice(0, 5).map((r) => {
                      const who = data.employees.find((e) => e.id === r.employeeId);
                      return (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{who ? fullName(who) : "Colaborador"}</p>
                            <p className="text-sm text-muted">
                              {REQUEST_LABEL[r.kind]} · {shortDate(r.start)} – {shortDate(r.end)}
                            </p>
                          </div>
                          <Badge tone="warn">Pendiente</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Link to="/vacaciones" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-clay">
                  Abrir vacaciones →
                </Link>
              </Card>
            </section>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="p-4">
              <SectionHeading icon={CalendarDays} title="Vacaciones" />
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Saldo total del equipo</span>
                  <span className="num font-medium text-ink">{fmtDays(vac.balanceDays)} d</span>
                </div>
                <ProgressBar
                  label="Días gozados sobre acumulado"
                  value={vac.takenDays}
                  max={Math.max(1, vac.takenDays + vac.balanceDays)}
                  tone="brand"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">En trámite</span>
                  <span className="num font-medium text-ink">
                    {fmtDays(vac.pendingDays)} d · {vac.pendingRequests} solicitud(es)
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <SectionHeading icon={CalendarClock} title="Contratos por vencer" actions={<Badge tone={ending.length ? "warn" : "ok"}>{ending.length}</Badge>} />
              {ending.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Nadie vence en los próximos 120 días.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {ending.slice(0, 4).map(({ employee, days }) => (
                    <li key={employee.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-ink">{fullName(employee)}</span>
                        <span className="block truncate text-muted">{employee.position}</span>
                      </span>
                      <Badge tone={days <= 15 ? "danger" : "warn"}>{days} d</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-4">
              <SectionHeading icon={BadgeCheck} title={`Cumpleaños de ${MONTHS[10]}`} />
              {birthdays.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Sin cumpleaños este mes.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {birthdays.map((e) => (
                    <li key={e.id} className="flex justify-between gap-3">
                      <span className="truncate">{fullName(e)}</span>
                      <span className="text-muted">{shortDate(e.birthDate).replace(/ \d{4}$/, "")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </Shell>
  );
}

/** Bloque de alertas críticas: suscripciones (superadmin) y operativas. */
function AlertsSection({
  superadmin,
  global,
  ending,
  pending,
}: {
  superadmin: boolean;
  global: GlobalSummary | null;
  ending: number;
  pending: number;
}) {
  const alerts = global?.alerts ?? [];
  const danger = alerts.filter((a) => a.level === "danger");
  const warn = alerts.filter((a) => a.level === "warn");
  const hasAny = alerts.length > 0 || ending > 0 || pending > 0;
  if (!hasAny) return null;

  return (
    <section className="mt-5 space-y-2">
      {superadmin && danger.length > 0 ? (
        <AlertBanner tone="danger" icon={AlertTriangle} title={`${danger.length} suscripción(es) vencida(s)`}>
          <ul className="mt-1 space-y-1">
            {danger.map((a) => (
              <li key={a.companyId} className="text-sm">
                <span className="font-medium text-ink">{a.name}</span> — {a.detail}
              </li>
            ))}
          </ul>
        </AlertBanner>
      ) : null}

      {superadmin && warn.length > 0 ? (
        <AlertBanner tone="warn" icon={CalendarClock} title={`${warn.length} suscripción(es) por vencer`}>
          <ul className="mt-1 space-y-1">
            {warn.map((a) => (
              <li key={a.companyId} className="text-sm">
                <span className="font-medium text-ink">{a.name}</span> — {a.title}
              </li>
            ))}
          </ul>
        </AlertBanner>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {ending > 0 ? (
          <AlertBanner tone="warn" icon={CalendarClock} className="min-w-0 flex-1">
            <span className="text-sm">
              <strong className="text-warn">{ending}</strong> contrato(s) por vencer en los próximos 120 días.
            </span>
          </AlertBanner>
        ) : null}
        {pending > 0 ? (
          <AlertBanner tone="info" icon={FileText} className="min-w-0 flex-1">
            <span className="text-sm">
              <strong className="text-info">{pending}</strong> solicitud(es) esperando tu aprobación.
            </span>
          </AlertBanner>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────────── Jefatura ─────────────────────────────── */

function JefaturaDashboard() {
  const data = useHr();
  const period = currentPeriod();
  const people = visibleEmployees(data.employees, data.viewer).filter((e) => e.status === "activo");
  const me = data.employees.find((e) => e.id === data.viewer.employeeId);
  const attendance = useMemo(() => attendanceSummary(data.attendance, period), [data.attendance, period]);
  const pending = data.requests.filter((r) => r.status === "pendiente" && people.some((e) => e.id === r.employeeId));
  const hello = greeting(data.viewer.mode, data.company, me ? me.names : null);

  return (
    <Shell>
      <SyncBanner />
      <div>
        <p className="text-sm text-clay">Mi equipo · {periodLabel(period)}</p>
        <h1 className="mt-1 text-4xl font-bold text-ink">{hello}</h1>
      </div>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mi equipo" value={String(people.length)} hint="colaboradores a tu cargo" icon={Users} tone="brand" />
        <StatCard label="A tiempo / presente" value={String(attendance.presente)} hint={periodLabel(period)} icon={UserCheck} tone="ok" />
        <StatCard label="Tardanzas" value={String(attendance.tardanza)} hint="del periodo" icon={Clock} tone="warn" />
        <StatCard label="Por aprobar" value={String(pending.length)} hint="solicitudes de tu equipo" icon={FileText} />
      </section>
      <section className="mt-4">
        <Card className="p-4">
          <SectionHeading icon={FileText} title="Solicitudes de tu equipo" actions={<Badge tone={pending.length ? "warn" : "ok"}>{pending.length}</Badge>} />
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No hay solicitudes abiertas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {pending.map((r) => {
                const who = data.employees.find((e) => e.id === r.employeeId);
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{who ? fullName(who) : "Colaborador"}</p>
                      <p className="text-sm text-muted">
                        {REQUEST_LABEL[r.kind]} · {shortDate(r.start)} – {shortDate(r.end)}
                      </p>
                    </div>
                    <Badge tone="warn">Pendiente</Badge>
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/vacaciones" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-clay">
            Abrir vacaciones →
          </Link>
        </Card>
      </section>
    </Shell>
  );
}

/* ─────────────────────────────── Colaborador ─────────────────────────────── */

function ColaboradorDashboard() {
  const data = useHr();
  const period = currentPeriod();
  const me = data.employees.find((e) => e.id === data.viewer.employeeId);
  const myMarks = useMemo(() => data.attendance.filter((a) => a.employeeId === me?.id), [data.attendance, me?.id]);
  const attendance = useMemo(() => attendanceSummary(myMarks, period), [myMarks, period]);
  const slip = useMemo(
    () => (me ? (payslipsFor(data, period).find((p) => p.employeeId === me.id) ?? null) : null),
    [data, period, me],
  );
  const hello = greeting(data.viewer.mode, data.company, me ? me.names : null);
  const month = Number(HOY.slice(5, 7));
  const year = Number(HOY.slice(0, 4));
  const benefits = me ? benefitsProjection(me, data.company, year, month) : null;
  const balance = me ? vacationBalance(me, data.requests, HOY, data.company) : 0;
  const pendingVac = me ? vacationPending(me, data.requests) : 0;

  if (!me) {
    return (
      <Shell>
        <EmptyTeam />
      </Shell>
    );
  }

  return (
    <Shell>
      <SyncBanner />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-clay">{periodLabel(period)} · Mi portal personal</p>
          <h1 className="mt-1 text-4xl font-bold text-ink">{hello}</h1>
        </div>
        <Link
          to="/asistencia"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ok px-4 text-sm font-semibold text-white transition-colors hover:bg-ok/90"
        >
          <Clock className="size-4" /> Fichar asistencia
        </Link>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Asistencias del mes"
          value={String(attendance.presente + attendance.remoto)}
          hint="días presentes o remotos"
          icon={UserCheck}
          tone="ok"
        />
        <StatCard label="Tardanzas" value={String(attendance.tardanza)} hint="del mes en curso" icon={Clock} tone="warn" />
        <StatCard label="Faltas" value={String(attendance.falta)} hint="del mes en curso" icon={UserX} tone={attendance.falta ? "danger" : "neutral"} />
        <StatCard
          label="Saldo de vacaciones"
          value={`${fmtDays(balance)} d`}
          hint={`${fmtDays(pendingVac)} d en trámite`}
          icon={CalendarDays}
          tone="brand"
        />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeading icon={Landmark} title="Mis beneficios sociales" description="Fechas límite y montos proyectados según tu sueldo y régimen." />
          {benefits ? (
            <ul className="mt-4 space-y-3">
              <BenefitRow
                icon={Landmark}
                label={`CTS ${benefits.ctsSemester === "nov" ? "(may–oct)" : "(nov–abr)"}`}
                amount={pen(benefits.cts)}
                deadline={`Depósito hasta el ${shortDate(benefits.ctsDeadline)}`}
                tone="brand"
              />
              <BenefitRow
                icon={Banknote}
                label={`Gratificación ${benefits.gratuityKind === "navidad" ? "de Navidad" : "de julio"}`}
                amount={pen(benefits.gratuity)}
                deadline={`Pago hasta el ${shortDate(benefits.gratuityDeadline)}`}
                tone="ok"
              />
            </ul>
          ) : null}
          <p className="mt-3 text-xs text-muted">
            Cálculo referencial. Los montos definitivos dependen de los meses completos trabajados y de la planilla aprobada.
          </p>
        </Card>

        <Card className="p-4">
          <SectionHeading icon={ShieldCheck} title="Mi situación contractual" />
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Contrato" value={CONTRACT_LABEL[me.contract]} />
            <InfoRow label="Régimen" value={REGIME_LABEL[me.regime]} />
            <InfoRow label="Cargo" value={me.position} />
            <InfoRow label="Modalidad" value={WORK_MODE_LABEL[me.workMode]} />
            <InfoRow label="Ingreso" value={shortDate(me.hireDate)} />
            <InfoRow label="Estado" value={me.status === "activo" ? "Activo" : "Cesado"} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/documentos"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2"
            >
              <FileText className="size-4" /> Mis documentos
            </Link>
            <Link
              to="/planilla"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2"
            >
              <Download className="size-4" /> Mi boleta
            </Link>
          </div>
        </Card>
      </div>

      {slip && canSeeMoney(data.viewer, me.id) ? (
        <section className="mt-4">
          <Card className="p-4">
            <SectionHeading
              icon={CircleDollarSign}
              title="Mi boleta del mes"
              actions={
                <Link to="/planilla" className="text-sm font-medium text-clay">
                  Ver detalle →
                </Link>
              }
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat icon={Banknote} tone="neutral" label="Ingresos" value={pen(slip.gross)} />
              <MiniStat icon={FileText} tone="warn" label="Descuentos" value={pen(slip.discounts)} />
              <MiniStat icon={BadgeCheck} tone="ok" label="Neto a pagar" value={pen(slip.net)} />
            </div>
          </Card>
        </section>
      ) : null}
    </Shell>
  );
}

/* ─────────────────────────────── Piezas ─────────────────────────────── */

type IconType = typeof Users;

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconType;
  label: string;
  value: string;
  tone: "neutral" | "ok" | "warn" | "danger" | "info" | "brand";
}) {
  const chip: Record<string, string> = {
    neutral: "bg-surface-2 text-muted",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
    brand: "bg-clay/10 text-clay",
  };
  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2/60 p-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-md ${chip[tone]}`} aria-hidden>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted">{label}</p>
        <p className="num font-display text-xl leading-tight text-ink">{value}</p>
      </div>
    </div>
  );
}

function BenefitRow({
  icon: Icon,
  label,
  amount,
  deadline,
  tone,
}: {
  icon: IconType;
  label: string;
  amount: string;
  deadline: string;
  tone: "brand" | "ok";
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-line p-3">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-md ${tone === "brand" ? "bg-clay/10 text-clay" : "bg-ok-soft text-ok"}`}
          aria-hidden
        >
          <Icon className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-muted">{deadline}</p>
        </div>
      </div>
      <p className="num font-display text-xl text-ink">{amount}</p>
    </li>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function EmptyTeam() {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
      <p className="font-display text-2xl text-ink">Todavía no hay colaboradores</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">Carga a tu equipo desde Personas, con el formulario o un archivo CSV.</p>
      <Link to="/colaboradores" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-clay px-4 text-sm font-medium text-clay-ink">
        Ir a Personas
      </Link>
    </div>
  );
}
