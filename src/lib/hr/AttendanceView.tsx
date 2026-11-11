import { AlertTriangle, CheckCircle2, LogIn, LogOut, MapPin, Radio, XCircle } from "lucide-react";
import { useState } from "react";
import { AlertBanner, Badge, Button, Card, SectionHeading } from "@/components/ui";
import { WORK_MODE_LABEL } from "@/lib/hr/format";
import { useHr } from "@/lib/hr/store";
import { validarYRegistrarAsistencia, type GeoLocation } from "./attendanceCalc";
import { guardarAsistenciaOffline } from "./offlineStore";
import { useOfflineSync } from "./useOfflineSync";

/**
 * Panel de fichaje del colaborador. Valida la modalidad laboral (geocerca para
 * presencial/híbrido, registro flexible para campo/virtual/itinerante) y guarda
 * en IndexedDB cuando no hay conexión, para sincronizar al recuperarla.
 */
export function AttendanceView() {
  const { employees, viewer, upsertAttendance } = useHr();
  const { sincronizando, pendientesCount, sincronizarPendientes } = useOfflineSync();

  const empleadoActual = employees.find((e) => e.id === viewer.employeeId) || employees[0];

  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [resultado, setResultado] = useState<{ aprobado: boolean; mensaje: string; offline?: boolean } | null>(null);

  const hoyStr = new Date().toISOString().split("T")[0];

  if (!empleadoActual) {
    return (
      <Card className="mx-auto max-w-xl p-6">
        <p className="text-sm text-muted">No hay un colaborador asociado a esta sesión.</p>
      </Card>
    );
  }

  const handleMarcarAsistencia = (tipoAccion: "entrada" | "salida") => {
    setCargandoGPS(true);
    setResultado(null);

    // Campo, virtual e itinerante no exigen geocerca física.
    const esPresencialOHibrido = empleadoActual.workMode === "presencial" || empleadoActual.workMode === "hibrido";

    if (!esPresencialOHibrido) {
      void procesarRegistro(validarYRegistrarAsistencia(empleadoActual), tipoAccion);
      return;
    }

    if (!navigator.geolocation) {
      setResultado({ aprobado: false, mensaje: "Tu dispositivo no soporta geolocalización GPS." });
      setCargandoGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacionActual: GeoLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
        void procesarRegistro(validarYRegistrarAsistencia(empleadoActual, ubicacionActual), tipoAccion);
      },
      () => {
        setResultado({ aprobado: false, mensaje: "No se pudo obtener la ubicación GPS. Verifica los permisos de ubicación." });
        setCargandoGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const procesarRegistro = async (
    evaluacion: ReturnType<typeof validarYRegistrarAsistencia>,
    tipoAccion: "entrada" | "salida",
  ) => {
    setCargandoGPS(false);

    if (!evaluacion.aprobado) {
      setResultado({ aprobado: false, mensaje: evaluacion.mensaje });
      return;
    }

    const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const nuevoRegistro = {
      id: `${empleadoActual.id}-${hoyStr}`,
      employeeId: empleadoActual.id,
      companyId: empleadoActual.companyId,
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
        offline: true,
        mensaje: "Registrado sin conexión. Quedó guardado en este dispositivo y se enviará al recuperar internet.",
      });
    } else {
      upsertAttendance(nuevoRegistro);
      setResultado({ aprobado: true, mensaje: evaluacion.mensaje });
    }
  };

  const geocerca = empleadoActual.workMode === "presencial" || empleadoActual.workMode === "hibrido";

  return (
    <Card className="mx-auto max-w-xl p-5 sm:p-6">
      {pendientesCount > 0 ? (
        <AlertBanner
          tone="warn"
          icon={Radio}
          className="mb-5"
          actions={
            <Button tone="line" onClick={sincronizarPendientes} disabled={sincronizando || !navigator.onLine}>
              {sincronizando ? "Sincronizando…" : "Sincronizar"}
            </Button>
          }
        >
          Tienes <strong className="text-warn">{pendientesCount}</strong> marcación(es) pendientes de enviar.
        </AlertBanner>
      ) : null}

      <SectionHeading
        icon={MapPin}
        title="Control de asistencia"
        description={`${empleadoActual.names} ${empleadoActual.paternal}`}
        actions={<Badge tone="info">{WORK_MODE_LABEL[empleadoActual.workMode]}</Badge>}
      />

      <p className="mt-3 text-xs text-muted">
        {geocerca
          ? "Tu modalidad exige validar la ubicación dentro del radio de la oficina central."
          : "Tu modalidad registra la marcación sin exigir ubicación física."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleMarcarAsistencia("entrada")}
          disabled={cargandoGPS}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg bg-ok px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-ok/90 disabled:opacity-50"
        >
          <LogIn className="size-6" aria-hidden />
          {cargandoGPS ? "Obteniendo GPS…" : "Marcar ingreso"}
        </button>
        <button
          type="button"
          onClick={() => handleMarcarAsistencia("salida")}
          disabled={cargandoGPS}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-danger-line bg-danger-soft px-4 py-4 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
        >
          <LogOut className="size-6" aria-hidden />
          {cargandoGPS ? "Obteniendo GPS…" : "Marcar salida"}
        </button>
      </div>

      {resultado ? (
        <AlertBanner
          tone={resultado.aprobado ? (resultado.offline ? "warn" : "ok") : "danger"}
          icon={resultado.aprobado ? CheckCircle2 : XCircle}
          className="mt-4"
          title={resultado.aprobado ? (resultado.offline ? "Guardado sin conexión" : "Marcación registrada") : "Marcación no válida"}
        >
          {resultado.mensaje}
        </AlertBanner>
      ) : null}

      <div className="mt-5 flex items-center justify-center gap-2 border-t border-line pt-4 text-xs text-muted">
        <AlertTriangle className="size-3.5" aria-hidden />
        Fecha del sistema: {hoyStr} · Moasist Geofencing
      </div>
    </Card>
  );
}
