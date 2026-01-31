import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

/**
 * 🔹 Configuración Firebase
 */
const firebaseConfig = {
  apiKey: "AIzaSyBr4FXE5P3fHgzQd8r_-qXEQpSqq7Oiwhg",
  authDomain: "minthy-2eb71.firebaseapp.com",
  projectId: "minthy-2eb71",
  storageBucket: "minthy-2eb71.appspot.com",
  messagingSenderId: "258962875779",
  appId: "1:258962875779:web:67bb64aab170f1e5f902b6",
};

// 🔹 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * 🧹 Sanitiza un UID para que sea compatible con Firestore
 * Firestore no permite los caracteres: / . # $ [ ] =
 * Esta función debe usarse en TODOS los lugares donde se manipule un UID
 */
export function sanitizeUID(uid: string): string {
  return uid.replace(/[\/.#$\[\]=]/g, "_");
}

/**
 * 🔍 Busca un usuario por username y retorna su UUID
 * @param username Nombre de usuario a buscar
 * @returns UUID del usuario o null si no existe
 */
export async function getUserByUsername(username: string): Promise<string | null> {
  try {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // ⚠️ Detectar duplicados (no debería ocurrir, pero es crítico verificarlo)
    if (querySnapshot.docs.length > 1) {
      console.error(`⚠️ ADVERTENCIA CRÍTICA: Se encontraron ${querySnapshot.docs.length} usuarios con username="${username}"!`);
      console.error("⚠️ Esto puede causar problemas de consistencia. UUIDs encontrados:");
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.error(`   ${index + 1}. UUID: ${doc.id}, createdAt: ${data.createdAt?.toDate?.() || "sin fecha"}`);
      });
      console.error("⚠️ Se usará el PRIMER documento encontrado. IMPORTANTE: Elimina los duplicados manualmente en Firestore.");
    }

    // Retornar el ID del primer documento
    const userUUID = querySnapshot.docs[0].id;
    console.log(`🔍 getUserByUsername("${username}") → UUID: ${userUUID}`);
    return userUUID;
  } catch (error) {
    console.error("❌ Error buscando usuario por username:", error);
    return null;
  }
}

/**
 * 🔐 Registrar usuario directamente en Firestore
 * NUEVA ESTRUCTURA: Cada usuario tiene un UUID único como ID de documento
 * @returns UUID del usuario creado
 */
export async function registerUser(username: string, password: string) {
  try {
    // ✅ Verificar que el username no exista ya
    const existingUserUUID = await getUserByUsername(username);
    if (existingUserUUID) {
      throw new Error("El nombre de usuario ya está en uso");
    }

    // ✅ Generar UUID único para el usuario
    const userUUID = uuidv4();

    // ✅ Crear documento con UUID como ID
    const userRef = doc(db, "usuarios", userUUID);
    await setDoc(userRef, {
      username,
      password,
      createdAt: serverTimestamp(),
      tablero: {
        uid: null,
        vinculadoEn: null,
      },
    });

    console.log(`✅ Usuario registrado correctamente: ${username} (UUID: ${userUUID})`);
    return userUUID; // ✅ Retornar UUID en lugar de username
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    throw error;
  }
}

/**
 * 🔐 Iniciar sesión de usuario
 * NUEVA ESTRUCTURA: Busca por username y retorna el UUID del usuario
 * @returns UUID del usuario autenticado
 */
export async function loginUser(username: string, password: string) {
  try {
    // ✅ Buscar usuario por username
    const userUUID = await getUserByUsername(username);
    if (!userUUID) {
      throw new Error("Usuario no encontrado.");
    }

    // ✅ Obtener datos del usuario usando su UUID
    const userRef = doc(db, "usuarios", userUUID);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw new Error("Usuario no encontrado.");
    }

    const userData = snap.data();
    if (userData.password !== password) {
      throw new Error("Contraseña incorrecta.");
    }

    console.log(`✅ Usuario autenticado correctamente: ${username} (UUID: ${userUUID})`);
    return userUUID; // ✅ Retornar UUID en lugar de username
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    throw error;
  }
}

/**
 * 💾 Guardar datos de sensores en estructura jerárquica
 * Estructura:
 * usuarios/{userUUID}/sensores/{deviceUID}/mediciones/{fecha}
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 * @param deviceUID UID del dispositivo BLE
 * @param data Datos del sensor a guardar
 * @param simulatedDate Fecha simulada (opcional). Si no se provee, usa la fecha actual
 */
export async function saveSensorData(
  userUUID: string,
  deviceUID: string,
  data: Record<string, any>,
  simulatedDate?: string
) {
  try {
    if (!userUUID || !deviceUID) {
      throw new Error("Faltan parámetros obligatorios (userUUID o deviceUID).");
    }

    // ✅ Sanitizar el UID usando función centralizada
    const safeDeviceUID = sanitizeUID(deviceUID);

    // Usar fecha simulada si se proporciona, sino usar fecha actual
    const fecha = simulatedDate || new Date().toISOString().split("T")[0];

    // Ruta exacta: usuarios/{userUUID}/sensores/{safeDeviceUID}/mediciones/{fecha}
    const docRef = doc(
      db,
      `usuarios/${userUUID}/sensores/${safeDeviceUID}/mediciones/${fecha}`
    );

    // Datos con marca de tiempo
    const payload = {
      ...data,
      timestamp: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });

    console.log(
      `✅ Datos del sensor guardados correctamente en Firestore:
       usuarios/${userUUID}/sensores/${safeDeviceUID}/mediciones/${fecha}`
    );
  } catch (error) {
    console.error("❌ Error guardando datos del sensor:", error);
  }
}

/**
 * 🔑 Obtiene el UID del dispositivo vinculado al usuario
 * Si no existe, devuelve null
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 */
export async function getUserDeviceUID(userUUID: string): Promise<string | null> {
  try {
    const userDocRef = doc(db, "usuarios", userUUID);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const deviceUID = data?.tablero?.uid || null;

      if (deviceUID) {
        console.log(`✅ UID del dispositivo recuperado para usuario ${userUUID}: ${deviceUID}`);
        return deviceUID;
      }
    }

    console.log(`ℹ️ No hay UID de dispositivo guardado para usuario ${userUUID}`);
    return null;
  } catch (error) {
    console.error("❌ Error obteniendo UID del dispositivo:", error);
    return null;
  }
}

/**
 * 💾 Guarda el UID del dispositivo en el documento del usuario
 * Solo se guarda si no existe uno previamente (primera conexión)
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 */
export async function saveUserDeviceUID(userUUID: string, deviceUID: string): Promise<boolean> {
  try {
    // Sanitizar el UID usando función centralizada
    const safeDeviceUID = sanitizeUID(deviceUID);

    const userDocRef = doc(db, "usuarios", userUUID);

    // ✅ Verificar si ya existe un UID guardado
    const existingUID = await getUserDeviceUID(userUUID);

    if (existingUID) {
      console.log(`ℹ️ El usuario ${userUUID} ya tiene un UID guardado: ${existingUID}. No se sobrescribe.`);
      return false; // No se guardó porque ya existe
    }

    // Guardar en tablero.uid (solo si no existía)
    await setDoc(
      userDocRef,
      {
        tablero: {
          uid: safeDeviceUID,
          vinculadoEn: serverTimestamp(),
        },
      },
      { merge: true }
    );

    console.log(`✅ UID del dispositivo guardado para usuario ${userUUID}: ${safeDeviceUID}`);
    return true; // Se guardó correctamente
  } catch (error) {
    console.error("❌ Error guardando UID del dispositivo:", error);
    return false;
  }
}

/**
 * 🗑️ Elimina el UID del dispositivo vinculado del usuario
 * Permite al usuario desvincular su dispositivo actual
 * @param userUUID UUID del usuario (ID del documento en Firestore)
 */
export async function removeUserDeviceUID(userUUID: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, "usuarios", userUUID);

    // Eliminar el campo tablero.uid
    await setDoc(
      userDocRef,
      {
        tablero: {
          uid: null,
          desvinculadoEn: serverTimestamp(),
        },
      },
      { merge: true }
    );

    console.log(`✅ UID del dispositivo eliminado para usuario: ${userUUID}`);
    return true;
  } catch (error) {
    console.error("❌ Error eliminando UID del dispositivo:", error);
    return false;
  }
}

/**
 * 📊 Obtiene todos los datos de sensores para exportar a Excel
 * Estructura unificada: usuarios/{userUUID}/sensores/{deviceUID}/mediciones/{YYYY-MM-DD}
 * @param userUUID UUID del usuario
 * @param deviceUID UID del dispositivo
 * @returns Array de objetos con todos los datos de sensores
 */
export async function getAllSensorDataForExport(
  userUUID: string,
  deviceUID: string
): Promise<any[]> {
  try {
    const safeDeviceUID = sanitizeUID(deviceUID);

    // ✅ Leer de la colección unificada "mediciones"
    const colRef = collection(db, "usuarios", userUUID, "sensores", safeDeviceUID, "mediciones");
    const snapshot = await getDocs(colRef);

    const allData: any[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const fecha = docSnap.id; // YYYY-MM-DD

      // Obtener timestamp de Firestore
      let hora = "";
      let updatedAtText = "";
      if (data.timestamp) {
        const timestamp = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        hora = timestamp.toLocaleTimeString("es-CO", { hour12: false });
        updatedAtText = timestamp.toLocaleString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
          timeZoneName: "short"
        });
      }

      // 📊 Extraer valores normalizados (soporta estructura anidada y plana)
      const frecuenciaCardiaca = data.oximetro?.pulse ?? data.frecuenciaCardiaca ?? 0;
      const spo2Value = data.oximetro?.spo2 ?? data.spo2 ?? 0;
      const presionSistolica = data.presion?.sistolica ?? data.presionSistolica ?? 0;
      const presionDiastolica = data.presion?.diastolica ?? data.presionDiastolica ?? 0;
      const temperaturaValue = typeof data.temperatura === 'object'
        ? data.temperatura?.valor ?? 0
        : data.temperatura ?? 0;
      const pesoValue = typeof data.peso === 'object'
        ? data.peso?.valor ?? 0
        : data.peso ?? 0;
      const imcValue = typeof data.peso === 'object'
        ? data.peso?.imc ?? data.imc ?? ""
        : data.imc ?? "";

      // Agregar fila para frecuencia cardíaca
      if (frecuenciaCardiaca > 0) {
        allData.push({
          uid_usuario: safeDeviceUID,
          fecha: fecha,
          hora: hora,
          zona_horaria: "UTC-5",
          sensor: "frecuencia_cardiaca",
          valor_1: frecuenciaCardiaca,
          unidad_1: "lpm",
          valor_2: "",
          unidad_2: "",
          updatedAt_text: updatedAtText,
          observaciones: ""
        });
      }

      // Agregar fila para presión arterial
      if (presionSistolica > 0) {
        allData.push({
          uid_usuario: safeDeviceUID,
          fecha: fecha,
          hora: hora,
          zona_horaria: "UTC-5",
          sensor: "presion_arterial",
          valor_1: presionSistolica,
          unidad_1: "mmHg",
          valor_2: presionDiastolica || "",
          unidad_2: "mmHg",
          updatedAt_text: updatedAtText,
          observaciones: ""
        });
      }

      // Agregar fila para SpO2
      if (spo2Value > 0) {
        allData.push({
          uid_usuario: safeDeviceUID,
          fecha: fecha,
          hora: hora,
          zona_horaria: "UTC-5",
          sensor: "spo2",
          valor_1: spo2Value,
          unidad_1: "%",
          valor_2: "",
          unidad_2: "",
          updatedAt_text: updatedAtText,
          observaciones: ""
        });
      }

      // Agregar fila para temperatura
      if (temperaturaValue > 0) {
        allData.push({
          uid_usuario: safeDeviceUID,
          fecha: fecha,
          hora: hora,
          zona_horaria: "UTC-5",
          sensor: "temperatura",
          valor_1: temperaturaValue,
          unidad_1: "°C",
          valor_2: "",
          unidad_2: "",
          updatedAt_text: updatedAtText,
          observaciones: ""
        });
      }

      // Agregar fila para peso
      if (pesoValue > 0) {
        allData.push({
          uid_usuario: safeDeviceUID,
          fecha: fecha,
          hora: hora,
          zona_horaria: "UTC-5",
          sensor: "peso",
          valor_1: pesoValue,
          unidad_1: "kg",
          valor_2: imcValue,
          unidad_2: "IMC",
          updatedAt_text: updatedAtText,
          observaciones: ""
        });
      }
    });

    // Ordenar por fecha y hora
    allData.sort((a, b) => {
      const dateCompare = b.fecha.localeCompare(a.fecha);
      if (dateCompare !== 0) return dateCompare;
      return b.hora.localeCompare(a.hora);
    });

    console.log(`📊 Datos exportados: ${allData.length} registros`);
    return allData;
  } catch (error) {
    console.error("❌ Error obteniendo datos para exportar:", error);
    return [];
  }
}

export { app, db, auth };
