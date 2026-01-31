/**
 * Servicio Bluetooth centralizado
 * Gestiona conexión, desconexión y lectura básica BLE
 * Compatible con la API Web Bluetooth
 */

import { saveUserDeviceUID, getUserDeviceUID, sanitizeUID } from "./firebase";
import useSession from "../store/useSession"; // Store de sesión global (Zustand)

// Extensión de tipo para incluir métodos que TS no reconoce por defecto
interface ExtendedBluetoothDevice extends BluetoothDevice {
  addEventListener: (
    type: "gattserverdisconnected",
    listener: (this: BluetoothDevice, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ) => void;
}

let bluetoothDevice: ExtendedBluetoothDevice | null = null;
let gattServer: BluetoothRemoteGATTServer | null = null;

/**
 * 🕓 Espera hasta que el usuario esté disponible en el store o en localStorage.
 * @returns {userUUID, username} - UUID del usuario y username para logging
 */
async function waitForUser(timeoutMs = 3000): Promise<{userUUID: string; username: string} | null> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const session = useSession.getState();
    const userUUID = session.user?.uid || localStorage.getItem("userId");
    const username = session.user?.username || localStorage.getItem("username");

    if (userUUID && username) return { userUUID, username };

    // Espera un poco antes de volver a comprobar
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}

/**
 * Conecta con un dispositivo BLE, arranca la simulación de datos y devuelve su UID.
 * NO navega al dashboard; eso lo hace Connecting.tsx con router.push("/dashboard").
 */
export async function connectBLEDevice(): Promise<string | null> {
  try {
    console.log("🔍 Iniciando búsqueda de dispositivos BLE...");

    // Verificar compatibilidad del navegador
    if (!navigator.bluetooth) {
      throw new Error("Tu navegador no soporta la API Web Bluetooth.");
    }

    // Permitir todos los dispositivos BLE (para pruebas)
    const device = (await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "battery_service",
        "heart_rate",
        "device_information",
        "health_thermometer",
        "weight_scale",
      ],
    })) as ExtendedBluetoothDevice;

    if (!device) {
      throw new Error("No se seleccionó ningún dispositivo BLE.");
    }

    console.log("✅ Dispositivo seleccionado:", device.name || "sin nombre");

    // Conectar al servidor GATT
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error("No se pudo conectar al servidor GATT.");
    }

    console.log("🔗 Conectado al servidor GATT");
    bluetoothDevice = device;
    gattServer = server;

    // Escuchar desconexión inesperada
    device.addEventListener("gattserverdisconnected", onDisconnected);

    // Esperar a que el usuario esté listo
    const user = await waitForUser();

    if (!user) {
      console.warn(
        "⚠️ No se encontró el usuario después del tiempo de espera."
      );
      return null; // Evita iniciar simulación sin usuario
    }

    const { userUUID, username } = user;
    console.log(`👤 Usuario detectado correctamente: ${username} (UUID: ${userUUID})`);

    // 🔑 Usar el UID REAL del dispositivo Bluetooth
    const realDeviceUID = device.id || device.name || "unknown-device";

    // Sanitizar para Firestore usando función centralizada
    const detectedUID = sanitizeUID(realDeviceUID);
    console.log(`🔒 UID detectado del dispositivo BLE: ${detectedUID}`);

    // 🔍 Verificar si el usuario ya tiene un UID guardado en Firestore
    const savedUID = await getUserDeviceUID(userUUID);

    if (savedUID) {
      console.log(`📌 UID ya guardado en Firestore: ${savedUID}`);

      // 🔄 Comparar UID detectado vs UID guardado
      if (savedUID !== detectedUID) {
        console.warn(`⚠️ ADVERTENCIA: El dispositivo conectado (${detectedUID}) es DIFERENTE al registrado (${savedUID})`);
        console.warn(`⚠️ Se usará el UID ya guardado: ${savedUID}`);
        console.warn(`⚠️ Si deseas cambiar de dispositivo, debes desvincular el anterior primero.`);

        // ✅ IMPORTANTE: Usar el UID GUARDADO, NO el detectado
        // Esto garantiza que los datos siempre vayan al mismo documento
        localStorage.setItem("deviceUID", savedUID);
        return savedUID;
      } else {
        console.log(`✅ Dispositivo coincide con el registrado: ${savedUID}`);
        localStorage.setItem("deviceUID", savedUID);
        return savedUID;
      }
    } else {
      // 🆕 Primera conexión - no hay UID guardado
      console.log(`🆕 Primera conexión del usuario ${username} (UUID: ${userUUID}) - guardando UID: ${detectedUID}`);

      // Guardar el UID en localStorage
      localStorage.setItem("deviceUID", detectedUID);

      // Guardar el UID en Firestore (vinculado al usuario)
      await saveUserDeviceUID(userUUID, detectedUID);
      console.log(`💾 UID guardado en Firestore`);

      return detectedUID;
    }

    // ✅ La simulación se iniciará automáticamente en DashboardApp.tsx
    // No se inicia aquí para evitar documentos duplicados en Firestore
  } catch (error: any) {
    if (error?.name === "NotFoundError") {
      console.warn("⚠️ Usuario canceló la selección de dispositivo BLE.");
      return null;
    }

    console.error("❌ Error al conectar BLE:", error?.message || error);
    return null;
  }
}

/**
 * Desconecta el dispositivo BLE si está conectado y limpia estado local.
 */
export async function disconnectBLEDevice(): Promise<void> {
  try {
    if (bluetoothDevice && bluetoothDevice.gatt?.connected) {
      console.log("🔌 Desconectando dispositivo BLE...");
      bluetoothDevice.gatt.disconnect();
    } else {
      console.log("ℹ️ No hay dispositivo BLE conectado.");
    }
  } catch (error) {
    console.error("❌ Error al desconectar BLE:", error);
  } finally {
    onDisconnected();
  }
}

/**
 * Maneja la desconexión (intencional o inesperada).
 * ⚠️ IMPORTANTE: NO elimina el deviceUID de localStorage para mantener persistencia
 */
function onDisconnected() {
  console.warn("⚠️ El dispositivo BLE se desconectó (o se limpió la conexión).");

  // Limpieza local de la conexión BLE
  bluetoothDevice = null;
  gattServer = null;

  // ❌ NO eliminar deviceUID - debe persistir para mantener el UID y contador de días
  // El UID solo debe eliminarse si el usuario desvincula manualmente su dispositivo
  // localStorage.removeItem("deviceUID");

  console.log("🧩 Conexión BLE limpiada (UID preservado en localStorage).");
}
