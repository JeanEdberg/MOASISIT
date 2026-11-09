import { useState } from "react";
import { useHr } from "@/lib/hr/store";
import { ShieldCheck, UserCheck } from "lucide-react";

export function DniLoginModal({ onClose }: { onClose?: () => void }) {
  const employees = useHr((s) => s.employees);
  const setViewer = useHr((s) => s.setViewer);
  const company = useHr((s) => s.company);

  const [dniInput, setDniInput] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanDni = dniInput.trim();
    if (cleanDni.length !== 8) {
      setError("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    const found = employees.find((emp) => emp.dni === cleanDni);

    if (!found) {
      setError("DNI no registrado en la planilla de " + company.tradeName);
      return;
    }

    // Configuración de accesos especiales (RR.HH / Jefatura / Colaboradores)
    const dnisRrHH = ["47090484", "47720216"]; // Ericka y Jean Edberg
    const dnisJefatura = ["72853279"]; // Randy Chunga

    if (dnisRrHH.includes(found.dni)) {
      setViewer({ mode: "rrhh", employeeId: found.id });
    } else if (dnisJefatura.includes(found.dni)) {
      setViewer({ mode: "jefatura", employeeId: found.id });
    } else {
      setViewer({ mode: "colaborador", employeeId: found.id });
    }

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-sky-600 text-white font-display text-2xl font-bold shadow-lg mb-4">
            {company.brandMark || "MO"}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {company.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sistema de Control de Asistencia y Planillas · Moasist
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Ingrese su Número de DNI (8 dígitos)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={dniInput}
              onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej. 72853279"
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-center text-xl font-bold font-mono tracking-widest text-slate-900 shadow-inner focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 text-center bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-500 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="size-4" />
            Acceder a mi Portal
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-slate-300"
            >
              Cancelar / Cerrar
            </button>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Seguridad DNI Activa</span>
          <span className="flex items-center gap-1 text-sky-600 font-medium">
            <ShieldCheck className="size-3.5" /> RUC {company.ruc}
          </span>
        </div>
      </div>
    </div>
  );
}