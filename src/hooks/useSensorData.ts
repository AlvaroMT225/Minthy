import { useEffect, useState } from "react";
import { listenToRealtimeData } from "../services/realtime";

export interface SensorData {
  temperatura: number;
  spo2: number;
  frecuenciaCardiaca: number;
  peso: number;
  presionSistolica: number;
  presionDiastolica: number;
}

/**
 * Hook personalizado para escuchar mediciones en tiempo real desde Firestore.
 * 🔹 Solo usa la colección `mediciones`
 * 🔹 No genera datos falsos
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 * @param uid UID del dispositivo BLE
 */
export const useSensorData = (userUUID?: string, uid?: string) => {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userUUID || !uid) {
      setError("Usuario o dispositivo no definido");
      setLoading(false);
      return;
    }

    const unsubscribe = listenToRealtimeData(userUUID, uid, (snapshotData) => {
      if (snapshotData) {
        setData(snapshotData as SensorData);
        setError(null);
      } else {
        setData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [userUUID, uid]);

  return { data, loading, error };
};
