import React, { useState } from "react";
import { useHr } from "@/lib/hr/store";
import { validarYRegistrarAsistencia, GeoLocation } from "./attendanceCalc";
import { guardarAsistenciaOffline } from "./offlineStore";
import { useOfflineSync } from "./useOfflineSync";

export function AttendanceView() {
  const { employees, viewer, upsertAttendance } = useHr();
  const { sincronizando, pendientesCount, sincronizarPendientes } = useOfflineSync();
  
  // Identificar al colaborador actual según el visor (Viewer)
  const empleadoActual = employees.find((e) => e.id === viewer.employeeId) || employees[0];

  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [resultado, setResultado] = useState<{ aprobado: boolean; mensaje: string } | null>(null);

  const hoyStr = new Date().toISOString().split("T")[0];

  const handleMarcarAsistencia = (tipoAccion: "entrada" | "salida") => {
    setCargandoGPS(true);
    setResultado(null);

    // Si el modo NO es presencial ni híbrido (es itinerante, campo o virtual), pasa directo sin exigir geocerca física
    const esPresencialOHibrido = empleadoActual.workMode === "presencial" || empleadoActual.workMode === "hibrido";

    if (!esPresencialOHibrido) {
      const evaluacion = validarYRegistrarAsistencia(empleadoActual);
      procesarRegistro(evaluacion, tipoAccion);
      return;
    }

    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta geolocalización GPS.");
      setCargandoGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacionActual: GeoLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        const evaluacion = validarYRegistrarAsistencia(empleadoActual, ubicacionActual);
        procesarRegistro(evaluacion, tipoAccion);
      },
      (error) => {
        alert("No se pudo obtener la ubicación GPS. Verifica los permisos de ubicación en tu dispositivo.");
        setCargandoGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const procesarRegistro = async (evaluacion: any, tipoAccion: "entrada" | "salida") => {
    setCargandoGPS(false);

    if (evaluacion.aprobado) {
      const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const nuevoRegistro = {
        id: `${empleadoActual.id}-${hoyStr}`,
        employeeId: empleadoActual.id,
        date: hoyStr,
        kind: evaluacion.kind,
        checkIn: tipoAccion === "entrada" ? horaActual : "08:30",
        checkOut: tipoAccion === "salida" ? horaActual : "18:00",
        extra25: 0,
        extra35: 0,
      };

      if (!navigator.onLine) {
        await guardarAsistenciaOffline(nuevoRegistro);
        setResultado({
          aprobado: true,
          mensaje: "📡 Registrado en modo offline. Guardado localmente en IndexedDB.",
        });
      } else {
        upsertAttendance(nuevoRegistro);
        setResultado({
          aprobado: evaluacion.aprobado,
          mensaje: evaluacion.mensaje,
        });
      }
    } else {
      setResultado({
        aprobado: false,
        mensaje: evaluacion.mensaje,
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 max-w-xl mx-auto space-y-6">
      {pendientesCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>Tienes <strong>{pendientesCount}</strong> marcación(es) pendientes de sincronizar.</span>
          </div>
          <button
            onClick={sincronizarPendientes}
            disabled={sincronizando || !navigator.onLine}
            className="px-2 py-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
          >
            {sincronizando ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        </div>
      )}

      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-slate-900">Control de Asistencia Biométrico / GPS</h2>
        <p className="text-sm text-slate-500">Colaborador: <span className="font-semibold text-slate-700">{empleadoActual.names} {empleadoActual.paternal}</span></p>
        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          Modalidad asignada: <span className="uppercase">{empleadoActual.workMode}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleMarcarAsistencia("entrada")}
          disabled={cargandoGPS}
          className="p-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-2xl">📥</span>
          {cargandoGPS ? "Obteniendo GPS..." : "Marcar Ingreso"}
        </button>

        <button
          onClick={() => handleMarcarAsistencia("salida")}
          disabled={cargandoGPS}
          className="p-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-2xl">📤</span>
          {cargandoGPS ? "Obteniendo GPS..." : "Marcar Salida"}
        </button>
      </div>

      {resultado && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${resultado.aprobado ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
          <div className="font-bold mb-1">{resultado.aprobado ? "✅ Registro Exitoso" : "❌ Marcación Denegada"}</div>
          {resultado.mensaje}
        </div>
      )}

      <div className="text-xs text-slate-400 text-center pt-2 border-t">
        Fecha del sistema: {hoyStr} | Moasist Geofencing Engine v2.6
      </div>
    </div>
  );
}