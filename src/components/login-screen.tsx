import { useState } from "react";
import { useHr } from "@/lib/hr/store";
import { Button, Field, fieldClass } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldCheck } from "lucide-react";

/**
 * Sign-in screen. Employees use DNI + PIN; the admin uses email + password.
 * The role is decided by the server from the credential — never chosen here.
 */
export function LoginScreen() {
  const signIn = useHr((s) => s.signIn);
  const [mode, setMode] = useState<"employee" | "admin">("employee");
  const [login, setLogin] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn(login, secret);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "No se pudo ingresar.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <BrandLogo size={72} className="mb-3" />
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Moasist</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Control de Asistencia y Planillas
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("employee");
              setError("");
            }}
            className={`rounded-md px-3 py-2 text-xs font-semibold ${mode === "employee" ? "bg-white text-sky-700 shadow dark:bg-slate-900" : "text-slate-500"}`}
          >
            Colaborador
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError("");
            }}
            className={`rounded-md px-3 py-2 text-xs font-semibold ${mode === "admin" ? "bg-white text-sky-700 shadow dark:bg-slate-900" : "text-slate-500"}`}
          >
            Administración
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <Field label={mode === "employee" ? "DNI (8 dígitos)" : "Correo"}>
            <input
              className={fieldClass}
              type={mode === "employee" ? "text" : "email"}
              inputMode={mode === "employee" ? "numeric" : "email"}
              maxLength={mode === "employee" ? 8 : undefined}
              value={login}
              onChange={(e) => setLogin(mode === "employee" ? e.target.value.replace(/\D/g, "") : e.target.value)}
              placeholder={mode === "employee" ? "Ej. 72853279" : "correo@dominio.com"}
              autoComplete="username"
              autoFocus
            />
          </Field>
          <Field label={mode === "employee" ? "PIN" : "Contraseña"} hint={mode === "employee" ? "PIN temporal entregado por RR.HH." : undefined}>
            <input
              className={fieldClass}
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="current-password"
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-center text-xs font-semibold text-rose-600">{error}</p>
          ) : null}

          <Button type="submit" disabled={busy} className="w-full justify-center">
            <ShieldCheck className="size-4" />
            {busy ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400 dark:border-slate-800">
          Ingresa con tu DNI y PIN. Acceso restringido.
        </p>
      </div>
    </div>
  );
}
