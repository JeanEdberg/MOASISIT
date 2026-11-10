import { useCallback, useEffect, useState } from "react";
import { useHr } from "./store";
import { obtenerAsistenciasPendientes, limpiarAsistenciasPendientes } from "./offlineStore";

export function useOfflineSync() {
  const upsertAttendance = useHr((s) => s.upsertAttendance);
  const [sincronizando, setSincronizando] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(0);

  const sincronizarPendientes = useCallback(async () => {
    if (!navigator.onLine) return;

    setSincronizando(true);
    try {
      const pendientes = await obtenerAsistenciasPendientes();
      setPendientesCount(pendientes.length);

      if (pendientes.length > 0) {
        for (const marca of pendientes) {
          upsertAttendance(marca);
        }
        await limpiarAsistenciasPendientes(pendientes.map((p) => p.id));
        setPendientesCount(0);
      }
    } catch (error) {
      console.error("Error al sincronizar marcaciones offline:", error);
    } finally {
      setSincronizando(false);
    }
  }, [upsertAttendance]);

  useEffect(() => {
    sincronizarPendientes();
    window.addEventListener("online", sincronizarPendientes);
    return () => window.removeEventListener("online", sincronizarPendientes);
  }, [sincronizarPendientes]);

  return { sincronizando, pendientesCount, sincronizarPendientes };
}