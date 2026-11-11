import { clsx, type ClassValue } from "clsx";
import { X, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fieldClass =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function PageHeader({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker ? <p className="text-sm text-clay">{kicker}</p> : null}
        <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
        {lede ? <p className="mt-2 max-w-2xl text-sm text-muted">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Button({
  tone = "primary",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "line" | "ghost" | "moss" | "danger";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50",
        tone === "primary" && "bg-clay text-clay-ink hover:bg-ink",
        tone === "moss" && "bg-moss text-moss-ink hover:bg-ink",
        tone === "line" && "border border-line bg-surface text-ink hover:bg-surface-2",
        tone === "ghost" && "text-ink hover:bg-surface-2",
        tone === "danger" && "border border-line bg-surface text-clay hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  tone = "line",
  children,
  className,
}: {
  tone?: "line" | "clay" | "moss" | "ink" | "ok" | "warn" | "danger" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        tone === "line" && "bg-surface-2 text-muted",
        tone === "clay" && "bg-clay text-clay-ink",
        tone === "moss" && "bg-moss text-moss-ink",
        tone === "ink" && "bg-ink text-clay-ink",
        tone === "ok" && "bg-ok-soft text-ok",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "danger" && "bg-danger-soft text-danger",
        tone === "info" && "bg-info-soft text-info",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tarjeta base: superficie con borde y sombra sutil, coherente en todo el producto. */
export function Card({
  className,
  children,
  as: As = "section",
}: {
  className?: string;
  children: ReactNode;
  as?: "section" | "article" | "div";
}) {
  return <As className={cn("rounded-lg border border-line bg-surface shadow-card", className)}>{children}</As>;
}

export type Tone = "neutral" | "ok" | "warn" | "danger" | "info" | "brand";

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-muted",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  info: "text-info",
  brand: "text-clay",
};

const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  brand: "bg-clay/10 text-clay",
};

/** Punto de estado, para listas y encabezados. */
export function StatusDot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  const fill: Record<Tone, string> = {
    neutral: "bg-muted",
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
    info: "bg-info",
    brand: "bg-clay",
  };
  return <span className={cn("size-2.5 shrink-0 rounded-full", fill[tone], className)} aria-hidden />;
}

/**
 * Tarjeta de métrica ("stat card") del dashboard: etiqueta, valor grande y una
 * línea de contexto. El icono y el acento de color son opcionales para marcar
 * alertas (vencido, por vencer, al día).
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-raised",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon ? (
          <span className={cn("grid size-8 place-items-center rounded-md", TONE_CHIP[tone])} aria-hidden>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className={cn("num mt-3 font-display text-3xl leading-none", tone === "neutral" ? "text-ink" : TONE_TEXT[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}

/** Encabezado de sección con acciones alineadas a la derecha. */
export function SectionHeading({
  title,
  description,
  actions,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-surface-2 text-clay" aria-hidden>
            <Icon className="size-4.5" />
          </span>
        ) : null}
        <div>
          <h2 className="font-display text-xl leading-tight text-ink">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Barra de progreso para avance de metas (vacaciones gozadas, sincronización, etc.). */
export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  const fill: Record<Tone, string> = {
    neutral: "bg-muted",
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
    info: "bg-info",
    brand: "bg-clay",
  };
  return (
    <div className={className}>
      {label ? <p className="mb-1 text-xs text-muted">{label}</p> : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full transition-[width]", fill[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * Aviso destacado (banner) para alertas críticas y estados de sincronización.
 * El icono y el color cambian con el tono; el contenido es libre.
 */
export function AlertBanner({
  tone = "info",
  icon: Icon,
  title,
  children,
  actions,
  className,
}: {
  tone?: Exclude<Tone, "brand"> | "brand";
  icon?: LucideIcon;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const surface: Record<string, string> = {
    neutral: "border-line bg-surface-2",
    ok: "border-ok-line bg-ok-soft",
    warn: "border-warn-line bg-warn-soft",
    danger: "border-danger-line bg-danger-soft",
    info: "border-info-line bg-info-soft",
    brand: "border-line bg-surface-2",
  };
  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border p-3", surface[tone], className)}>
      {Icon ? <Icon className={cn("size-5 shrink-0", TONE_TEXT[tone === "brand" ? "brand" : tone])} aria-hidden /> : null}
      <div className="min-w-0 flex-1 text-sm">
        {title ? <p className={cn("font-medium", TONE_TEXT[tone === "brand" ? "brand" : tone])}>{title}</p> : null}
        {children ? <div className={cn(title ? "mt-0.5 text-muted" : "text-muted")}>{children}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-lg border border-line bg-surface p-5",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-md hover:bg-surface-2" aria-label="Cerrar diálogo">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{lede}</p>
    </div>
  );
}
