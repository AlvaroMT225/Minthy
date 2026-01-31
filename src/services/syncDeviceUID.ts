import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * 🔄 Sincroniza el UID BLE detectado con el usuario autenticado
 * - Actualiza el campo tablero.uid en el documento del usuario
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 * @param deviceUID UID del dispositivo BLE a vincular
 */
export const syncDeviceUID = async (userUUID: string, deviceUID: string) => {
  if (!userUUID || !deviceUID) {
    console.warn("⚠️ syncDeviceUID: Faltan parámetros (userUUID o deviceUID).");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", userUUID);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // 🧠 Verificar si el UID ya está asignado
      if (userData.tablero?.uid !== deviceUID) {
        await updateDoc(userRef, {
          tablero: {
            uid: deviceUID,
            vinculadoEn: new Date().toISOString(),
          },
        });
        console.log(`🔗 UID BLE actualizado para usuario ${userUUID}: ${deviceUID}`);
      } else {
        console.log(`🩵 Usuario ${userUUID} ya vinculado al UID ${deviceUID}`);
      }
    } else {
      console.error(`❌ Usuario ${userUUID} no existe en Firestore. No se puede vincular dispositivo.`);
    }
  } catch (err) {
    console.error("❌ Error en syncDeviceUID:", err);
  }
};
