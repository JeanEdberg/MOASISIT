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
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-overlay">
        <div className="flex flex-col items-center text-center">
          <BrandLogo size={72} className="mb-3" />
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Moasist</h2>
          <p className="mt-1 text-xs text-muted">Control de Asistencia y Planillas</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("employee");
              setError("");
            }}
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === "employee" ? "bg-surface text-clay shadow-card" : "text-muted"}`}
          >
            Colaborador
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError("");
            }}
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === "admin" ? "bg-surface text-clay shadow-card" : "text-muted"}`}
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
              placeholder={mode === "employee" ? "Ej. 12345678" : "correo@dominio.com"}
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
            <p className="rounded-lg border border-danger-line bg-danger-soft p-2.5 text-center text-xs font-semibold text-danger">{error}</p>
          ) : null}

          <Button type="submit" disabled={busy} className="w-full justify-center">
            <ShieldCheck className="size-4" />
            {busy ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>

        <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
          Ingresa con tu DNI y PIN. Acceso restringido.
        </p>
      </div>
    </div>
  );
}
