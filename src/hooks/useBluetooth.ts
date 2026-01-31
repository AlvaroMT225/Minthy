import { useEffect, useState } from "react";
import useConnection from "../store/useConnection";
import useSession from "../store/useSession";
import { saveUserDeviceUID, getUserDeviceUID, sanitizeUID } from "../services/firebase";

/**
 * 🩵 Hook para gestionar conexión BLE con el Gateway Raspberry Pi
 *
 * ARQUITECTURA:
 * 1. La app busca el dispositivo "Minthy Gateway" (Raspberry Pi)
 * 2. Se conecta al servicio BLE del gateway
 * 3. Envía el UUID del usuario al gateway
 * 4. El gateway usa ese UUID para enviar datos a Firestore
 * 5. La app escucha cambios en Firestore
 */

// =========================================================
//  UUIDs del servicio BLE del Gateway (Raspberry Pi)
// =========================================================
const GATEWAY_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const CHAR_USER_UUID_UUID = "0000fff1-0000-1000-8000-00805f9b34fb"; // WRITE - Para enviar UUID del usuario
const CHAR_STATUS_UUID = "0000fff2-0000-1000-8000-00805f9b34fb"; // READ - Estado del gateway
const CHAR_GATEWAY_UID_UUID = "0000fff3-0000-1000-8000-00805f9b34fb"; // READ - UID del gateway

// Nombre del gateway para identificarlo en el escaneo (solo informativo; no se usa en filtros por typings)
const GATEWAY_NAME = "Minthy Gateway";

// UID fijo del gateway (debe coincidir con el de la Raspberry Pi)
const EXPECTED_GATEWAY_UID = "Y3fHnWSvKv9tKjqaQBVjKQ__";

export const useBluetooth = () => {
  const { uid, status, setUid, setStatus, clearConnection } = useConnection();
  const session = useSession();
  const [error, setError] = useState<string | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<string>("unknown");

  // 🔁 Restaurar UID del BLE al cargar app
  useEffect(() => {
    const loadUID = async () => {
      if (uid) return;

      const userDisconnected = localStorage.getItem("userDisconnected");
      if (userDisconnected === "true") {
        console.log("ℹ️ Usuario desconectado previamente. NO se reconecta automáticamente.");
        return;
      }

      const userUUID = (session as any)?.user?.uid || localStorage.getItem("userId");
      if (!userUUID) return;

      const firestoreUID = await getUserDeviceUID(userUUID);
      if (firestoreUID) {
        setUid(firestoreUID);
        setStatus("connected");
        localStorage.setItem("deviceUID", firestoreUID);
        console.log("✅ UID restaurado desde Firestore:", firestoreUID);
        return;
      }

      console.log("ℹ️ No hay UID guardado en Firestore. Usuario debe conectar con el Gateway.");
    };

    loadUID();
  }, [uid, setUid, setStatus, session]);

  /**
   * 🔵 Conectar con el Gateway Raspberry Pi via BLE
   * 1. Selecciona el dispositivo BLE (filtrado por servicio del gateway)
   * 2. Conecta al servicio GATT
   * 3. Lee el Gateway UID
   * 4. Envía el UUID del usuario
   */
  const connectBLE = async () => {
    try {
      setStatus("connecting");
      setError(null);

      // Obtener datos del usuario actual
      const userUUID = (session as any)?.user?.uid || localStorage.getItem("userId");

      const username =
        (session as any)?.user?.username || localStorage.getItem("username") || "usuario-desconocido";

      if (!userUUID) {
        throw new Error("No hay usuario autenticado");
      }

      localStorage.removeItem("userDisconnected");

      console.log(`🔍 Buscando Gateway Minthy para ${username} (UUID: ${userUUID})...`);

      // =========================================================
      //  PASO 1: Buscar y seleccionar el Gateway Raspberry Pi
      // =========================================================
      let device: BluetoothDevice;

      try {
        /**
         * NOTA IMPORTANTE:
         * Tus typings actuales solo aceptan { services } dentro de cada filter.
         * Por eso NO se usan 'name' ni 'namePrefix' aquí.
         */
        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [GATEWAY_SERVICE_UUID] }],
          optionalServices: [GATEWAY_SERVICE_UUID],
        });
      } catch (filterError) {
        console.log("⚠️ No se encontró gateway con filtro por servicio. Intentando búsqueda general...");

        // Fallback: búsqueda general (el usuario selecciona manualmente)
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [GATEWAY_SERVICE_UUID],
        });
      }

      console.log(`📡 Dispositivo seleccionado: ${device.name || device.id}`);

      // =========================================================
      //  PASO 2: Conectar al servidor GATT
      // =========================================================
      console.log("🔗 Conectando a GATT...");

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("No se pudo conectar al servidor GATT");
      }

      console.log("✅ Conectado a GATT");

      // =========================================================
      //  PASO 3: Obtener el servicio del Gateway
      // =========================================================
      let gatewayUID: string = EXPECTED_GATEWAY_UID;

      try {
        const service = await server.getPrimaryService(GATEWAY_SERVICE_UUID);
        console.log("✅ Servicio del Gateway encontrado");

        // =========================================================
        //  PASO 4: Leer el Gateway UID
        // =========================================================
        try {
          const gatewayUIDChar = await service.getCharacteristic(CHAR_GATEWAY_UID_UUID);
          const gatewayUIDValue = await gatewayUIDChar.readValue();
          gatewayUID = new TextDecoder().decode(gatewayUIDValue).replace(/\0/g, "").trim();
          console.log(`📱 Gateway UID leído: ${gatewayUID}`);
        } catch (readError) {
          console.log(`⚠️ No se pudo leer Gateway UID. Usando valor esperado: ${EXPECTED_GATEWAY_UID}`);
          gatewayUID = EXPECTED_GATEWAY_UID;
        }

        // (Opcional) Validación del UID del gateway esperado
        if (gatewayUID && gatewayUID !== EXPECTED_GATEWAY_UID) {
          throw new Error(
            `Dispositivo BLE no corresponde al Gateway Minthy esperado. Esperado: ${EXPECTED_GATEWAY_UID} | Recibido: ${gatewayUID}`
          );
        }

        // =========================================================
        //  PASO 5: Enviar el UUID del usuario al Gateway (WRITE)
        // =========================================================
        try {
          const userUUIDChar = await service.getCharacteristic(CHAR_USER_UUID_UUID);
          const encoder = new TextEncoder();
          await userUUIDChar.writeValue(encoder.encode(userUUID));
          console.log(`✅ UUID del usuario enviado al Gateway: ${userUUID}`);
        } catch (writeError) {
          console.log("⚠️ No se pudo enviar UUID al gateway:", writeError);
          // Continuar de todas formas - el gateway puede tener el UUID guardado
        }

        // =========================================================
        //  PASO 6: Leer estado del Gateway (opcional)
        // =========================================================
        try {
          const statusChar = await service.getCharacteristic(CHAR_STATUS_UUID);
          const statusValue = await statusChar.readValue();
          const statusText = new TextDecoder().decode(statusValue).replace(/\0/g, "").trim();
          setGatewayStatus(statusText);
          console.log(`📊 Estado del Gateway: ${statusText}`);
        } catch (statusError) {
          console.log("⚠️ No se pudo leer estado del gateway");
        }
      } catch (serviceError) {
        // El dispositivo no tiene el servicio del gateway
        console.log("⚠️ El dispositivo seleccionado no expone el servicio del Gateway Minthy:", serviceError);
        throw new Error("El dispositivo seleccionado no es el Gateway Minthy.");
      }

      // =========================================================
      //  PASO 7: Guardar la configuración
      // =========================================================
      const finalUID = sanitizeUID(gatewayUID);

      setUid(finalUID);
      setStatus("connected");
      localStorage.setItem("deviceUID", finalUID);

      // Guardar en Firestore
      const saved = await saveUserDeviceUID(userUUID, finalUID);
      if (saved) {
        console.log(`💾 UID guardado en Firestore para ${username}`);
      }

      console.log("🩵 Conectado exitosamente con UID:", finalUID);
      return finalUID;
    } catch (err: any) {
      console.error("Error BLE:", err);

      if (err.name === "NotFoundError") {
        setError("No se encontró el Gateway Minthy. Asegúrate de que está encendido.");
      } else if (err.message?.includes("User cancelled")) {
        setError("Conexión cancelada por el usuario");
      } else if (typeof err?.message === "string") {
        setError(err.message);
      } else {
        setError("No se pudo conectar al Gateway Bluetooth");
      }

      setStatus("disconnected");
      return null;
    }
  };

  /**
   * 🔴 Desconectar del Gateway
   */
  const disconnectBLE = () => {
    setStatus("disconnected");
    setError(null);
    setGatewayStatus("unknown");

    localStorage.setItem("userDisconnected", "true");

    console.log("🔴 Desconectado del Gateway");
    console.log("ℹ️ El UID se mantiene guardado para futuras conexiones");
  };

  return {
    uid,
    status,
    connectBLE,
    disconnectBLE,
    error,
    gatewayStatus,
  };
};

export default useBluetooth;
