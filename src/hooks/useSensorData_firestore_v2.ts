import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export interface SensorData {
  temperatura: number;
  humedad: number;
  ppm: number;
  spo2?: number;
  glucosa?: number;
  peso?: number;
  presionSistolica?: number;
  presionDiastolica?: number;
  timestamp?: string;
}

export function useSensorData() {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Obtener el userUUID desde localStorage (guardado por useSession)
    const userUUID = localStorage.getItem("userId"); // Ahora contiene el UUID del usuario
    const deviceUID = localStorage.getItem("deviceUID");

    if (!userUUID || !deviceUID) {
      setError("UUID de usuario o dispositivo no disponible");
      setLoading(false);
      return;
    }

    try {
      // ✅ Estructura: usuarios/{userUUID}/sensores/{deviceUID}/mediciones
      const medicionesRef = collection(db, "usuarios", userUUID, "sensores", deviceUID, "mediciones");
      const q = query(medicionesRef, orderBy("timestamp", "desc"), limit(1));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as SensorData;
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}
