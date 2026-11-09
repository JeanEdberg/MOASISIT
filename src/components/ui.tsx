import { clsx, type ClassValue } from "clsx";
import { X } from "lucide-react";
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
}: {
  tone?: "line" | "clay" | "moss" | "ink";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        tone === "line" && "bg-surface-2 text-muted",
        tone === "clay" && "bg-clay text-clay-ink",
        tone === "moss" && "bg-moss text-moss-ink",
        tone === "ink" && "bg-ink text-clay-ink",
      )}
    >
      {children}
    </span>
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
