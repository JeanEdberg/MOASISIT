import { useState } from "react";
import { useHr } from "@/lib/hr/store";
import { Button, Field, fieldClass } from "@/components/ui";
import { KeyRound, ShieldAlert } from "lucide-react";

/**
 * Forced secret change shown on first sign-in (`mustChange`) or on demand.
 * Employees set a new PIN (min 6 digits); the admin sets a password (min 10
 * chars with mixed character classes).
 */
export function ChangeSecretModal({ forced, onClose }: { forced: boolean; onClose?: () => void }) {
  const session = useHr((s) => s.session);
  const changeSecret = useHr((s) => s.changeSecret);
  const isAdmin = session?.kind === "admin";
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const rules = isAdmin
    ? "Mínimo 10 caracteres, con mayúscula, minúscula y número."
    : "Mínimo 6 dígitos. No uses tu nombre ni tu fecha de nacimiento.";

  const valid = (s: string): string | null => {
    if (isAdmin) {
      if (s.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
      if (!/[A-Z]/.test(s) || !/[a-z]/.test(s) || !/\d/.test(s)) return "Incluye mayúscula, minúscula y número.";
      return null;
    }
    if (!/^\d{6,}$/.test(s)) return "El PIN debe tener al menos 6 dígitos.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rule = valid(a);
    if (rule) {
      setError(rule);
      return;
    }
    if (a !== b) {
      setError("Los valores no coinciden.");
      return;
    }
    setBusy(true);
    const res = await changeSecret(a);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo actualizar.");
      return;
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-amber-500 text-white shadow-lg">
            {forced ? <ShieldAlert className="size-7" /> : <KeyRound className="size-7" />}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {forced ? "Cambia tu acceso temporal" : "Cambiar acceso"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAdmin ? "Define una contraseña robusta para tu cuenta." : "Reemplaza tu PIN temporal por uno propio."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={isAdmin ? "Nueva contraseña" : "Nuevo PIN"}>
            <input className={fieldClass} type="password" value={a} onChange={(e) => setA(e.target.value)} autoFocus />
          </Field>
          <Field label="Repite" hint={rules}>
            <input className={fieldClass} type="password" value={b} onChange={(e) => setB(e.target.value)} />
          </Field>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-center text-xs font-semibold text-rose-600">{error}</p>
          ) : null}

          <Button type="submit" disabled={busy} className="w-full justify-center">
            {busy ? "Guardando…" : "Guardar"}
          </Button>

          {!forced && onClose ? (
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              Cancelar
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
