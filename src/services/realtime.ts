import { db, sanitizeUID } from "./firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

/**
 * Escucha en tiempo real las mediciones más recientes del dispositivo BLE en Firestore.
 *
 * Estructura esperada:
 * usuarios/{userUUID}/sensores/{safeDeviceUID}/mediciones/{YYYY-MM-DD}
 *
 * Donde:
 *  - userUUID = UUID del usuario (ID del documento en Firestore)
 *  - safeDeviceUID = UID del BLE sanitizado (sin caracteres inválidos para Firestore)
 */
export const listenToRealtimeData = (
  userUUID: string,
  deviceUID: string,
  callback: (data: DocumentData | null) => void
) => {
  try {
    if (!userUUID || !deviceUID) {
      console.warn(
        "⚠️ listenToRealtimeData llamado sin userUUID o deviceUID:",
        userUUID,
        deviceUID
      );
      callback(null);
      return;
    }

    // 🔐 Sanear el UID del dispositivo usando función centralizada
    const safeDeviceUID = sanitizeUID(deviceUID);

    console.log(
      `📡 Escuchando datos en tiempo real de Firestore para: usuario=${userUUID}, dispositivo=${deviceUID}, safeDeviceUID=${safeDeviceUID}`
    );

    // 🔹 Referencia a la subcolección de mediciones
    // Ruta final (7 segmentos, válida): usuarios/{userUUID}/sensores/{safeDeviceUID}/mediciones
    const medicionesRef = collection(
      db,
      `usuarios/${userUUID}/sensores/${safeDeviceUID}/mediciones`
    );

    // 🔹 Consultar la última medición (ordenada por ID de documento, que es la fecha YYYY-MM-DD)
    const q = query(medicionesRef, orderBy("__name__", "desc"), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const rawData = doc.data();

          // 🔄 Normalizar datos: extraer valores de objetos anidados (oximetro, etc.)
          const normalizedData: Record<string, any> = {
            id: doc.id,
            timestamp: rawData.timestamp,
          };

          // 📊 Extraer datos del oxímetro si existen (estructura anidada)
          if (rawData.oximetro) {
            normalizedData.frecuenciaCardiaca = rawData.oximetro.pulse ?? 0;
            normalizedData.spo2 = rawData.oximetro.spo2 ?? 0;
            // pi (índice de perfusión) disponible si se necesita en el futuro
          }

          // 📊 Extraer datos de otros sensores si existen (estructura anidada)
          if (rawData.presion) {
            normalizedData.presionSistolica = rawData.presion.sistolica ?? 0;
            normalizedData.presionDiastolica = rawData.presion.diastolica ?? 0;
          }

          if (rawData.temperatura) {
            normalizedData.temperatura = typeof rawData.temperatura === 'object'
              ? rawData.temperatura.valor ?? 0
              : rawData.temperatura;
          }

          if (rawData.peso) {
            normalizedData.peso = typeof rawData.peso === 'object'
              ? rawData.peso.valor ?? 0
              : rawData.peso;
            if (typeof rawData.peso === 'object' && rawData.peso.imc) {
              normalizedData.imc = rawData.peso.imc;
            }
          }

          // 🔄 Mantener compatibilidad con estructura plana (campos directos)
          if (rawData.frecuenciaCardiaca !== undefined) {
            normalizedData.frecuenciaCardiaca = rawData.frecuenciaCardiaca;
          }
          if (rawData.spo2 !== undefined && !rawData.oximetro) {
            normalizedData.spo2 = rawData.spo2;
          }
          if (rawData.presionSistolica !== undefined) {
            normalizedData.presionSistolica = rawData.presionSistolica;
          }
          if (rawData.presionDiastolica !== undefined) {
            normalizedData.presionDiastolica = rawData.presionDiastolica;
          }
          if (rawData.temperatura !== undefined && typeof rawData.temperatura !== 'object') {
            normalizedData.temperatura = rawData.temperatura;
          }
          if (rawData.peso !== undefined && typeof rawData.peso !== 'object') {
            normalizedData.peso = rawData.peso;
          }

          console.log("✅ Nueva medición detectada en tiempo real:", {
            id: doc.id,
            rawData,
            normalizedData,
          });

          callback(normalizedData);
        } else {
          console.warn(
            "⚠️ No hay mediciones disponibles aún en Firestore para este dispositivo."
          );
          callback(null);
        }
      },
      (error) => {
        console.error("❌ Error al escuchar mediciones en Firestore:", error);
        callback(null);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("❌ Error crítico en listenToRealtimeData:", err);
    callback(null);
  }
};
