import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Calculator,
  CalendarDays,
  Clock,
  Files,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Network,
  SlidersHorizontal,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Toaster } from "sonner";
import { cn } from "@/components/ui";
import { ChangeSecretModal } from "@/components/change-secret-modal";
import { LoginScreen } from "@/components/login-screen";
import { fullName, inkFor, longDate, HOY } from "@/lib/hr/format";
import { hydrateHr, useHr } from "@/lib/hr/store";
import type { ViewerMode } from "@/lib/hr/types";

type PlainTo =
  | "/"
  | "/colaboradores"
  | "/organizacion"
  | "/vacaciones"
  | "/asistencia"
  | "/planilla"
  | "/consolidado"
  | "/documentos"
  | "/empresa"
  | "/manual";

type Item = { to: PlainTo; label: string; icon: LucideIcon; exact?: boolean };

const RRHH: Item[] = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/colaboradores", label: "Personas", icon: Users },
  { to: "/organizacion", label: "Organización", icon: Network },
  { to: "/vacaciones", label: "Vacaciones", icon: CalendarDays },
  { to: "/asistencia", label: "Asistencia", icon: Clock },
  { to: "/planilla", label: "Planilla", icon: Landmark },
  { to: "/consolidado", label: "Consolidado Masivo", icon: Calculator },
  { to: "/documentos", label: "Documentos", icon: Files },
  { to: "/empresa", label: "Empresa", icon: SlidersHorizontal },
  { to: "/manual", label: "Manual", icon: BookOpen },
];

const JEFE: Item[] = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/colaboradores", label: "Equipo", icon: Users },
  { to: "/organizacion", label: "Organización", icon: Network },
  { to: "/vacaciones", label: "Vacaciones", icon: CalendarDays },
  { to: "/asistencia", label: "Asistencia", icon: Clock },
  { to: "/documentos", label: "Documentos", icon: Files },
  { to: "/manual", label: "Manual", icon: BookOpen },
];

const SELF: Item[] = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/vacaciones", label: "Vacaciones", icon: CalendarDays },
  { to: "/asistencia", label: "Asistencia", icon: Clock },
  { to: "/planilla", label: "Mi boleta", icon: Landmark },
  { to: "/documentos", label: "Documentos", icon: Files },
  { to: "/manual", label: "Manual", icon: BookOpen },
];

function itemsFor(mode: ViewerMode): Item[] {
  if (mode === "colaborador") return SELF;
  if (mode === "jefatura") return JEFE;
  return RRHH;
}

const ROLE_LABEL: Record<ViewerMode, string> = {
  rrhh: "Recursos Humanos",
  jefatura: "Jefatura",
  colaborador: "Colaborador",
};

export function Shell({ children }: { children: ReactNode }) {
  const company = useHr((s) => s.company);
  const employees = useHr((s) => s.employees);
  const viewer = useHr((s) => s.viewer);
  const session = useHr((s) => s.session);
  const hydrated = useHr((s) => s.hydrated);
  const signOut = useHr((s) => s.signOut);

  const [showChange, setShowChange] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const me = employees.find((e) => e.id === viewer.employeeId);
  const items = itemsFor(viewer.mode);
  const mark = (company.brandMark || company.brandName || "MO").trim().slice(0, 2).toUpperCase();
  const brand = company.brandName?.trim() || "Moasist";
  const theme = {
    "--brand": company.brandColor || "#0284c7",
    "--brand-ink": inkFor(company.brandColor || "#0284c7"),
    "--accent": company.accentColor || "#0369a1",
    "--accent-ink": inkFor(company.accentColor || "#0369a1"),
  } as CSSProperties;

  useEffect(() => {
    hydrateHr();
  }, []);

  useEffect(() => {
    document.title = `${brand} · Control de Asistencia y Planillas`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", company.brandColor || "#0284c7");
  }, [brand, company.brandColor]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950">
        Cargando…
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink" style={theme}>
      {(session.mustChange || showChange) && (
        <ChangeSecretModal forced={session.mustChange} onClose={session.mustChange ? undefined : () => setShowChange(false)} />
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <Link to="/" className="flex items-center gap-3 px-4 py-5">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-600 font-display text-xl font-bold text-white shadow-md">
            {mark}
          </span>
          <div className="flex flex-col">
            <span className="block font-display text-2xl leading-none font-bold text-slate-900 dark:text-white">{brand}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">INMOA Soluciones</span>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <SideLink key={item.to} item={item} pathname={pathname} />
          ))}
          {viewer.mode !== "rrhh" && viewer.employeeId ? (
            <Link
              to="/colaboradores/$id"
              params={{ id: viewer.employeeId }}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm",
                pathname === `/colaboradores/${viewer.employeeId}`
                  ? "bg-surface-2 font-medium text-ink"
                  : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <UserRound className="size-4" />
              Mi ficha
            </Link>
          ) : null}
        </nav>
        <p className="px-4 py-4 text-xs text-muted">Moasist v1.0 · Sistema Integral de Gestión</p>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sky-600 font-display font-bold text-white lg:hidden">
                {mark}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                {viewer.mode === "rrhh" ? (
                  <select
                    className="rounded-md border border-line bg-bg px-2 py-1 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={company.ruc}
                    onChange={(e) => useHr.getState().switchTenantCompany(e.target.value)}
                  >
                    <option value="20614684772">INMOA Logística y Soluciones E.I.R.L.</option>
                    <option value="20614684773">Los 7 Pollitos Inversiones E.I.R.L.</option>
                    <option value="20614684774">Inversiones y Negociaciones Plumífero E.I.R.L.</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-ink">{company.name}</p>
                )}
                <p className="px-1 text-xs text-muted">
                  RUC {company.ruc} · {longDate(HOY)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-ink">{session.displayName}</p>
                <p className="text-xs text-muted">{ROLE_LABEL[viewer.mode]}</p>
              </div>
              <button
                onClick={() => setShowChange(true)}
                className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
                title="Cambiar mi PIN / contraseña"
              >
                <KeyRound className="size-3.5" />
              </button>
              <button
                onClick={() => void signOut()}
                className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
                title="Cerrar sesión"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-5 pb-28 lg:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-line bg-surface px-2 py-2 lg:hidden">
        {items.map((item) => (
          <SideLink key={item.to} item={item} pathname={pathname} compact />
        ))}
        {viewer.mode !== "rrhh" && viewer.employeeId ? (
          <Link
            to="/colaboradores/$id"
            params={{ id: viewer.employeeId }}
            className={cn(
              "flex min-w-16 flex-col items-center gap-1 px-2 py-1 text-xs",
              pathname === `/colaboradores/${viewer.employeeId}` ? "text-sky-600" : "text-muted",
            )}
          >
            <UserRound className="size-5" />
            Ficha
          </Link>
        ) : null}
      </nav>
      <Toaster position="top-center" />
      <span className="sr-only">{me ? fullName(me) : session.displayName}</span>
    </div>
  );
}

function SideLink({ item, pathname, compact }: { item: Item; pathname: string; compact?: boolean }) {
  const on = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
  const Icon = item.icon;
  if (compact) {
    return (
      <Link
        to={item.to}
        className={cn("flex min-w-16 flex-col items-center gap-1 px-2 py-1 text-xs", on ? "font-medium text-sky-600" : "text-muted")}
      >
        <Icon className="size-5" />
        {item.label}
      </Link>
    );
  }
  return (
    <Link
      to={item.to}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm",
        on ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}
