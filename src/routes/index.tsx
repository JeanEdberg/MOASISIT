import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui";
import { canSeeMoney, isCompanyAdmin, visibleEmployees } from "@/lib/hr/access";
import { ctsSemester, payslipsFor, vacationBalance, vacationPending } from "@/lib/hr/calc";
import {
  currentPeriod,
  fmtDays,
  fullName,
  greeting,
  HOY,
  parseDay,
  pen,
  periodLabel,
  REQUEST_LABEL,
  shortDate,
} from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import { useOfflineSync } from "@/lib/hr/useOfflineSync";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const data = useHr();
  const period = currentPeriod();
  const people = visibleEmployees(data.employees, data.viewer);
  const me = data.employees.find((e) => e.id === data.viewer.employeeId);
  const active = people.filter((e) => e.status === "activo");

  // Hook de sincronización fuera de línea para alertas en el dashboard
  const { sincronizando, pendientesCount, sincronizarPendientes } = useOfflineSync();

  const slips = useMemo(
    () => payslipsFor(data, period).filter((p) => people.some((e) => e.id === p.employeeId)),
    [data, period, people],
  );
  const neto = slips.reduce((s, p) => s + p.net, 0);
  const bruto = slips.reduce((s, p) => s + p.gross, 0);
  const cts = active.reduce((s, e) => s + (ctsSemester(e, data.company, 2026, "nov") ?? 0), 0);
  const pending = data.requests.filter(
    (r) => r.status === "pendiente" && people.some((e) => e.id === r.employeeId),
  );
  const birthdays = active.filter((e) => e.birthDate.slice(5, 7) === "11");
  const ending = active
    .filter((e) => e.endDate)
    .map((e) => ({ e, days: differenceInCalendarDays(parseDay(e.endDate as string), parseDay(HOY)) }))
    .filter((x) => x.days >= 0 && x.days <= 120)
    .sort((a, b) => a.days - b.days);

  // Mapeo dinámico de asistencias de la semana actual
  const hoyStr = new Date().toISOString().split("T")[0];
  const asistenciasHoy = data.attendance.filter((a) => a.date === hoyStr && people.some((e) => e.id === a.employeeId));
  const faltasSemana = data.attendance.filter((a) => a.kind === "falta" && people.some((e) => e.id === a.employeeId)).length;
  const tardanzasSemana = data.attendance.filter((a) => a.kind === "tardanza" && people.some((e) => e.id === a.employeeId)).length;

  const chart = data.areas
    .map((a) => ({
      name: a.name,
      n: data.employees.filter((e) => e.areaId === a.id && e.status === "activo").length,
    }))
    .filter((x) => x.n > 0);

  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const hello = greeting(data.viewer.mode, data.company, me ? me.names : null);
  const showMoney = isCompanyAdmin(data.viewer.mode) || data.viewer.mode === "colaborador";

  return (
    <Shell>
      {/* Banner de Sincronización Offline si hay pendientes en el dispositivo */}
      {pendientesCount > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>Tienes <strong>{pendientesCount}</strong> marcación(es) almacenada(s) fuera de línea en el celular.</span>
          </div>
          <button
            onClick={sincronizarPendientes}
            disabled={sincronizando || !navigator.onLine}
            className="px-2.5 py-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
          >
            {sincronizando ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-clay">{periodLabel(period)} · Moasist Geofencing Engine v2.6</p>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-4xl font-bold">{hello}</h1>
            {me && (
              <Badge tone="ink">
                MODALIDAD: {me.workMode.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Acceso rápido a fichaje para colaboradores */}
        <div className="flex gap-2">
          <Link
            to="/asistencia"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm text-sm transition-all"
          >
            <span>📥</span> Fichar Asistencia
          </Link>
          {isCompanyAdmin(data.viewer.mode) && (
            <Link
              to="/consolidado-asistencia"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-sm text-sm transition-all"
            >
              <span>📊</span> Consolidado Mensual
            </Link>
          )}
        </div>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-muted">
        {isCompanyAdmin(data.viewer.mode)
          ? `${data.company.tradeName} tiene la planilla de noviembre abierta, el control de tardanzas sincronizado y el depósito de CTS del semestre en puerta.`
          : data.viewer.mode === "jefatura"
            ? "Revisa a tu equipo, las marcaciones de campo/itinerantes de la semana y lo que está esperando tu aprobación."
            : "Desde aquí ves tu estado de marcación de hoy, tu saldo de vacaciones y tus boletas de pago."}
      </p>

      {active.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-display text-2xl">Todavía no hay colaboradores</p>
          <p className="mt-2 text-sm text-muted">Carga a tu equipo desde Personas, con el formulario o un CSV.</p>
          <Link to="/colaboradores" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-clay px-4 text-sm text-clay-ink">
            Ir a personas
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Personas activas" value={String(active.length)} hint={isCompanyAdmin(data.viewer.mode) ? "en toda la empresa" : "en tu vista"} />
            
            {showMoney ? (
              <Stat label="Neto a pagar" value={pen(neto)} hint={periodLabel(period)} />
            ) : (
              <Stat label="Marcaciones de hoy" value={`${asistenciasHoy.length} / ${active.length}`} hint={`${tardanzasSemana} tardanzas esta semana`} />
            )}

            <Stat label="Solicitudes por revisar" value={String(pending.length)} hint="vacaciones, permisos y descansos" />
            
            {data.viewer.mode === "colaborador" && me ? (
              <Stat label="Saldo de vacaciones" value={`${fmtDays(vacationBalance(me, data.requests))} d`} hint={`${fmtDays(vacationPending(me, data.requests))} en trámite`} />
            ) : (
              <Stat label="CTS noviembre" value={pen(cts)} hint="semestre mayo – octubre" />
            )}
          </section>

          {isCompanyAdmin(data.viewer.mode) ? (
            <section className="mt-3 rounded-lg border border-line border-l-4 border-l-clay bg-surface px-4 py-3 text-sm">
              <p className="font-medium">Depósito de CTS hasta el 15 de noviembre</p>
              <p className="text-muted">
                La provisión referencial del semestre es {pen(cts)}. El bruto de boletas del mes va en {pen(bruto)} (descuentos por {faltasSemana} falta(s) integrados automáticamente).
              </p>
            </section>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            <section className="rounded-lg border border-line bg-surface p-4 lg:col-span-3">
              <h2 className="text-2xl">Por aprobar</h2>
              {pending.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No hay solicitudes abiertas en esta vista.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {pending.map((r) => {
                    const who = data.employees.find((e) => e.id === r.employeeId);
                    return (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div>
                          <p className="text-sm font-medium">{who ? fullName(who) : "Colaborador"}</p>
                          <p className="text-sm text-muted">
                            {REQUEST_LABEL[r.kind]} · {shortDate(r.start)} – {shortDate(r.end)}
                          </p>
                        </div>
                        <Badge tone="clay">Pendiente</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link to="/vacaciones" className="mt-2 inline-flex min-h-11 items-center text-sm text-clay">
                Abrir vacaciones
              </Link>
            </section>

            <section className="rounded-lg border border-line bg-surface p-4 lg:col-span-2">
              <h2 className="text-2xl">{isCompanyAdmin(data.viewer.mode) ? "Headcount por área" : "Agenda"}</h2>
              {isCompanyAdmin(data.viewer.mode) && wide ? (
                <div className="mt-3 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart}>
                      <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis allowDecimals={false} width={24} tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="n" fill="var(--color-clay)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {chart.map((c) => (
                    <li key={c.name} className="flex justify-between">
                      <span>{c.name}</span>
                      <span className="num">{c.n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-line bg-surface p-4">
              <h2 className="text-2xl">Cumpleaños de noviembre</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {birthdays.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span>{fullName(e)}</span>
                    <span className="text-muted">{shortDate(e.birthDate).replace(/ \d{4}$/, "")}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            <section className="rounded-lg border border-line bg-surface p-4">
              <h2 className="text-2xl">Contratos por vencer</h2>
              {ending.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Nadie de esta vista vence en los próximos 120 días.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {ending.map(({ e, days }) => (
                    <li key={e.id} className="flex items-center justify-between gap-3">
                      <span>
                        {fullName(e)}
                        <span className="block text-muted">{e.position}</span>
                      </span>
                      <span className="num text-muted">{days} días</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {showMoney && me && canSeeMoney(data.viewer, me.id) ? (
            <p className="mt-4 text-sm text-muted">
              Tu boleta de {periodLabel(period).toLowerCase()} está en{" "}
              <Link to="/planilla" className="text-clay">
                Planilla
              </Link>
              .
            </p>
          ) : null}
        </>
      )}
    </Shell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-2 font-display text-2xl leading-none">{value}</p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </article>
  );
}